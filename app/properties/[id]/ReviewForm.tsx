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
      <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm font-medium">
        Thank you! Your review has been published.
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-[0_1px_3px_0_rgb(0_0_0_/_0.08)] font-sans">
      <h3 className="font-bold text-[#111827] text-lg">Leave a Review</h3>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-xs font-semibold">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className="focus:outline-none focus:ring-2 focus:ring-[#7c3aed]/20 rounded-full transition-colors cursor-pointer"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= rating ? "fill-amber-500 text-amber-500" : "text-[#e5e7eb]"
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="comment" className="block text-xs font-semibold uppercase tracking-wider text-[#6b7280]">
          Your Comment
        </label>
        <textarea
          id="comment"
          required
          rows={3}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-4 rounded-xl border border-[#e5e7eb] bg-white text-sm text-[#111827] focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/20 outline-none transition-all resize-none placeholder-[#6b7280]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-[#7c3aed] hover:bg-[#5b21b6] active:bg-[#4c1d95] text-white font-semibold text-sm px-5 py-2.5 rounded-xl shadow-[0_4px_14px_0_rgb(124_58_237_/0.25)] hover:shadow-[0_6px_20px_0_rgb(124_58_237/_0.35)] transition-all duration-200 disabled:opacity-50 cursor-pointer"
      >
        {loading ? "Posting..." : "Submit Review"}
      </button>
    </form>
  );
}
