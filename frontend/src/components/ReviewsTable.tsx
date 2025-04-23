// src/components/ReviewsTable.tsx
import { format } from 'date-fns'; // For formatting dates

// Re-use or import the type
type ReviewDisplayData = {
  id: string;
  text: string | null;
  review_date: string | null;
  metadata: any;
  sentiment_score: number | null;
  classification_label: string | null;
};

interface ReviewsTableProps {
  reviews: ReviewDisplayData[];
}

export default function ReviewsTable({ reviews }: ReviewsTableProps) {
  if (!reviews || reviews.length === 0) {
    return <p>No reviews found.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white rounded shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Review Text</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sentiment</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Classification</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rating</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.map((review) => (
            <tr key={review.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {review.review_date ? format(new Date(review.review_date), 'PP') : 'N/A'}
              </td>
              <td className="px-6 py-4 text-sm text-gray-900">{review.text}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.sentiment_score ?? 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.classification_label ?? 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{review.metadata?.rating ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
