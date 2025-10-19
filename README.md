## Motivational Quotes Generator

This web application generates motivational quotes in Spanish using Google Gemini, authenticates users via Threads (OAuth 2.0), and allows users to schedule posts to their Threads profile. The application is built with Next.js (App Router) and TypeScript, with MongoDB for data storage and GitLab CI for automation.

## Key Features

-   **Motivational Quote Generation**: Creates unique motivational quotes in Spanish using Google Gemini.
-   **User Authentication**: Securely authenticates users using their Threads account via OAuth 2.0.
-   **Scheduled Posts**: Allows users to schedule the automatic posting of generated quotes to their Threads profile.
-   **Post Automation**: A cron job checks every five minutes for scheduled posts and publishes them to Threads.
-   **Token Management**: Automatically refreshes user tokens to maintain authentication.
-   **Data Persistence**: Stores user data, prompts, quotes, and scheduled posts in a MongoDB database.
-   **Data De-duplication**: Avoids duplicate quotes by using a hashing and semantic similarity checking mechanism.
-   **Meta Data Deletion**: Includes an endpoint to handle data deletion requests from Meta.

## Tech Stack

-   **Framework**: Next.js (v15, App Router)
-   **Language**: TypeScript
-   **Database**: MongoDB + Mongoose
-   **Package Manager**: pnpm
-   **APIs**: Google Gemini, Threads
-   **Styling**: Tailwind CSS (v4) + PostCSS
-   **Testing**: Jest + React Testing Library
-   **Linting**: ESLint + Prettier
-   **Automation**: GitHub Actions for CI and scheduled jobs.

## Getting Started

### Prerequisites

-   Node.js v20.x or later
-   pnpm v8 or later
-   MongoDB instance

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-username/motivational-quotes.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd motivational-quotes
    ```
3.  Install dependencies:
    ```bash
    pnpm install
    ```
4.  Create a `.env.local` file by copying the example file:
    ```bash
    cp .env.example .env.local
    ```

### Configuration

Update the `.env.local` file with your credentials and configuration:

-   `GEMINI_API_KEY`: Your Google Gemini API key.
-   `MONGO_URI`: Your MongoDB connection string.
-   `CRON_SECRET`: A secret key to protect the cron job endpoints.
-   `NEXT_PUBLIC_BASE_URL`: The base URL of your application.
-   `NEXT_PUBLIC_CLIENT_ID`: Your Threads application client ID.
-   `CLIENT_SECRET`: Your Threads application client secret.
-   `NEXT_PUBLIC_API_STATE`: A state string for OAuth 2.0.

## Usage

To run the development server, use the following command:

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`.

## CI/CD

The project uses GitHub Actions for continuous integration and scheduled jobs:

-   **Continuous Integration**: The `ci.yml` workflow runs on every push and pull request to the `master` branch, installing dependencies and running tests.
-   **Refresh Tokens**: The `refresh-tokens.yml` workflow runs daily to refresh expiring user tokens.
-   **Check Scheduled Posts**: The `check-posts.yml` workflow runs every five minutes to check for and publish scheduled posts.

## Project Structure

The project follows a standard Next.js App Router structure:

-   `app/`: Contains the application's pages, API routes, and components.
-   `app/api/`: The API endpoints for the application.
-   `app/lib/`: Contains the application's core logic, including database actions, AI clients, and API clients.
-   `app/lib/database/models/`: The Mongoose models for the database.
-   `.github/workflows/`: The CI/CD workflows for the project.

## API Endpoints

| Method | Route                                 | Auth Required                        | Description                                             |
| ------ | ------------------------------------- | ------------------------------------ | ------------------------------------------------------- |
| GET    | `/api/threads/auth`                   | None (uses `code`)                   | Exchanges an authorization code for a long-lived token. |
| POST   | `/api/gemini-generate`                | Cookie                               | Generates a new quote using the active prompt.          |
| POST   | `/api/threads/refresh-tokens`         | Scheduled job (Authorization Header) | Refreshes all expiring long-lived tokens.               |
| POST   | `/api/threads/data-deletion-callback` | Meta Signature                       | Handles data deletion requests from Meta.               |
| POST   | `/api/check-scheduled-posts`          | Scheduled job (Authorization Header) | Checks for and publishes scheduled posts.               |
| GET    | `/api/auth/logout`                    | Cookie                               | Clears the user's session cookie to log them out.       |

## Data Models

-   **User**: Stores user information from Threads.
-   **Token**: Stores OAuth tokens for users.
-   **Prompt**: Stores user-defined prompts for quote generation.
-   **Quote**: Stores the generated quotes.
-   **ScheduledPost**: Stores information about scheduled posts.

## License

This project is licensed under the MIT License.