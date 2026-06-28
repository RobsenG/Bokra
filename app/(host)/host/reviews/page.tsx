import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { Star } from "lucide-react";

export default async function HostReviewsPage() {
  const session = await auth();
  if (!session?.user) return null;

  let reviews: any[] = [];
  try {
    reviews = await prisma.review.findMany({
      where: { property: { hostId: session.user.id } },
      orderBy: { createdAt: "desc" },
      include: {
        renter: { select: { name: true, email: true } },
        property: { select: { title: true } },
      },
    });
  } catch (error) {
    console.error("[DB Error] Could not fetch reviews:", error);
  }

  const avgRating =
    reviews.length > 0
      ? (reviews.reduce((s: number, r: any) => s + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-800 dark:text-white tracking-tight">Guest Reviews</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">Feedback from your guests.</p>
        </div>
        {avgRating && (
          <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-950/20 text-orange-600 dark:text-orange-400 px-3 py-1.5 rounded-xl font-bold text-sm border border-orange-100 dark:border-orange-900/30">
            <Star className="size-4 fill-orange-500 text-orange-500" />
            {avgRating} avg rating
          </div>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-2xl">
          <Star className="size-8 text-neutral-300 dark:text-neutral-600 mx-auto mb-2.5" />
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">No reviews yet</p>
          <p className="text-xs text-neutral-400 dark:text-neutral-500 mt-1">Reviews from guests will appear here after completed stays.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm p-5 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-sm text-neutral-800 dark:text-neutral-200">
                    {review.renter.name || review.renter.email}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">{review.property.title}</p>
                </div>
                <div className="flex items-center gap-0.5 shrink-0">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`size-3.5 ${i < review.rating ? "fill-orange-500 text-orange-500" : "text-neutral-200 dark:text-neutral-700"}`}
                    />
                  ))}
                </div>
              </div>
              {review.comment && (
                <p className="text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  "{review.comment}"
                </p>
              )}
              <p className="text-[10px] text-neutral-400 dark:text-neutral-500">
                {new Date(review.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
