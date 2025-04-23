// src/components/AlertsList.tsx
import { format } from 'date-fns';

type AlertData = {
  review_id: string;
  text: string | null;
  review_date: string | null;
  score: number | null;
};

interface AlertsListProps {
  alerts: AlertData[];
}

export default function AlertsList({ alerts }: AlertsListProps) {
  if (!alerts || alerts.length === 0) {
    return <p>No negative reviews found matching the criteria.</p>;
  }

  return (
    <div className="space-y-4">
      {alerts.map((alert) => (
        <div key={alert.review_id} className="bg-red-50 border border-red-200 p-4 rounded shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-red-800">
              Score: {alert.score ?? 'N/A'}
            </span>
            <span className="text-xs text-gray-500">
              {alert.review_date ? format(new Date(alert.review_date), 'PPp') : 'N/A'}
            </span>
          </div>
          <p className="text-sm text-red-900">{alert.text ?? 'No text available.'}</p>
        </div>
      ))}
    </div>
  );
}
