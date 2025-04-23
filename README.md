# Review Insider

**AI-Powered Google Review Analysis Dashboard**

## Project Overview

Review Insider is a full-stack application designed to help small businesses gain actionable insights from their Google Reviews. It automatically ingests reviews, performs AI-driven analysis (sentiment, topics, classification), and presents the findings in an easy-to-understand web dashboard. This project fulfills the requirements for the AI Engineer Internship assessment, demonstrating skills in building lightweight AI prototypes using low-code/no-code principles, APIs, and modern web technologies.

## Features

*   **Automated Review Ingestion:** Automatically pulls new reviews (simulated via Google Sheets & Google Apps Script).
*   **Sentiment Analysis:** Assigns a sentiment score (1-5) and a summary sentence to each review using Google Gemini.
*   **Sentiment Trend Visualization:** Displays sentiment scores over time on a line chart (Overview page).
*   **Topic Extraction:** Identifies key themes and topics discussed across reviews using Google Gemini (triggered manually via API endpoint).
*   **Topic Visualization:** Displays extracted topics as a list and an interactive word cloud (Topics page).
*   **Review Classification:** Categorizes reviews by predefined labels (e.g., Service, Location, Product) using Google Gemini.
*   **Negative Experience Alerts:** Flags reviews with low sentiment scores (<=2) and displays them in near real-time (Alerts page using Supabase Realtime).
*   **Weekly Summary Reports:** Generates formatted Markdown summaries of the week's reviews, including good/bad breakdown, key phrases, and action items (triggered manually via API endpoint, stored in Supabase).
*   **Filterable Review Table:** Allows viewing raw reviews along with their associated sentiment, classification, and rating (Reviews page).
*   **Vector Embeddings:** Generates embeddings for each review using Google Gemini and stores them in both Supabase (pgvector) and Pinecone for potential future RAG/semantic search capabilities.

## Tech Stack

*   **Frontend:**
    *   Framework: Next.js (App Router)
    *   Language: TypeScript
    *   Styling: Tailwind CSS
    *   Charting: Chart.js, react-chartjs-2
    *   Markdown Rendering: react-markdown
    *   Word Cloud: react-wordcloud
    *   Realtime: Supabase Realtime JS Client
*   **Backend:**
    *   Framework: Flask
    *   Language: Python
    *   AI Orchestration: LangChain (Chains, Prompts)
    *   AI Models: Google Gemini API (via `google-genai` SDK) for text generation, classification, sentiment, and embeddings (`text-embedding-004`).
*   **Database:**
    *   Primary: Supabase (PostgreSQL) - Stores raw reviews, sentiments, classifications, topics, summaries, embeddings.
    *   Vector DB: Pinecone - Stores embeddings for fast similarity search.
*   **Automation:**
    *   Google Apps Script: Triggers ingestion webhook and scheduled tasks (topic/summary generation).
*   **Deployment (Target):**
    *   Vercel (Frontend + Backend Serverless Functions)
*   **Local Development:**
    *   ngrok: Exposes local backend for webhook testing.

## Architecture & Workflow

1.  **Ingestion:**
    *   A Google Apps Script trigger (time-driven or on edit) reads new rows from a designated Google Sheet.
    *   The script formats the data into a JSON payload.
    *   It sends a POST request to the backend's `/webhook/reviews` endpoint (exposed via ngrok locally, or Vercel URL in production).
2.  **Backend Processing (`/webhook/reviews`):**
    *   The Flask app receives the review data.
    *   It inserts the raw review into the Supabase `reviews` table.
    *   It calls the embedding chain (`chains/embedding.py`):
        *   Gets embedding vector from Gemini (`text-embedding-004`).
        *   Upserts the vector to Pinecone.
        *   Inserts the vector and metadata into the Supabase `embeddings` table.
    *   It calls the sentiment chain (`chains/sentiment.py`):
        *   Gets score (1-5) and summary from Gemini.
        *   Inserts results into the Supabase `sentiments` table.
    *   It calls the classification chain (`chains/classification.py`):
        *   Gets a category label from Gemini.
        *   Inserts the label into the Supabase `classifications` table.
    *   Flask responds `200 OK`.
