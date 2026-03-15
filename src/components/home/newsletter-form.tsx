"use client";

import { useState } from "react";
import { addSubscriber } from "@/lib/email-marketing";
import { trackLead } from "@/lib/facebook-pixel";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      addSubscriber(email, "newsletter", { tags: ["footer_signup"] });
      trackLead();
      setSubmitted(true);
      setEmail("");
    }
  };

  if (submitted) {
    return (
      <p className="text-primary font-medium">Thanks for subscribing! Check your inbox for confirmation.</p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email address"
        required
        className="flex-1 px-4 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary-hover transition-colors shrink-0"
      >
        Subscribe
      </button>
    </form>
  );
}
