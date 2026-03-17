'use client';

import Link from 'next/link';
import { useAuth } from './providers';
import { Button } from '@/components/ui/button';

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="border-b bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
            <div className="text-2xl font-bold text-primary">Hamduk Forms</div>
            <div className="flex gap-4">
              <Link href="/dashboard">
                <Button variant="outline">Dashboard</Button>
              </Link>
              <Link href="/auth/logout">
                <Button variant="ghost">Logout</Button>
              </Link>
            </div>
          </div>
        </nav>
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Welcome, {user.email}!</h1>
            <p className="text-xl text-gray-600 mb-8">
              You're logged in to Hamduk Forms. Start creating powerful forms now.
            </p>
            <Link href="/dashboard">
              <Button size="lg">Go to Dashboard</Button>
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-primary">Hamduk Forms</div>
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

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-20">
            <h1 className="text-5xl font-bold mb-6 text-balance">
              Build Powerful Forms in Minutes
            </h1>
            <p className="text-xl text-gray-600 mb-8 text-balance">
              Hamduk Forms is Africa's leading form platform. Create surveys, quizzes, 
              registrations, and payments with AI-powered insights. No code required.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/auth/signup">
                <Button size="lg">Get Started Free</Button>
              </Link>
              <Link href="#features">
                <Button variant="outline" size="lg">Learn More</Button>
              </Link>
            </div>
          </div>

          {/* Features Preview */}
          <div id="features" className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">🎨</div>
              <h3 className="text-xl font-semibold mb-2">40+ Field Types</h3>
              <p className="text-gray-600">
                Text, email, phone, date, file uploads, signatures, ratings, and more.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">🤖</div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered</h3>
              <p className="text-gray-600">
                Get insights, auto-generate questions, and analyze responses with AI.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="text-xl font-semibold mb-2">Accept Payments</h3>
              <p className="text-gray-600">
                Built-in Stripe and Paystack integration for seamless payments.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">📊</div>
              <h3 className="text-xl font-semibold mb-2">Advanced Analytics</h3>
              <p className="text-gray-600">
                Real-time insights, completion rates, and response analysis.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">🌍</div>
              <h3 className="text-xl font-semibold mb-2">Africa-Optimized</h3>
              <p className="text-gray-600">
                Designed for low bandwidth, offline-first, and local languages.
              </p>
            </div>

            <div className="p-6 border rounded-lg">
              <div className="text-3xl mb-3">🔗</div>
              <h3 className="text-xl font-semibold mb-2">Integrations</h3>
              <p className="text-gray-600">
                Connect to Zapier, Make, Slack, Google Sheets, and 100+ apps.
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary text-white py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-bold mb-6">Ready to get started?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of creators building forms with Hamduk
            </p>
            <Link href="/auth/signup">
              <Button size="lg" variant="outline" className="text-primary">
                Create Your First Form Today
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/features" className="hover:text-primary">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-primary">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-primary">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-primary">About</Link></li>
                <li><Link href="/blog" className="hover:text-primary">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-primary">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-primary">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Follow</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><a href="#" className="hover:text-primary">Twitter</a></li>
                <li><a href="#" className="hover:text-primary">LinkedIn</a></li>
                <li><a href="#" className="hover:text-primary">GitHub</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 Hamduk Forms. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
