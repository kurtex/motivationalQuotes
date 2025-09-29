# Motivational Quote Generator

A Next.js App Router project that helps creators design short-form copy with Google Gemini and auto-publish it on Threads. Users authenticate through Threads OAuth, manage their prompts, and the platform schedules recurring posts for them.

## Key Features
- **Gemini-powered copy** – generate polished Spanish posts through Google Gemini.
- **Threads OAuth login** – secure exchange of short-lived codes for long-lived tokens.
- **Prompt management** – update the active prompt that guides future posts.
- **Automated publishing** – run scheduled Threads posts via GitLab jobs.
- **Data deletion compliance** – honour Meta’s callback for account removal.

## Tech Stack
- **Framework**: Next.js (App Router, TypeScript)
- **Styling**: Tailwind CSS + custom UI primitives
- **Database**: MongoDB Atlas via Mongoose
- **AI**: Google Gemini SDK
- **Scheduling**: GitLab CI/CD scheduled pipelines hitting API routes
- **Testing**: Jest + React Testing Library
- **Package manager**: pnpm

## Local Development
1. **Prerequisites**
   - Node.js 20+
   - pnpm 9+
   - MongoDB instance (Atlas or local)
   - Threads app credentials (App ID, App Secret)
   - Google Gemini API key

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment variables** – create `.env.local` with:
   | Variable | Purpose |
   | --- | --- |
   | `GEMINI_API_KEY` | Access token for the Gemini SDK. |
   | `MONGO_URI` | Connection string for the MongoDB cluster (database `user_tokens`). |
  | `CLIENT_SECRET` | Threads App Secret used for OAuth exchanges and Meta callbacks. |
  | `CRON_SECRET` | Shared secret checked by scheduled endpoints. |
  | `TOKEN_ENCRYPTION_KEY` | Base64-encoded 32-byte key used to encrypt stored Threads tokens. |
   | `NEXT_PUBLIC_CLIENT_ID` | Threads App ID exposed to the browser for OAuth. |
   | `NEXT_PUBLIC_BASE_URL` | Public origin that builds redirect URLs. |
   | `NEXT_PUBLIC_API_STATE` | Random string that validates OAuth callbacks. |
   | `NEXT_PUBLIC_SUPPORT_EMAIL` | Address shown in the data deletion page. |

4. **Run dev server**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000 and complete the Threads login to generate prompts.

5. **Run tests**
   ```bash
   pnpm test
   ```

## Threads & OAuth Configuration
1. In Meta’s developer dashboard:
   - Enable **Web OAuth Login**.
   - Add `https://<tu-dominio>/redirect` (local: `http://localhost:3000/redirect`) to **Valid OAuth Redirect URIs** – it must match `NEXT_PUBLIC_BASE_URL` + `/redirect`.
   - Register the data deletion URL `https://<tu-dominio>/api/threads/data-deletion-callback`.
2. Copy the App ID and App Secret into `NEXT_PUBLIC_CLIENT_ID` and `CLIENT_SECRET`.
3. Choose a strong `NEXT_PUBLIC_API_STATE` value and reuse it across client/server to reject forged callbacks.

## MongoDB Atlas Setup
- Create a database user with read/write access to the cluster.
- Allow Vercel IPs or `0.0.0.0/0` in the Atlas network rules.
- Use the provided connection string as `MONGO_URI`; the application selects the `user_tokens` database automatically.

## Deployment on Vercel
1. Import the Git repository and configure the same environment variables listed above in the Production and Preview environments.
2. Ensure `NEXT_PUBLIC_BASE_URL` matches the live domain (e.g., `https://motivational-quotes.vercel.app`).
3. Vercel serves over HTTPS by default, which lets the OAuth flow persist the secure Threads cookie.

## Security Notes
- Never commit `.env*` files or share secret values outside the deployment pipeline.
- Rotate `CRON_SECRET`, `CLIENT_SECRET`, `GEMINI_API_KEY`, and `TOKEN_ENCRYPTION_KEY` if you suspect exposure.
- Limit GitLab schedules and Atlas database users to the minimal roles/IPs needed for automation.

## Scheduled Automation (GitLab CI/CD)
Create two scheduled pipelines under **CI/CD → Schedules** that run small `curl` jobs against the deployed API. Both must include the shared `CRON_SECRET` value.

| Purpose | Endpoint | Headers | Recommended cron |
| --- | --- | --- | --- |
| Refresh expiring Threads tokens | `POST https://<tu-dominio>/api/threads/refresh-tokens` | `Authorization: Bearer $CRON_SECRET` | `0 3 * * *` |
| Publish queued posts | `POST https://<tu-dominio>/api/check-scheduled-posts` | `Authorization: Bearer $CRON_SECRET` | `* * * * *` |

Both endpoints return 401 unless the Bearer token matches `CRON_SECRET`.

## Useful Scripts
- `pnpm dev` – start the dev server with Turbopack.
- `pnpm build` – create a production build.
- `pnpm start` – serve the production build.
- `pnpm lint` – run ESLint & Prettier.
- `pnpm test` – execute the Jest suite.

## Directory Highlights
- `app/` – App Router routes, API handlers, server actions.
- `app/components/` – dashboard UI, authentication flows, reusable primitives.
- `app/lib/` – Gemini client, database models/actions, Threads API helpers.
- `tests/` – integration tests for API routes.

With Threads credentials, MongoDB connectivity, and GitLab schedules in place, the application can continuously generate Gemini copy and publish it to Threads without manual intervention.
