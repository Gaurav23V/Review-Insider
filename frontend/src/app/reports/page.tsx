// src/app/reports/page.tsx
import { supabase } from '@/lib/supabaseClient';
import ReportDisplay from '@/components/ReportDisplay'; // Create this next

type ReportData = {
  id: string;
  summary_text: string | null;
  generated_at: string | null;
};

export default async function ReportsPage() {
  // Fetch the single most recent summary
  const { data: report, error } = await supabase
    .from('weekly_summaries')
    .select('id, summary_text, generated_at')
    .order('generated_at', { ascending: false })
    .limit(1)
    .maybeSingle(); // Fetches one row or null, not an array

  if (error) {
    console.error("Error fetching report:", error);
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Latest Weekly Report</h1>
      {error && <p className="text-red-500">Error loading report.</p>}
      {!error && report && <ReportDisplay report={report} />}
      {!error && !report && <p>No weekly report has been generated yet. Trigger the summary task.</p>}
    </div>
  );
}
