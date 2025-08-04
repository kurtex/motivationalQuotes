# Motivational Quote Generator

[![Continuous Integration](https://github.com/jjvillarreal/motivational-quotes/actions/workflows/ci.yml/badge.svg)](https://github.com/jjvillarreal/motivational-quotes/actions/workflows/ci.yml)

A modern web application built with Next.js that generates unique motivational quotes in Spanish using the Google Gemini API. It includes user authentication through the Threads API and an automated system for token management.

## ✨ Key Features

- **AI Content Generation:** Creates original, high-quality motivational quotes.
- **Social Authentication:** Secure integration with the Threads API for user registration and login.
- **Persistent Database:** Stores users and generated quotes in MongoDB.
- **Automated Token Management:** A robust system that automatically refreshes Threads API tokens to keep user sessions active.
- **Data Deletion:** Implements the required Meta endpoint for users to request deletion of their data.
- **Easy Deployment:** Optimized for easy deployment on platforms like Vercel.

## 🛠️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **Database:** [MongoDB](https://www.mongodb.com/) with [Mongoose](https://mongoosejs.com/)
- **External APIs:**
  - [Google Gemini API](https://ai.google.dev/)
  - [Threads API](https://developers.facebook.com/docs/threads)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Testing:** [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/)
- **Automation:** [GitHub Actions](https://github.com/features/actions)

---

## 🚀 Getting Started

Follow these steps to set up and run the project in your local environment.

### Prerequisites

- [Node.js](https://nodejs.org/) (version 20 or higher)
- [pnpm](https://pnpm.io/) (recommended), npm, or yarn
- A [MongoDB](https://www.mongodb.com/) instance (local or cloud)

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

Create a `.env` file in the project root and add the following variables. You can use the `.env.example` file as a guide if it exists.

```env
# Google Gemini API Key
GEMINI_API_KEY="YOUR_GEMINI_KEY"

# Connection URI for your MongoDB database
MONGO_URI="mongodb://localhost:27017/database_name"

# Secret to protect the cron job endpoint
CRON_SECRET="A_STRONG_AND_RANDOM_SECRET"

# Threads API Credentials
NEXT_PUBLIC_CLIENT_ID="YOUR_THREADS_CLIENT_ID"
CLIENT_SECRET="YOUR_THREADS_CLIENT_SECRET"

# The base URL of your application
NEXT_PUBLIC_BASE_URL="http://localhost:3000"

# A random string to use for the OAuth state
NEXT_PUBLIC_API_STATE="A_RANDOM_STRING"

# The email address for support requests
NEXT_PUBLIC_SUPPORT_EMAIL="YOUR_SUPPORT_EMAIL"
```

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

## ⚙️ Automated Tasks (Cron Job)

The application uses a cron job system to automatically refresh Threads API access tokens, which expire every 60 days.

This process is managed by a **GitHub Action** defined in `.github/workflows/refresh_tokens.yml`.

The GitHub Action runs daily and securely calls the `POST /api/threads/refresh-tokens` endpoint to refresh tokens that are about to expire.

### Production Configuration

For the GitHub Action to work correctly in your repository, you must configure the following **Secrets** in the `Settings > Secrets and variables > Actions` section of your repository:

- `PRODUCTION_URL`: The base URL of your application in production (e.g., `https://my-app.vercel.app`).
- `CRON_SECRET`: The same value you used in your `.env` file.

---

## 🚢 Deployment

The easiest way to deploy this application is using the [Vercel platform](https://vercel.com/new), from the creators of Next.js.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fjjvillarreal%2Fmotivational-quotes)

Don't forget to set up the environment variables in your Vercel project before deploying.

## 🤝 Contributions

Contributions are welcome. If you have an idea or find a bug, please open an *issue* or submit a *pull request*.