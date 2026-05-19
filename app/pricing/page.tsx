'use client';

import { useState } from 'react';
import Link from 'next/link';
import PricingTable from '@/components/billing/pricing-table';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function PricingPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const faqItems = [
    {
      question: 'Can I change my plan anytime?',
      answer:
        'Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate charges accordingly.',
    },
    {
      question: 'Is there a free trial?',
      answer:
        'Absolutely. All paid plans come with a 14-day free trial. No credit card required to start.',
    },
    {
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major payment methods including Paystack, Stripe, bank transfers, and mobile money across Africa.',
    },
    {
      question: 'Do you offer discounts for annual billing?',
      answer:
        'Yes! Annual billing saves you 17% compared to monthly. That\'s two months free!',
    },
    {
      question: 'Is there a setup fee?',
      answer:
        'No setup fees. You only pay for the plan you choose. Cancel anytime with no penalties.',
    },
    {
      question: 'What if I need more submissions or storage?',
      answer:
        'All plans include add-ons for additional submissions, storage, and API calls. Purchase them as needed without changing your plan.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b bg-card sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Hamduk Forms
          </Link>
          <div className="flex gap-4">
            <Link href="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link href="/auth/signup">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <section className="text-center mb-20">
          <h1 className="text-5xl font-bold mb-6 text-balance">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-muted-foreground mb-8 text-balance max-w-2xl mx-auto">
            Choose the perfect plan for your needs. Start free, scale with confidence. 
            All plans include core form building, 1000+ field types, and AI-powered insights.
          </p>
        </section>

        {/* Pricing Table */}
        <PricingTable />

        {/* FAQ Section */}
        <section className="mt-24 mb-16">
          <h2 className="text-3xl font-bold text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {faqItems.map((item, index) => (
              <Card key={index} className="p-6">
                <h3 className="text-lg font-semibold mb-4">{item.question}</h3>
                <p className="text-muted-foreground">{item.answer}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-primary-foreground rounded-xl p-12 text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-lg mb-8 opacity-90">
            Join thousands of organizations using Hamduk Forms to create powerful forms.
          </p>
          <Link href="/auth/signup">
            <Button 
              size="lg" 
              variant="secondary"
              className="bg-white text-primary hover:bg-gray-100"
            >
              Get Started Free
            </Button>
          </Link>
        </section>

        {/* Trust Section */}
        <section className="text-center">
          <p className="text-muted-foreground mb-6">
            Trusted by organizations across Africa
          </p>
          <div className="flex flex-wrap justify-center gap-6 opacity-50">
            <span className="font-semibold">500+ Companies</span>
            <span>•</span>
            <span className="font-semibold">50,000+ Forms</span>
            <span>•</span>
            <span className="font-semibold">1M+ Submissions</span>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-card mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="font-bold mb-4">Hamduk Forms</h3>
              <p className="text-sm text-muted-foreground">
                Africa's leading AI-powered form platform.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="#" className="hover:text-primary">Features</Link></li>
                <li><Link href="#" className="hover:text-primary">Security</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">About</Link></li>
                <li><Link href="#" className="hover:text-primary">Blog</Link></li>
                <li><Link href="#" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="#" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 Hamduk Forms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
