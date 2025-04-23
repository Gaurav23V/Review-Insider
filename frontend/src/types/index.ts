// src/types/index.ts

// Define the expected structure of the metadata object
// Removed the index signature '[key: string]: any;'
export interface ReviewMetadata {
    rating?: number | null; // Optional number or null
    location?: string | null; // Optional string or null
    source?: string | null; // Optional string or null
    // Add other known optional fields here if necessary
  }
  
  // Other type definitions remain the same
  export type Sentiment = { score: number | null } | null;
  export type Classification = { label: string | null } | null;
  
  export interface ReviewDisplayData {
      id: string;
      text: string | null;
      review_date: string | null;
      metadata: ReviewMetadata | null;
      sentiment_score: number | null;
      classification_label: string | null;
  }
  
  export interface ReviewRow {
      id: string;
      text: string | null;
      review_date: string | null;
      metadata: ReviewMetadata | null;
      sentiments?: Sentiment[] | Sentiment | null;
      classifications?: Classification[] | Classification | null;
  }
  