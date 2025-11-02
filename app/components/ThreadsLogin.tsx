"use client"

import { Button } from "@/app/components/ui/button"
import { Lightbulb } from "lucide-react"
import Link from "next/link"
import { redirectURI } from "../lib/threads-api/auth-tokens/actions";

const THREADS_OPEN_WINDOW_BASE_URL = "https://www.threads.net";

export default function ThreadsLogin() {
  const initThreadsLogin = () => {
    const url = new URL("/oauth/authorize", THREADS_OPEN_WINDOW_BASE_URL);
    url.searchParams.append("client_id", process.env.NEXT_PUBLIC_CLIENT_ID!);
    url.searchParams.append("redirect_uri", redirectURI);
    url.searchParams.append("scope", "threads_basic,threads_content_publish");
    url.searchParams.append("response_type", "code");
    url.searchParams.append("state", process.env.NEXT_PUBLIC_API_STATE!);
    url.searchParams.append("auth_type", "reauthenticate");

    const finalUrl = url.toString();
    const popup = window.open(finalUrl, "_blank", "noopener,noreferrer");

    if (!popup) {
      window.location.assign(finalUrl);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900 flex items-center justify-center p-4">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-orange-200 dark:bg-orange-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-amber-200 dark:bg-amber-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-rose-200 dark:bg-rose-900/30 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />
      </div>

      {/* Main card container */}
      <div className="relative z-10 w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl dark:shadow-2xl dark:shadow-black/50 p-8 md:p-12 space-y-8 backdrop-blur-sm border border-white/20 dark:border-slate-700/50">
          {/* Logo section */}
          <div className="flex flex-col items-center space-y-6">
            {/* Motivational icon */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 rounded-full blur-xl opacity-40 dark:opacity-50" />
              <div className="relative bg-gradient-to-br from-amber-400 to-orange-500 dark:from-amber-500 dark:to-orange-600 p-6 rounded-full shadow-lg dark:shadow-lg dark:shadow-orange-900/50">
                <Lightbulb className="w-10 h-10 text-white" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <div className="text-center space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                Motivational Quotes
              </h1>
              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base font-medium">
                Inspire yourself daily with wisdom
              </p>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-slate-700 to-transparent" />

          {/* Action buttons */}
          <div className="space-y-4">
            {/* Primary button - Threads Login */}
            <Button
              onClick={initThreadsLogin}
              size="lg"
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 dark:from-amber-600 dark:to-orange-700 dark:hover:from-amber-700 dark:hover:to-orange-800 text-white font-semibold py-6 text-base shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Login with Threads
            </Button>

            {/* Divider text */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-slate-700" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-slate-800 text-gray-500 dark:text-gray-400">or</span>
              </div>
            </div>

            {/* Secondary button - Guest mode */}
            <Link href="/guest" className="block">
              <Button
                variant="outline"
                size="lg"
                className="w-full border-2 border-gray-300 dark:border-slate-600 hover:border-orange-400 dark:hover:border-orange-500 text-gray-700 dark:text-gray-200 hover:text-orange-600 dark:hover:text-orange-400 font-semibold py-6 text-base hover:bg-orange-50 dark:hover:bg-slate-700/50 transition-all duration-300 bg-transparent"
              >
                Continue as Guest
              </Button>
            </Link>
          </div>

          {/* Footer text */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Access inspiring quotes without creating an account
            </p>
          </div>
        </div>

        {/* Trust badges or additional info */}
        <div className="mt-8 flex justify-center gap-6 text-center">
          <div className="space-y-1">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">10K+</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Daily Quotes</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">500K+</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Active Users</p>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">4.9★</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">App Rating</p>
          </div>
        </div>
      </div>
    </main>
  )
}