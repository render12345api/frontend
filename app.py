import json
import threading
import time
import os
import secrets
import hashlib
import requests
import pg8000
import pg8000.native
from urllib.parse import urlparse
from flask import Flask, request, jsonify, send_from_directory
from functools import wraps
from datetime import datetime, timedelta
import logging

app = Flask(__name__, static_folder='out', static_url_path='')
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# ─── Config ───────────────────────────────────────────────────────────────────
DB_URL       = os.environ.get("DATABASE_URL")
MASTER_KEY   = os.environ.get("MASTER_API_KEY", "smsburst12345")   # Admin API key
RATE_LIMIT   = int(os.environ.get("RATE_LIMIT_PER_MIN", 30))           # requests/min per key

# ─── DB connection ──────────────────────────────────────────────────────────
_db_params = None

def _parse_db_url():
    global _db_params
    if _db_params is not None:
        return _db_params
    if not DB_URL:
        return None
    try:
        u = urlparse(DB_URL)
        _db_params = {
            "host":     u.hostname,
            "port":     u.port or 5432,
            "database": u.path.lstrip("/"),
            "user":     u.username,
            "password": u.password,
            "ssl_context": True,
        }
        return _db_params
    except Exception as e:
        logging.error(f"DB URL parse error: {e}")
        return None

def get_db():
    params = _parse_db_url()
    if not params:
        return None
    try:
        conn = pg8000.connect(**params)
        conn.autocommit = False
        return conn
    except Exception as e:
        logging.error(f"DB connect error: {e}")
        return None

def release_db(conn):
    try:
        conn.close()
    except Exception:
        pass

