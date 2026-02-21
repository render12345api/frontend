'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-muted border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-secondary opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary opacity-5 rounded-full blur-3xl"></div>
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-primary">SMSBurst</div>
          <nav className="hidden md:flex gap-8">
            <a href="#features" className="text-foreground hover:text-primary transition">Features</a>
            <a href="#pricing" className="text-foreground hover:text-primary transition">Pricing</a>
          </nav>
          <div className="flex gap-3">
            <Link href="/auth/login" className="px-4 py-2 text-foreground hover:text-primary transition">
              Login
            </Link>
            <Link href="/auth/signup" className="neumorphic-button bg-primary text-primary-foreground">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
          Launch SMS Bursts <br />
          <span className="text-primary">Instantly</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          SMSBurst makes it effortless to launch with easy interface and affordable plans!
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/auth/signup" className="neumorphic-button bg-primary text-primary-foreground text-lg">
            Start Free Trial
          </Link>
          <button className="neumorphic-button bg-card text-foreground border-2 border-primary text-lg">
            Watch Demo
          </button>
        </div>

        {/* Hero Stats */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { label: 'Users', value: '1000+' },
            { label: 'Services Launched', value: '50K+' },
            { label: 'Uptime', value: '99.9%' }
          ].map((stat, i) => (
            <div key={i} className="neumorphic-card bg-card">
              <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
              <div className="text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">Why Choose SMSBurst?</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            {
              title: 'Simple Interface',
              description: 'Intuitive dashboard designed for both beginners and advanced users',
              icon: '⚡'
            },
            {
              title: 'Affordable Credits',
              description: 'Pay only for what you use with our transparent credit system',
              icon: '💰'
            },
            {
              title: 'Instant Deployment',
              description: 'Launch your services in seconds with zero configuration',
              icon: '🚀'
            },
            {
              title: '24/7 Support',
              description: 'Our team is always ready to help you succeed',
              icon: '🛡️'
            },
          ].map((feature, i) => (
            <div key={i} className="neumorphic-card bg-card hover:shadow-lg transition-shadow">
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold mb-16 text-center">Simple Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              name: 'Starter',
              credits: 100,
              price: '100',
              features: ['100 Credits', 'Email Support', 'Basic Analytics'],
            },
            {
              name: 'Pro',
              credits: 500,
              price: '400',
              features: ['500 Credits', 'Priority Support', 'Advanced Analytics', 'API Access'],
              popular: true,
            },
            {
              name: 'Enterprise',
              credits: 2000,
              price: '1200',
              features: ['2000 Credits', '24/7 Support', 'Custom Integration', 'Dedicated Manager'],
            },
          ].map((plan, i) => (
            <div
              key={i}
              className={`neumorphic-card transition-all ${
                plan.popular ? 'bg-primary text-primary-foreground ring-2 ring-primary scale-105' : 'bg-card'
              }`}
            >
              {plan.popular && <div className="text-sm font-bold mb-3 bg-primary-foreground/20 w-fit px-3 py-1 rounded-full">Most Popular</div>}
              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="text-4xl font-bold mb-1">₹{plan.price}</div>
              <div className={`text-sm mb-6 ${plan.popular ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {plan.credits} credits
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-2">
                    <span className="text-primary">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className={`w-full neumorphic-button ${
                plan.popular
                  ? 'bg-primary-foreground text-primary'
                  : 'bg-secondary text-secondary-foreground'
              }`}>
                Choose Plan
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="neumorphic-card bg-gradient-to-br from-primary/10 to-secondary/10 border-2 border-primary/20">
          <h2 className="text-4xl font-bold mb-4">Ready to Launch?</h2>
          <p className="text-lg text-muted-foreground mb-8">Join thousands of developers using SMSBurst</p>
          <Link href="/auth/signup" className="neumorphic-button bg-primary text-primary-foreground text-lg inline-block">
            Get Started Free - 100 Credits
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-muted-foreground">
          <p>&copy; 2024 SMSBurst. All rights reserved.</p>
        </div>
      </footer>
    </main>
  );
}
