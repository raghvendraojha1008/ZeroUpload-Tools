import { ShieldCheck, Lock, EyeOff, Cookie } from 'lucide-react'
import { usePageMeta } from '../lib/usePageMeta'
import { Breadcrumbs } from '../components/Breadcrumbs'

export function PrivacyPolicy() {
  usePageMeta({
    title: 'Privacy Policy — ZeroUpload Tools',
    description: 'Learn how ZeroUpload Tools protects your data with 100% client-side in-browser processing and zero cloud retention.',
    path: '/privacy',
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: 'Privacy Policy' }]} />

      <div className="mt-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
          <ShieldCheck className="size-3.5" />
          Client-Side Privacy Guarantee
        </div>
        <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-slate-100">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Last updated: November 2026
        </p>

        <div className="mt-8 space-y-8 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <section className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Lock className="size-5 text-indigo-500" />
              1. Zero Server Uploads (Your Data Stays on Your Device)
            </h2>
            <p className="mt-3">
              Unlike traditional online converters that upload your confidential files, spreadsheets, API tokens, or logs to remote cloud servers, <strong>ZeroUpload Tools processes 100% of your data inside your local browser tab</strong> using the HTML5 File API and client-side JavaScript.
            </p>
            <p className="mt-2">
              Your files and input strings are never transmitted across the network, never saved on a backend disk, and never accessible to us or any third party. Once you close your browser tab, your data is cleared from your computer's RAM.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <EyeOff className="size-5 text-indigo-500" />
              2. Information We Do Not Collect
            </h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>We do not collect or store your uploaded CSVs, JSON data, or text inputs.</li>
              <li>We do not require user accounts, passwords, or personal login information.</li>
              <li>We do not record, store, or transmit decoded JWT tokens or regular expression strings.</li>
            </ul>
          </section>

          <section className="space-y-3">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
              <Cookie className="size-5 text-indigo-500" />
              3. Cookies & Advertising Partners
            </h2>
            <p>
              To keep our tools 100% free forever without subscriptions or paywalls, we may display third-party advertisements (such as Google AdSense). Third-party advertising vendors, including Google, use cookies to serve ads based on prior visits to this or other websites.
            </p>
            <p>
              Google's use of advertising cookies enables it and its partners to serve ads based on your visit to our site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting{' '}
              <a
                href="https://www.google.com/settings/ads"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-indigo-600 underline dark:text-indigo-400"
              >
                Google Ad Settings
              </a>.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              4. Local Storage
            </h2>
            <p>
              We use standard browser <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs text-slate-800 dark:bg-slate-800 dark:text-slate-200">localStorage</code> exclusively to remember your UI theme preference (dark mode vs. light mode). No personal data or tracking identifiers are stored.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              5. Contact Us
            </h2>
            <p>
              If you have any questions or feedback regarding our privacy practices, please contact us at{' '}
              <span className="font-mono text-indigo-600 dark:text-indigo-400">support@zeroupload.tools</span>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
