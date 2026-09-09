"use client";

import { useState } from "react";
import { postReview } from "./actions";
import { Star } from "lucide-react";

export default function ReviewForm({ propertyId }: { propertyId: string }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await postReview(propertyId, rating, comment);
      setSuccess(true);
      setComment("");
      setRating(5);
    } catch (err: any) {
      setError(err.message || "Failed to post review.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl text-emerald-800 dark:text-emerald-300 text-sm font-medium">
        Thank you! Your review has been published.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-[#12121e] border border-neutral-200 dark:border-neutral-800 rounded-2xl p-6 shadow-sm font-sans">
      <h3 className="font-bold text-neutral-900 dark:text-white text-lg">Leave a Review</h3>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-600 dark:text-red-300 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none focus:ring-2 focus:ring-[#b8943d]/20 dark:focus:ring-[#c9a84c]/20 rounded-full transition-colors cursor-pointer"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating ? "fill-amber-500 text-amber-500" : "text-neutral-300 dark:text-neutral-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
          Your Comment
        </label>
        <textarea
          id="comment"
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#1a1a2e] text-sm text-neutral-900 dark:text-white focus:border-[#b8943d] dark:focus:border-[#c9a84c] focus:ring-2 focus:ring-[#b8943d]/20 outline-none transition-all resize-none placeholder:text-neutral-400"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#b8943d] hover:bg-[#a38233] dark:bg-[#c9a84c] dark:hover:bg-[#b8943d] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-sm transition-all duration-200 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Posting..." : "Submit Review"}
      </button>
    </form>
  );
}
