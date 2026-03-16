"use client";

import { useState } from "react";
import { Star, Send, X } from "lucide-react";

interface ReviewFormProps {
  listingId: string;
  productName: string;
}

export function ReviewForm({ listingId, productName }: ReviewFormProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a star rating");
      return;
    }
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          listing_id: listingId,
          rating,
          title: title.trim() || undefined,
          body: body.trim() || undefined,
          customer_name: name.trim() || undefined,
          customer_email: email.trim() || undefined,
        }),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        setError("Failed to submit review. Please try again.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors text-sm"
      >
        <Star size={16} />
        Write a Review
      </button>
    );
  }

  if (submitted) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <Star size={24} className="text-green-600 fill-green-600" />
        </div>
        <h3 className="font-bold text-green-800 mb-1">Thank you for your review!</h3>
        <p className="text-sm text-green-600">
          Your review for {productName} has been submitted and will appear after approval.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-border rounded-xl p-6 relative">
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <X size={16} className="text-gray-400" />
      </button>

      <h3 className="font-bold text-foreground mb-4">Review {productName}</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Star Rating */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Your Rating <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  size={28}
                  className={
                    star <= (hoverRating || rating)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-200"
                  }
                />
              </button>
            ))}
            {rating > 0 && (
              <span className="ml-2 text-sm text-muted-foreground self-center">
                {rating === 5 ? "Excellent!" : rating === 4 ? "Great" : rating === 3 ? "Good" : rating === 2 ? "Fair" : "Poor"}
              </span>
            )}
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Your Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Thabo M."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Email (optional, not displayed)
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Review Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Sum up your experience"
            maxLength={200}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary"
          />
        </div>

        {/* Body */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Your Review
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="What did you like or dislike about this product?"
            rows={4}
            maxLength={2000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1">{body.length}/2000</p>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded-lg">{error}</p>
        )}

        <button
          type="submit"
          disabled={submitting || rating === 0}
          className="w-full flex items-center justify-center gap-2 py-3 bg-primary text-white font-medium rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 text-sm"
        >
          {submitting ? (
            "Submitting..."
          ) : (
            <>
              <Send size={16} />
              Submit Review
            </>
          )}
        </button>
      </form>
    </div>
  );
}
