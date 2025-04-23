// src/app/page.tsx

import { supabase } from '@/lib/supabaseClient';
import SentimentChart from '@/components/SentimentChart';
import { Suspense } from 'react'; // Using Suspense pattern from previous steps

// Keep type definition
type SentimentDataPoint = {
  review_date: string;
  score: number | null;
};

// --- Re-using Loading/Error components from previous step ---
function ChartLoadingSkeleton() {
    return <div className="animate-pulse bg-gray-200 rounded" style={{ height: '300px' }}></div>;
}
function ChartError() {
    return <p className="text-center text-red-500">Could not load sentiment data.</p>;
}
// --- End Loading/Error components ---


// --- Data Fetching Component ---
async function SentimentDataFetcher() {
  console.log("Fetching sentiment data for overview...");
  const { data: sentimentData, error } = await supabase
    .from('sentiments')
    .select(`
      score,
      reviews ( review_date )
    `)
    // Fetch a reasonable amount for a trend chart
    .limit(200);

  if (error) {
    console.error("Error fetching sentiment data:", error);
    return <ChartError />;
  }

  console.log("Raw sentiment data fetched:", sentimentData); // Log raw data

  // --- CORRECTED DATA PROCESSING ---
  const processedData = sentimentData
    ?.map(item => {
        // Define expected type for the nested reviews object
        type ReviewDateObj = { review_date: string | null } | null;
        // Access review_date directly from the reviews object
        const review_date = (item.reviews as unknown as ReviewDateObj)?.review_date;
        return {
            review_date: review_date, // Might be null if relation fails or date is null
            score: item.score
        };
    });

  console.log("Data after mapping:", processedData); // Log data after mapping

  // Filter out entries where review_date is null/undefined OR score is null
  const chartData = processedData
    ?.filter((item): item is SentimentDataPoint =>
        !!item.review_date && item.score !== null
     )
    // Sort by date
    .sort((a, b) => new Date(a.review_date).getTime() - new Date(b.review_date).getTime())
    ?? [];
  // --- END CORRECTION ---

  console.log("Final chartData:", chartData); // Log final data for chart

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500">No valid sentiment data available to display trend.</p>;
  }

  return <SentimentChart data={chartData} />;
}
// --- End Data Fetching Component ---


export default function Home() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-gray-700">Dashboard Overview</h1>
      <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-600">Sentiment Trend</h2>
        <Suspense fallback={<ChartLoadingSkeleton />}>
           <SentimentDataFetcher />
        </Suspense>
      </div>
      {/* Add more overview components here later */}
    </div>
  );
}
