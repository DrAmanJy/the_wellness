import Link from 'next/link';
import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-wellness-navy text-wellness-light-green py-20">
      <div className="container mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-1">
            <Link
              href="/"
              className="text-3xl font-heading font-bold text-white tracking-tight block mb-6"
            >
              The Wellness<span className="text-wellness-green">.</span>
            </Link>
            <p className="text-wellness-light-green/70 text-sm leading-relaxed max-w-xs">
              Building a healthier tomorrow, today. Premium healthcare and wellness products backed
              by science.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-wellness-light-green/70">
              <li>
                <Link href="/about" className="hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/research" className="hover:text-white transition-colors">
                  Research
                </Link>
              </li>
              <li>
                <Link href="/quality" className="hover:text-white transition-colors">
                  Quality Standards
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition-colors">
                  Careers
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Products</h4>
            <ul className="space-y-4 text-sm text-wellness-light-green/70">
              <li>
                <Link href="/products" className="hover:text-white transition-colors">
                  All Products
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=wellness"
                  className="hover:text-white transition-colors"
                >
                  Wellness
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=supplements"
                  className="hover:text-white transition-colors"
                >
                  Vitamins & Supplements
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=immunity"
                  className="hover:text-white transition-colors"
                >
                  Immunity
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=personal-care"
                  className="hover:text-white transition-colors"
                >
                  Personal Care
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-6">Contact</h4>
            <ul className="space-y-4 text-sm text-wellness-light-green/70">
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>hello@thewellness.com</li>
              <li>1-800-WELLNESS</li>
              <li className="pt-4">
                <p>123 Science Way</p>
                <p>San Francisco, CA 94107</p>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-wellness-light-green/50">
          <p>&copy; {currentYear} The Wellness. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
