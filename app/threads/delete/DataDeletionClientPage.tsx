"use client";

import { useRouter } from 'next/navigation';

export default function DataDeletionClientPage({ username }: { username: string | null }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete all your data? This action cannot be undone.")) {
      try {
        const response = await fetch('/api/delete-user', {
          method: 'POST',
        });

        if (response.ok) {
          alert("Your data has been deleted successfully!");
          window.location.href = "/"; // Redirect to home page after deletion
        } else {
          const data = await response.json();
          alert(data.error || "Failed to delete user data. Please try again.");
        }
      } catch (error) {
        console.error("Failed to delete user data:", error);
        alert("Failed to delete user data. Please try again.");
      }
    }
  };

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen p-4">
      <div className="w-full max-w-6xl mx-auto space-y-4">

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 relative">
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-4 text-blue-600 dark:text-blue-400 hover:underline flex items-center cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-6 text-center pt-8">
            Delete Your Data
          </h1>

          <div className="space-y-6 text-gray-700 dark:text-gray-300">
            <p>
              We understand the importance of your privacy and offer you full control over your information. Below are the options to delete your data from our application.
            </p>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Option 1: Delete from the application</h2>
              <p>
                You can delete all your data directly from our application. Clicking the button below will permanently delete all data associated with your account, including your profile, prompts, and generated quotes. This action is irreversible.
              </p>
              <button
                onClick={handleDelete}
                className="mt-4 inline-block bg-red-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete My Data
              </button>
            </div>

            <div>
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Option 2: Delete the application (Recommended by Meta)</h2>
              <p>
                The easiest and fastest way to delete your data is to uninstall our application directly from your Meta account settings (Instagram or Threads).
              </p>
              <ol className="list-decimal list-inside mt-2 pl-4 space-y-1">
                <li>Go to your account settings in the Instagram or Threads application.</li>
                <li>Look for the &quot;Apps and websites&quot; section.</li>
                <li>Find our application in the list and select &quot;Remove&quot;.</li>
              </ol>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                By doing this, Meta will send us an automatic request to delete all data associated with your account. This process is irreversible and will be completed according to their policies.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              In accordance with Meta&apos;s platform policies, we will process your request and permanently delete all your information from our systems. You will receive a confirmation once the process is complete. This process is irreversible.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}