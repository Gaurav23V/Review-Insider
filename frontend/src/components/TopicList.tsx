// src/components/TopicsList.tsx

type TopicData = {
  topic_id: string;
  label: string | null;
};

interface TopicsListProps {
  topics: TopicData[];
}

export default function TopicsList({ topics }: TopicsListProps) {
  if (!topics || topics.length === 0) {
    return <p>No topics extracted yet. Run the topic extraction task.</p>;
  }

  return (
    <div className="bg-white p-4 rounded shadow">
      <ul className="list-disc list-inside space-y-2">
        {topics.map((topic) => (
          <li key={topic.topic_id} className="text-gray-700">
            {topic.label ?? 'Unnamed Topic'}
          </li>
        ))}
      </ul>
    </div>
  );
}