# ─── DB Init ──────────────────────────────────────────────────────────────────
def init_db():
    if not DB_URL:
        logging.warning("DATABASE_URL not set — DB features disabled")
        return
    conn = get_db()
    if not conn:
        return
    try:
        cur = conn.cursor()
        # API Keys table (from backend)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS api_keys (
                id          SERIAL PRIMARY KEY,
                key_hash    TEXT UNIQUE NOT NULL,
                label       TEXT,
                role        TEXT DEFAULT 'user',
                rate_limit  INTEGER DEFAULT 30,
                created_at  TIMESTAMP DEFAULT NOW(),
                last_used   TIMESTAMP,
                is_active   BOOLEAN DEFAULT TRUE
            )
        """)
        # Blacklist table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS blacklist (
                id       SERIAL PRIMARY KEY,
                phone    TEXT UNIQUE,
                added_at TIMESTAMP DEFAULT NOW()
            )
        """)
        # Jobs table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS jobs (
                id          SERIAL PRIMARY KEY,
                job_id      TEXT UNIQUE,
                api_key_id  INTEGER REFERENCES api_keys(id),
                targets     TEXT,
                mode        TEXT,
                delay       FLOAT DEFAULT 0.4,
                max_requests INTEGER DEFAULT 100,
                sent_count  INTEGER DEFAULT 0,
                status      TEXT DEFAULT 'running',
                logs        TEXT DEFAULT '[]',
                started_at  TIMESTAMP DEFAULT NOW(),
                updated_at  TIMESTAMP DEFAULT NOW()
            )
        """)
        # Rate log table
        cur.execute("""
            CREATE TABLE IF NOT EXISTS rate_log (
                id         SERIAL PRIMARY KEY,
                key_hash   TEXT,
                hit_at     TIMESTAMP DEFAULT NOW()
            )
        """)
        
        # Frontend tables (Users, Campaigns, Transactions)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                email VARCHAR(255) UNIQUE NOT NULL,
                password_hash VARCHAR(255) NOT NULL,
                credits INT DEFAULT 100,
                user_secret VARCHAR(255) UNIQUE NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS campaigns (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                description TEXT,
                render_service_id VARCHAR(255),
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        cur.execute("""
            CREATE TABLE IF NOT EXISTS credit_transactions (
                id SERIAL PRIMARY KEY,
                user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                amount INT NOT NULL,
                transaction_type VARCHAR(50) NOT NULL,
                description VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        cur.execute("CREATE INDEX IF NOT EXISTS idx_rate_log_key_time ON rate_log(key_hash, hit_at)")
        cur.execute("CREATE INDEX IF NOT EXISTS idx_jobs_job_id ON jobs(job_id)")
        conn.commit()
        cur.close()
        logging.info("DB initialized OK")

        # Auto-create admin key if none exist
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM api_keys")
        if cur.fetchone()[0] == 0:
            h = hashlib.sha256(MASTER_KEY.encode()).hexdigest()
            cur.execute(
                "INSERT INTO api_keys (key_hash, label, role, rate_limit) VALUES (%s, %s, %s, %s) ON CONFLICT DO NOTHING",
                (h, "master-admin", "admin", 999)
            )
            conn.commit()
            logging.info(f"Master admin key created")
        cur.close()
    except Exception as e:
        logging.error(f"DB init error: {e}")
    finally:
        release_db(conn)

init_db()

# ─── Auth & Rate Limiting ─────────────────────────────────────────────────────
def hash_key(raw: str) -> str:
    return hashlib.sha256(raw.strip().encode()).hexdigest()

def get_key_info(raw_key: str):
    conn = get_db()
    if not conn: return None
    try:
        h = hash_key(raw_key)
        cur = conn.cursor()
        cur.execute("SELECT id, role, rate_limit FROM api_keys WHERE key_hash=%s AND is_active=TRUE", (h,))
        row = cur.fetchone()
        if row:
            cur.execute("UPDATE api_keys SET last_used=NOW() WHERE key_hash=%s", (h,))
            conn.commit()
        cur.close()
        return row
    except Exception as e:
        logging.error(f"Auth error: {e}")
        return None
    finally:
        release_db(conn)

def check_rate_limit(raw_key: str, limit: int) -> bool:
    conn = get_db()
    if not conn: return True
    try:
        h = hash_key(raw_key)
        cur = conn.cursor()
        cur.execute("SELECT COUNT(*) FROM rate_log WHERE key_hash=%s AND hit_at > NOW() - INTERVAL '1 minute'", (h,))
        count = cur.fetchone()[0]
        if count >= limit:
            cur.close()
            return False
        cur.execute("INSERT INTO rate_log (key_hash) VALUES (%s)", (h,))
        cur.execute("DELETE FROM rate_log WHERE hit_at < NOW() - INTERVAL '5 minutes'")
        conn.commit()
        cur.close()
        return True
    except Exception as e:
        logging.error(f"Rate limit error: {e}")
        return True
    finally:
        release_db(conn)

def require_api_key(role="user"):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            raw_key = request.headers.get("X-API-Key", "").strip()
            if not raw_key:
                return jsonify({"error": "Missing X-API-Key header"}), 401

            # FIX: Direct check for MASTER_KEY
            if raw_key == MASTER_KEY:
                key_id, key_role, key_rate_limit = 0, "admin", 999
            else:
                info = get_key_info(raw_key)
                if not info:
                    return jsonify({"error": "Invalid or inactive API key"}), 403
                key_id, key_role, key_rate_limit = info

            if role == "admin" and key_role != "admin":
                return jsonify({"error": "Admin access required"}), 403

            if not check_rate_limit(raw_key, key_rate_limit):
                return jsonify({"error": "Rate limit exceeded", "limit": f"{key_rate_limit}/min"}), 429

            request.key_id   = key_id
            request.key_role = key_role
            return f(*args, **kwargs)
        return wrapper
    return decorator

# ─── API Routes (Backend) ─────────────────────────────────────────────────────

@app.route("/admin/keys", methods=["GET"])
@require_api_key(role="admin")
def list_keys():
    conn = get_db()
    if not conn: return jsonify({"error": "DB unavailable"}), 503
    try:
        cur = conn.cursor()
        cur.execute("SELECT id, label, role, rate_limit, is_active, created_at, last_used FROM api_keys ORDER BY id")
        rows = cur.fetchall()
        cur.close()
        return jsonify([{
            "id": r[0], "label": r[1], "role": r[2], "rate_limit": r[3],
            "is_active": r[4], "created_at": r[5].isoformat() if r[5] else None,
            "last_used": r[6].isoformat() if r[6] else None,
        } for r in rows])
    finally:
        release_db(conn)

@app.route("/admin/keys/create", methods=["POST"])
@require_api_key(role="admin")
def create_key():
    body = request.get_json(force=True, silent=True) or {}
    raw_key = secrets.token_urlsafe(32)
    key_hash = hash_key(raw_key)
    label = body.get("label", "unnamed")
    role = body.get("role", "user")
    rate_limit = int(body.get("rate_limit", RATE_LIMIT))
    conn = get_db()
    if not conn: return jsonify({"error": "DB unavailable"}), 503
    try:
        cur = conn.cursor()
        cur.execute("INSERT INTO api_keys (key_hash, label, role, rate_limit) VALUES (%s,%s,%s,%s) RETURNING id", (key_hash, label, role, rate_limit))
        key_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        return jsonify({"id": key_id, "api_key": raw_key, "label": label, "role": role, "rate_limit": rate_limit}), 201
    finally:
        release_db(conn)

# ─── Frontend Static Serving ──────────────────────────────────────────────────

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        # For Next.js static export, we serve index.html for client-side routing
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 10000)), threaded=True)
