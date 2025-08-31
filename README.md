# Motivational Quote Generator

[![Continuous Integration](https://github.com/jjvillarreal/motivational-quotes/actions/workflows/ci.yml/badge.svg)](https://github.com/jjvillarreal/motivational-quotes/actions/workflows/ci.yml)

A modern web application built with Next.js that generates unique motivational quotes in Spanish using the Google Gemini API. It includes user authentication via Threads, stores data in MongoDB, and features an automated system for user token management.

## ✨ Key Features

- **AI Content Generation**: Creates original, high-quality motivational quotes in Spanish using Google Gemini.
- **Post Scheduling**: Allows users to schedule when their generated quotes should be published.
- **Social Authentication**: Secure integration with the Threads API for user registration and login (OAuth 2.0).
- **Persistent Database**: Stores users, prompts, quotes, and post schedules in MongoDB.
- **Automated Tasks**: Uses Vercel Cron Jobs to handle token refreshes and scheduled posting.
- **Data Deletion**: Implements the required Meta endpoint for users to request deletion of their data.

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **External APIs**:
  - [Google Gemini API](https://ai.google.dev/)
  - [Threads API](https://developers.facebook.com/docs/threads)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Testing**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)
- **Automation**: [Vercel Cron Jobs](https://vercel.com/docs/cron-jobs)

---

## 🚀 Getting Started

Follow these steps to set up and run the project in your local environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20.x)
- [pnpm](https://pnpm.io/)
- A [MongoDB](https://www.mongodb.com/) instance (local or cloud)
- A configured Threads App for OAuth credentials.

### 1. Clone the Repository

```bash
git clone https://github.com/jjvillarreal/motivational-quotes.git
cd motivational-quotes
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root and add the following variables.

| Variable | Description |
| :--- | :--- |
| `GEMINI_API_KEY` | Your API key for Google Gemini. |
| `MONGODB_URI` | Connection URI for your MongoDB database. |
| `CLIENT_SECRET` | The '''App Secret''' from your Threads application. |
| `CRON_SECRET` | A strong, random secret to protect automated task endpoints. |
| `NEXT_PUBLIC_CLIENT_ID` | The '''App ID''' from your Threads application. |
| `NEXT_PUBLIC_BASE_URL`| The base URL of your application (e.g., `http://localhost:3000`). |
| `NEXT_PUBLIC_API_STATE` | A random string to prevent CSRF attacks in the OAuth flow. |
| `NEXT_PUBLIC_SUPPORT_EMAIL` | Public email for support and data deletion requests. |

### 4. Run the Application

```bash
pnpm dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

### 5. Run Tests

```bash
pnpm test
```

---

## ⚙️ Automated Tasks (Vercel Cron Jobs)

This project relies on Vercel Cron Jobs to handle all automated and scheduled tasks, ensuring the application runs autonomously. The configuration is defined in the `vercel.json` file.

- **Token Refresh**: A cron job runs daily to refresh expiring Threads API tokens, ensuring user sessions remain active.
  - **Endpoint**: `POST /api/threads/refresh-tokens`
  - **Schedule**: Runs once a day (`0 3 * * *`).

- **Scheduled Post Publishing**: A cron job runs every minute to check for and publish any posts that users have scheduled.
  - **Endpoint**: `POST /api/check-scheduled-posts`
  - **Schedule**: Runs every minute (`* * * * *`).

To protect these endpoints, ensure the `CRON_SECRET` environment variable is configured correctly in your Vercel project settings.
