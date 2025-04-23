// src/app/reviews/page.tsx
import { supabase } from "@/lib/supabaseClient";
import ReviewsTable from "@/components/ReviewsTable";
// Import types from the central location
import type { ReviewDisplayData, ReviewRow } from "@/types";

export default async function ReviewsPage() {
  const { data, error } = await supabase
    .from("reviews")
    .select(
      `
      id,
      text,
      review_date,
      metadata,
      sentiments ( score ),
      classifications ( label )
    `
    )
    .order("review_date", { ascending: false })
    .limit(50);

  if (error) {
    console.error("Error fetching reviews:", error);
    // Consider returning an error component or throwing the error
    // for Next.js error handling mechanisms (error.tsx)
  }

  // Process data to flatten nested results
  const reviews: ReviewDisplayData[] =
    (data as ReviewRow[] | undefined)?.map((r) => ({
      id: r.id,
      text: r.text,
      review_date: r.review_date,
      metadata: r.metadata, // Already typed as ReviewMetadata | null in ReviewRow
      sentiment_score: Array.isArray(r.sentiments)
        ? r.sentiments[0]?.score ?? null
        : r.sentiments?.score ?? null, // Simplified access assuming object or null
      classification_label: Array.isArray(r.classifications)
        ? r.classifications[0]?.label ?? null
        : r.classifications?.label ?? null, // Simplified access
    })) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reviews</h1>
      {/* Pass error state to UI or use Next.js error boundaries */}
      {error && <p className="text-red-500">Error loading reviews: {error.message}</p>}
      {!error && <ReviewsTable reviews={reviews} />}
      {/* TODO: Add filtering/pagination controls */}
    </div>
  );
}
