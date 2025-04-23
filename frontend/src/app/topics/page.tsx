// src/app/topics/page.tsx
import { supabase } from '@/lib/supabaseClient';
import TopicsList from '@/components/TopicList'; // Create this next

type TopicData = {
  topic_id: string;
  label: string | null;
};

export default async function TopicsPage() {
  // Fetch distinct topics, ordered perhaps by creation time or label
  const { data: topics, error } = await supabase
    .from('topics')
    .select('topic_id, label')
    // Optional: Add ordering if desired
    .order('created_at', { ascending: false })
    .limit(50); // Limit number of topics shown

  if (error) {
    console.error("Error fetching topics:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Top Topics</h1>
      {error && <p className="text-red-500">Error loading topics.</p>}
      {!error && <TopicsList topics={topics ?? []} />}
      {/* TODO: Implement word cloud visualization */}
    </div>
  );
}
