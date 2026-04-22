"use client";

import Link from "next/link";
import { SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { 
  Sprout, 
  FileText, 
  Share2, 
  Mail, 
  Sparkles,
  ArrowRight,
  Zap,
  CheckCircle2,
  Globe
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FFFBEB]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-[#E7E5E4]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sprout className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#431407]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Sprout
              </span>
            </div>
            <SignInButton>
              <Button 
                variant="ghost" 
                className="text-[#431407] hover:text-amber-600 hover:bg-amber-50"
              >
                Sign In
              </Button>
            </SignInButton>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-amber-200/30 rounded-full blur-3xl" />
          <div className="absolute bottom-20 left-10 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl" />
          <div className="absolute top-40 left-1/3 w-48 h-48 bg-teal-200/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 border border-amber-200 mb-8">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                Powered by Google Gemini 2.0
              </span>
            </div>

            {/* Headline */}
            <h1 
              className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#431407] mb-6 leading-tight"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Plant one idea.
              <br />
              <span className="text-gradient">Watch it grow.</span>
            </h1>

            {/* Subheadline */}
            <p className="max-w-2xl mx-auto text-xl text-[#78716C] mb-10 leading-relaxed">
              Transform a single topic into a thriving ecosystem of content. 
              Generate blog posts, social media, email newsletters, and SEO metadata 
              — all in one magical flow.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SignInButton>
                <Button 
                  size="lg"
                  className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-8 py-6 text-lg rounded-xl shadow-soft-lg transition-all duration-300 hover:scale-105"
                >
                  Start Creating Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
              <Link href="#how-it-works">
                <Button 
                  variant="outline"
                  size="lg"
                  className="border-[#D6D3D1] text-[#431407] hover:bg-amber-50 px-8 py-6 text-lg rounded-xl"
                >
                  See How It Works
                </Button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-[#78716C] text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Free forever tier</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-teal-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Demo Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative bg-white rounded-3xl shadow-soft-lg p-8 border border-[#E7E5E4]">
            {/* Header */}
            <div className="flex items-center justify-center mb-8">
              <div className="px-6 py-3 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl border border-amber-200">
                <span className="text-lg font-medium text-[#7C2D12]">
                  &quot;The Future of AI in Content Marketing&quot;
                </span>
              </div>
            </div>

            {/* Content Flow */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              {/* Source */}
              <div className="md:col-span-1 flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-3 shadow-lg">
                  <Zap className="w-8 h-8 text-white" />
                </div>
                <span className="text-sm font-medium text-[#431407]">Your Topic</span>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <ArrowRight className="w-6 h-6 text-amber-400" />
              </div>

              {/* Generated Content Cards */}
              <div className="md:col-span-3 grid grid-cols-2 gap-3">
                <div className="p-4 bg-[#FFFBEB] rounded-xl border border-amber-200">
                  <FileText className="w-5 h-5 text-amber-600 mb-2" />
                  <span className="text-xs font-medium text-[#431407]">Blog Post</span>
                  <p className="text-xs text-[#78716C] mt-1">1,200+ words</p>
                </div>
                <div className="p-4 bg-teal-50 rounded-xl border border-teal-200">
                  <Share2 className="w-5 h-5 text-teal-600 mb-2" />
                  <span className="text-xs font-medium text-[#431407]">Social Posts</span>
                  <p className="text-xs text-[#78716C] mt-1">5 platforms</p>
                </div>
                <div className="p-4 bg-orange-50 rounded-xl border border-orange-200">
                  <Mail className="w-5 h-5 text-orange-600 mb-2" />
                  <span className="text-xs font-medium text-[#431407]">Newsletter</span>
                  <p className="text-xs text-[#78716C] mt-1">HTML + Plain</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                  <Globe className="w-5 h-5 text-purple-600 mb-2" />
                  <span className="text-xs font-medium text-[#431407]">SEO Meta</span>
                  <p className="text-xs text-[#78716C] mt-1">Optimized</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="mt-8 pt-8 border-t border-[#E7E5E4] grid grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-[#431407]" style={{ fontFamily: 'var(--font-playfair)' }}>25s</div>
                <div className="text-sm text-[#78716C]">Generation Time</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#431407]" style={{ fontFamily: 'var(--font-playfair)' }}>4x</div>
                <div className="text-sm text-[#78716C]">Content Pieces</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-[#431407]" style={{ fontFamily: 'var(--font-playfair)' }}>100%</div>
                <div className="text-sm text-[#78716C]">AI-Powered</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-[#431407] mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              One seed. Infinite possibilities.
            </h2>
            <p className="text-lg text-[#78716C] max-w-2xl mx-auto">
              Our multi-agent AI pipeline transforms your ideas into a complete content ecosystem 
              in seconds, not hours.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-soft card-lift border border-[#E7E5E4]">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center mb-6 shadow-lg">
                <Zap className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#431407] mb-3">
                Start with an Idea
              </h3>
              <p className="text-[#78716C] leading-relaxed">
                Enter any topic or paste an existing article. Our AI understands context, 
                tone, and your content goals instantly.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-soft card-lift border border-[#E7E5E4]">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mb-6 shadow-lg">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#431407] mb-3">
                AI Magic Happens
              </h3>
              <p className="text-[#78716C] leading-relaxed">
                Four specialized AI agents work in parallel, generating blog posts, 
                social content, newsletters, and SEO metadata simultaneously.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group relative bg-white rounded-2xl p-8 shadow-soft card-lift border border-[#E7E5E4]">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg">
                <Share2 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-xl font-bold text-[#431407] mb-3">
                Publish Everywhere
              </h3>
              <p className="text-[#78716C] leading-relaxed">
                Edit, customize, and publish to Twitter, LinkedIn, Facebook, Instagram, 
                Medium, and email — all from one dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Content Types Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 
              className="text-3xl sm:text-4xl font-bold text-[#431407] mb-4"
              style={{ fontFamily: 'var(--font-playfair)' }}
            >
              Everything you need to grow
            </h2>
            <p className="text-lg text-[#78716C]">
              From one seed, we generate a complete content garden
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Blog Posts */}
            <div className="p-6 rounded-2xl bg-[#FFFBEB] border border-amber-200 hover:border-amber-300 transition-colors">
              <FileText className="w-8 h-8 text-amber-600 mb-4" />
              <h4 className="font-bold text-[#431407] mb-2">Blog Posts</h4>
              <p className="text-sm text-[#78716C]">
                1,000+ word articles with proper structure, headings, and engaging content
              </p>
            </div>

            {/* Social Media */}
            <div className="p-6 rounded-2xl bg-teal-50 border border-teal-200 hover:border-teal-300 transition-colors">
              <Share2 className="w-8 h-8 text-teal-600 mb-4" />
              <h4 className="font-bold text-[#431407] mb-2">Social Posts</h4>
              <p className="text-sm text-[#78716C]">
                Platform-optimized content for Twitter, LinkedIn, Facebook, Instagram, and Medium
              </p>
            </div>

            {/* Email */}
            <div className="p-6 rounded-2xl bg-orange-50 border border-orange-200 hover:border-orange-300 transition-colors">
              <Mail className="w-8 h-8 text-orange-600 mb-4" />
              <h4 className="font-bold text-[#431407] mb-2">Newsletters</h4>
              <p className="text-sm text-[#78716C]">
                Complete email campaigns with subject lines, preview text, and HTML templates
              </p>
            </div>

            {/* SEO */}
            <div className="p-6 rounded-2xl bg-purple-50 border border-purple-200 hover:border-purple-300 transition-colors">
              <Globe className="w-8 h-8 text-purple-600 mb-4" />
              <h4 className="font-bold text-[#431407] mb-2">SEO Metadata</h4>
              <p className="text-sm text-[#78716C]">
                Optimized titles, descriptions, keywords, and URL slugs for search engines
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-12 overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-60 h-60 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 
                className="text-3xl sm:text-4xl font-bold text-white mb-4"
                style={{ fontFamily: 'var(--font-playfair)' }}
              >
                Ready to grow your content?
              </h2>
              <p className="text-lg text-amber-100 mb-8 max-w-xl mx-auto">
                Join creators who are transforming one idea into endless content possibilities.
              </p>
              <SignInButton>
                <Button 
                  size="lg"
                  className="bg-white text-amber-600 hover:bg-amber-50 px-8 py-6 text-lg rounded-xl shadow-lg transition-all duration-300 hover:scale-105"
                >
                  Get Started Free
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </SignInButton>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[#E7E5E4]">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <Sprout className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-[#431407]" style={{ fontFamily: 'var(--font-playfair)' }}>
                Sprout
              </span>
            </div>
            <p className="text-sm text-[#78716C]">
              © 2024 Sprout. Grow your content ecosystem.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
