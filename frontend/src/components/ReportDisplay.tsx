// src/components/ReportDisplay.tsx
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // For GitHub Flavored Markdown (tables, etc.)
import { format } from 'date-fns';

type ReportData = {
  id: string;
  summary_text: string | null;
  generated_at: string | null;
};

interface ReportDisplayProps {
  report: ReportData;
}

export default function ReportDisplay({ report }: ReportDisplayProps) {
  if (!report?.summary_text) {
    return <p>Report content is empty.</p>;
  }

  return (
    <div className="bg-white p-6 rounded shadow prose max-w-none"> {/* prose class from Tailwind Typography */}
       <p className="text-sm text-gray-500 mb-4">
         Generated on: {report.generated_at ? format(new Date(report.generated_at), 'PPPp') : 'Unknown date'}
       </p>
       <ReactMarkdown remarkPlugins={[remarkGfm]}>
         {report.summary_text}
       </ReactMarkdown>
    </div>
  );
}
