// src/app/reviews/page.tsx
import { supabase } from "@/lib/supabaseClient";
import ReviewsTable from "@/components/ReviewsTable"; // Create this next

type ReviewDisplayData = {
  id: string;
  text: string | null;
  review_date: string | null;
  metadata: any;
  sentiment_score: number | null;
  classification_label: string | null;
};

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
    .order("review_date", { ascending: false }) // Show newest first
    .limit(50); // Limit initial load

  if (error) {
    console.error("Error fetching reviews:", error);
  }

  // Define types for nested relations
  type Sentiment = { score: number | null } | null;
  type Classification = { label: string | null } | null;
  type ReviewRow = {
    id: string;
    text: string | null;
    review_date: string | null;
    metadata: any;
    sentiments?: Sentiment[] | Sentiment | null;
    classifications?: Classification[] | Classification | null;
  };

  // Process data to flatten nested results
  const reviews: ReviewDisplayData[] =
    (data as ReviewRow[] | undefined)?.map((r) => ({
      id: r.id,
      text: r.text,
      review_date: r.review_date,
      metadata: r.metadata,
      // Access nested data carefully, handling potential nulls/arrays
      sentiment_score: Array.isArray(r.sentiments)
        ? r.sentiments[0]?.score ?? null
        : (r.sentiments as Sentiment)?.score ?? null,
      classification_label: Array.isArray(r.classifications)
        ? r.classifications[0]?.label ?? null
        : (r.classifications as Classification)?.label ?? null,
    })) ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Reviews</h1>
      {error && <p className="text-red-500">Error loading reviews.</p>}
      {!error && <ReviewsTable reviews={reviews} />}
      {/* TODO: Add filtering/pagination controls */}
    </div>
  );
}
