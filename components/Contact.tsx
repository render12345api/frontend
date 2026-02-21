'use client';

export default function Contact() {
  return (
    <div className="space-y-6">
      <div className="neumorphic-card bg-card">
        <h2 className="text-2xl font-bold mb-4">Contact & Support</h2>
        
        <div className="space-y-6">
          {/* Email */}
          <div>
            <h3 className="font-bold mb-2">Email Support</h3>
            <p className="text-muted-foreground mb-2">For inquiries, support, or partnership opportunities:</p>
            <a href="mailto:support@smsburst.in" className="text-primary hover:underline font-medium">
              support@smsburst.in
            </a>
          </div>

          {/* Telegram */}
          <div>
            <h3 className="font-bold mb-2">Telegram</h3>
            <p className="text-muted-foreground mb-2">Join our community for updates and support:</p>
            <a href="https://t.me/smsburst" className="text-primary hover:underline font-medium">
              @smsburst
            </a>
          </div>

          {/* Phone */}
          <div>
            <h3 className="font-bold mb-2">Phone</h3>
            <p className="text-muted-foreground mb-2">Call us during business hours (9 AM - 6 PM IST):</p>
            <a href="tel:+919876543210" className="text-primary hover:underline font-medium">
              +91 9876543210
            </a>
          </div>

          {/* FAQ */}
          <div>
            <h3 className="font-bold mb-2">Frequently Asked Questions</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="font-semibold text-foreground">How are credits calculated?</p>
                <p className="text-muted-foreground">1 credit = 1 message. Each SMS sent deducts 1 credit from your account.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Can I get a refund?</p>
                <p className="text-muted-foreground">Refunds are processed within 7 business days. Contact support for details.</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">How do I report abuse?</p>
                <p className="text-muted-foreground">Report any suspicious activity to support@smsburst.in with full details.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
