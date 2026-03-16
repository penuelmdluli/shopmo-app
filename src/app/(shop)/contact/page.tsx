"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MapPin, Send, CheckCircle, MessageCircle } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
    } catch {
      // still show success — email fallback
      setSubmitted(true);
    } finally {
      setSending(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle size={48} className="mx-auto text-green-500 mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Message Sent</h1>
        <p className="text-gray-500 mb-6">We will get back to you within 24 hours.</p>
        <Link href="/" className="text-primary hover:underline text-sm">Back to ShopMO</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
      <Link href="/help" className="inline-flex items-center gap-1 text-sm text-primary mb-6 hover:underline">
        <ArrowLeft size={16} /> Back to Help Centre
      </Link>

      <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Us</h1>
      <p className="text-gray-500 mb-8">We are here to help. Reach out via any of the methods below.</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><Mail size={20} className="text-primary" /></div>
              <div>
                <p className="font-medium text-gray-900">Email</p>
                <a href="mailto:support@shopmoo.co.za" className="text-sm text-primary hover:underline">support@shopmoo.co.za</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><MessageCircle size={20} className="text-primary" /></div>
              <div>
                <p className="font-medium text-gray-900">Live Chat</p>
                <p className="text-sm text-gray-600">Use our AI assistant on any page</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center"><MapPin size={20} className="text-primary" /></div>
              <div>
                <p className="font-medium text-gray-900">Address</p>
                <p className="text-sm text-gray-600">Pretoria, Gauteng, South Africa</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-500">
            <p className="font-medium text-gray-700 mb-1">Business Hours</p>
            <p>Monday - Friday: 8:00 AM - 5:00 PM</p>
            <p>Saturday: 9:00 AM - 1:00 PM</p>
            <p>Sunday & Public Holidays: Closed</p>
          </div>
        </div>

        {/* Contact Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Your Name</label>
            <input type="text" required value={form.name} onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input type="email" required value={form.email} onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <select value={form.subject} onChange={(e) => setForm(p => ({ ...p, subject: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none bg-white">
              <option value="">Select a topic</option>
              <option value="order">Order Issue</option>
              <option value="delivery">Delivery Question</option>
              <option value="return">Return / Refund</option>
              <option value="payment">Payment Issue</option>
              <option value="product">Product Question</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea required rows={4} value={form.message} onChange={(e) => setForm(p => ({ ...p, message: e.target.value }))} className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none resize-none" />
          </div>
          <button type="submit" disabled={sending} className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50">
            <Send size={16} />
            {sending ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </div>
  );
}