3.  **Scheduled Tasks (Topics/Summary):**
    *   A separate Google Apps Script time-driven trigger (e.g., daily/weekly) sends a POST request to `/tasks/run-topic-extraction` or `/tasks/run-weekly-summary`.
    *   The corresponding Flask endpoint calls the appropriate chain (`chains/topic.py` or `chains/summary.py`).
    *   These chains fetch relevant data from Supabase (`reviews`), query Gemini, and store the results (`topics` or `weekly_summaries` tables in Supabase).
4.  **Frontend Display:**
    *   The Next.js application uses Server Components to fetch data directly from Supabase via the `supabase-js` client upon page load.
    *   Data is passed to React components for rendering (tables, charts, lists, markdown).
    *   The `/alerts` page uses Supabase Realtime subscriptions (`supabase-js`) to listen for new inserts in the `sentiments` table and dynamically updates the UI with negative reviews.

## Local Setup & Installation

1.  **Prerequisites:**
    *   Node.js (v18+) & npm
    *   Python (v3.9+) & pip
    *   Git
    *   Access keys/URLs for:
        *   Supabase (Project URL, Anon Key, Service Role Key)
        *   Pinecone (API Key, Environment, Index Name)
        *   Google Gemini API Key
    *   ngrok (for local webhook testing)
    *   Google Account (for Google Sheets & Apps Script)
2.  **Clone Repository:**
    ```bash
    git clone <your-repo-url>
    cd review-insight-pro
    ```
3.  **Backend Setup:**
    ```bash
    cd backend
    python3 -m venv .venv          # Create virtual environment
    source .venv/bin/activate     # Activate (use `.venv\Scripts\activate` on Windows)
    pip install -r requirements.txt # Install dependencies
    cd ..                         # Return to root
    ```
4.  **Frontend Setup:**
    ```bash
    cd frontend
    npm install                   # Install dependencies
    cd ..                         # Return to root
    ```
5.  **Environment Variables:**
    *   Create a `.env` file in the project root.
    *   Copy the contents of `.env.example` into `.env`.
    *   Fill in your actual API keys and URLs in the `.env` file:
        ```env
        # Supabase (ensure these match your project)
        SUPABASE_URL=your-supabase-url
        SUPABASE_SERVICE_ROLE_SECRET_KEY=your-supabase-service-role-key

        # Pinecone (ensure index dimension matches embedding model - e.g., 768 for text-embedding-004)
        PINECONE_API_KEY=your-pinecone-api-key
        PINECONE_ENV=your-pinecone-env
        PINECONE_INDEX=reviews-index # Or your index name

        # Gemini (Embeddings & LLM)
        GEMINI_API_KEY=your-gemini-api-key

        # Optional: Slack/SMTP for different alerting methods
        # SLACK_WEBHOOK_URL=...
        ```
    *   Create a `.env.local` file in the `frontend` directory (`frontend/.env.local`).
    *   Add your *public* Supabase keys:
        ```env
        # frontend/.env.local
        NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
        NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
        ```
6.  **Run Locally:**
    *   **Start Backend:** Open a terminal in the `backend` directory, activate venv (`source .venv/bin/activate`), and run `flask run`. (Usually runs on port 5000).
    *   **Start Frontend:** Open *another* terminal in the `frontend` directory and run `npm run dev`. (Usually runs on port 3000).
    *   **Start ngrok (for webhook):** Open a *third* terminal and run `ngrok http 5000` (or the port your backend is running on). Copy the `https` forwarding URL.
7.  **Configure Google Apps Script:**
    *   Set up the Google Sheet as described in the development steps.
    *   Create the Apps Script project attached to the sheet.
    *   Paste the code from the development steps into `Code.gs`.
    *   Run `setWebhookUrl()` after pasting your ngrok URL into the script.
    *   Run `resetLastProcessedRow()`.
    *   Set up the time-driven triggers for `processNewReviews` and `triggerWeeklySummary`.

## Usage

*   Access the deployed frontend URL.
*   Navigate through the pages (Overview, Reviews, Topics, Alerts, Reports).
*   Add new rows to the configured Google Sheet to ingest new reviews.
*   Manually trigger topic extraction or weekly summaries by sending POST requests to the deployed backend's `/api/tasks/run-topic-extraction` or `/api/tasks/run-weekly-summary` endpoints (e.g., using `curl` or Postman) until scheduled triggers are fully configured in a production environment.

