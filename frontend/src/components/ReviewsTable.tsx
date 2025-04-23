// src/components/ReviewsTable.tsx
import { format } from 'date-fns';
// Import the shared type
import type { ReviewDisplayData } from '@/types';

interface ReviewsTableProps {
  reviews: ReviewDisplayData[];
}

export default function ReviewsTable({ reviews }: ReviewsTableProps) {
  if (!reviews || reviews.length === 0) {
    // Message might be better handled by the parent component
    // depending on whether it's empty due to no data or filtering
    return <p className="text-center text-gray-500 py-4">No reviews to display.</p>;
  }

  // Function to determine sentiment color (keep as is)
  const getSentimentColor = (score: number | null): string => {
    if (score === null) return 'text-gray-500';
    if (score <= 2) return 'text-red-600 font-medium';
    if (score === 3) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="shadow-md rounded-lg overflow-x-auto bg-white">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Review Text</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Sentiment</th>
            <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Classification</th>
            <th scope="col" className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Rating</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {reviews.map((review) => (
            <tr key={review.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                {review.review_date ? format(new Date(review.review_date), 'PP') : 'N/A'}
              </td>
              <td className="px-4 py-3 text-sm text-gray-800 min-w-[300px]">{review.text}</td>
              <td className={`px-4 py-3 whitespace-nowrap text-sm text-center ${getSentimentColor(review.sentiment_score)}`}>
                {review.sentiment_score ?? 'N/A'}
              </td>
               <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                 {review.classification_label ? (
                   <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                     {review.classification_label}
                   </span>
                 ) : 'N/A'}
               </td>
              {/* Accessing metadata.rating is now type-safe */}
              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{review.metadata?.rating ?? 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
