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
      <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-sm font-medium">
        Thank you! Your review has been published.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white dark:bg-neutral-900 border border-neutral-100 dark:border-neutral-800 rounded-2xl p-6 shadow-sm">
      <h3 className="font-bold text-neutral-800 dark:text-neutral-200">Leave a Review</h3>
      
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-neutral-500">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none focus:ring-2 focus:ring-orange-500 rounded-full transition-colors"
            >
              <Star
                className={`size-6 ${
                  star <= rating ? "fill-orange-500 text-orange-500" : "text-neutral-300 dark:text-neutral-700"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          Your Comment
        </label>
        <textarea
          id="comment"
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-4 rounded-xl border border-neutral-200 dark:border-neutral-750 bg-transparent text-sm focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 outline-none transition-all text-neutral-800 dark:text-neutral-100 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-teal-600 hover:bg-teal-700 active:bg-teal-800 text-white shadow-md shadow-teal-600/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? "Posting..." : "Submit Review"}
      </button>
    </form>
  );
}
