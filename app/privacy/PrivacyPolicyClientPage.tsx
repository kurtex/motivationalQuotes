'use client';

import { useRouter } from 'next/navigation';

export default function PrivacyPolicyClientPage() {
  const router = useRouter();

  return (
    <main className="bg-gray-50 dark:bg-gray-900 min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 md:p-12 relative">
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
          Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-700 dark:text-gray-300 prose prose-lg dark:prose-invert max-w-none">
          <p><strong>Last updated:</strong> October 28, 2025</p>

          <h2 className="text-xl font-semibold">1. Introduction</h2>
          <p>
            Welcome to our motivational quote generation application. Your privacy is very important to us. This Privacy Policy explains what data we collect, how we use and protect it, and your rights regarding it.
          </p>

          <h2 className="text-xl font-semibold">2. Information We Collect</h2>
          <p>
            To provide our services, we collect the following information when you authenticate using your Meta (Threads) account:
          </p>
          <ul className="list-disc list-inside">
            <li><strong>Meta User ID:</strong> We receive your unique Meta user identifier (`meta_user_id`) to create and manage your account in our application. We do not collect your real name, email, or other personal information from your profile.</li>
            <li><strong>Access Token:</strong> We securely store an access token that allows us to interact with the Threads API on your behalf (for example, to post the quotes you schedule). This token is stored encrypted.</li>
            <li><strong>User Prompts:</strong> We save the prompts or instructions you provide to generate the quotes.</li>
            <li><strong>Generated Quotes:</strong> We store the quotes that the artificial intelligence generates for you.</li>
            <li><strong>Scheduling Settings:</strong> If you use the scheduling feature, we save the settings (frequency, time, etc.) to perform automatic posts.</li>
          </ul>

          <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
          <p>
            We use the collected information exclusively for the following purposes:
          </p>
          <ul className="list-disc list-inside">
            <li>To allow the application to function, such as generating quotes and posting them to your Threads profile.</li>
            <li>To associate the prompts and generated quotes with your account.</li>
            <li>To manage the scheduling of automatic posts.</li>
            <li>To maintain and improve the security and performance of our services.</li>
          </ul>
          <p>We do not sell, share, or transfer your data to third parties.</p>

          <h2 className="text-xl font-semibold">4. Data Storage and Security</h2>
          <p>
            We take the security of your data very seriously. Access tokens are stored using strong encryption in our database. The rest of the information associated with your account is protected with the best security practices to prevent unauthorized access.
          </p>

          <h2 className="text-xl font-semibold">5. Data Deletion</h2>
          <p>
            You have full control over your data. You can request the complete deletion of your information from our systems by following the instructions on our <a href="/threads/delete" className="text-blue-600 dark:text-blue-400 hover:underline">data deletion page</a>.
          </p>

          <h2 className="text-xl font-semibold">6. Changes to this Privacy Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page. You are advised to review this page periodically for any changes.
          </p>

          <h2 className="text-xl font-semibold">7. Contact</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact the application administrator.
          </p>
        </div>
      </div>
    </main>
  );
}
