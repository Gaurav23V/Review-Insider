// src/app/alerts/page.tsx
"use client";

import { supabase } from '@/lib/supabaseClient';
import AlertsList from '@/components/AlertsList';
import { useState, useEffect } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';

// Export the type if needed by AlertsList (though it's also defined there)
export type AlertData = {
  review_id: string;
  text: string | null;
  review_date: string | null;
  score: number | null;
};

export default function AlertsPage() {
  const NEGATIVE_THRESHOLD = 2;
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    console.log("Fetching initial alerts...");

    // Define types for the expected response structure
    type ReviewEmbed = { id: string; text: string | null; review_date: string | null };
    // Type for the main item fetched from sentiments, including the nested review object
    type SentimentWithReview = { score: number | null; reviews: ReviewEmbed | null }; // reviews is an OBJECT

    const { data, error: fetchError } = await supabase
      .from('sentiments')
      .select(`
        score,
        reviews!inner ( id, text, review_date )
      `) // !inner ensures reviews is not null
      .lte('score', NEGATIVE_THRESHOLD)
      .order('created_at', { ascending: false }) // Order by sentiment creation time
      .limit(50);

    if (fetchError) {
      console.error("Error fetching alerts:", fetchError);
      setError("Failed to load alerts.");
      setAlerts([]);
    } else {
      // --- CORRECTED MAPPING ---
      const processedAlerts: AlertData[] = (data as unknown as SentimentWithReview[] | null)
        ?.filter(item => item.reviews) // Extra safety check, though !inner should guarantee it
        .map(item => ({
          // Access properties directly on the nested reviews OBJECT
          review_id: item.reviews!.id as string, // Use non-null assertion '!' because !inner join guarantees it exists
          text: item.reviews!.text ?? null,
          review_date: item.reviews!.review_date ?? null,
          score: item.score
        })) ?? [];
      // --- END CORRECTION ---

      console.log("Fetched alerts:", processedAlerts);
      setAlerts(processedAlerts);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAlerts();

    console.log("Setting up Supabase Realtime subscription...");
    const channel: RealtimeChannel = supabase
      .channel('sentiments-alerts-channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'sentiments' },
        async (payload) => {
          console.log('Realtime INSERT received:', payload);
          const newSentiment = payload.new as { score: number; review_id: string };

          if (newSentiment.score <= NEGATIVE_THRESHOLD) {
            console.log(`New negative sentiment detected (score: ${newSentiment.score}), fetching details...`);
            const { data: reviewData, error: reviewError } = await supabase
              .from('reviews')
              .select('id, text, review_date')
              .eq('id', newSentiment.review_id)
              .single();

            if (reviewError) {
              console.error("Error fetching review details for new alert:", reviewError);
            } else if (reviewData) {
              const newAlert: AlertData = {
                review_id: reviewData.id,
                text: reviewData.text,
                review_date: reviewData.review_date,
                score: newSentiment.score,
              };
              console.log("Adding new alert to state:", newAlert);
              setAlerts((currentAlerts) => [newAlert, ...currentAlerts]);
            }
          }
        }
      )
      .subscribe((status, err) => {
         if (status === 'SUBSCRIBED') console.log('Successfully subscribed to sentiments channel!');
         if (status === 'CHANNEL_ERROR') { console.error('Realtime channel error:', err); setError('Realtime connection failed.'); }
         if (status === 'TIMED_OUT') { console.warn('Realtime connection timed out.'); setError('Realtime connection timed out.'); }
      });

    return () => {
      console.log("Unsubscribing from Supabase Realtime channel...");
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Negative Experience Alerts (Score &lt;= {NEGATIVE_THRESHOLD})</h1>
      {loading && <p>Loading alerts...</p>}
      {error && <p className="text-red-500">{error}</p>}
      {!loading && !error && <AlertsList alerts={alerts} />}
    </div>
  );
}
