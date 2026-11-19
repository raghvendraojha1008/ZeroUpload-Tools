import { useEffect, useMemo, useState } from 'react'
import {
  Braces,
  Clock,
  Fingerprint,
  KeyRound,
  Lock,
  ShieldCheck,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { JsonLd } from '../components/FaqAccordion'
import { ErrorBanner } from '../components/ErrorBanner'
import { AdSlot } from '../components/AdSlot'
import { CopyButton } from '../components/CopyButton'
import { Panel } from '../components/Panel'
import { StatStrip } from '../components/StatStrip'
import { ToolGuide, buildAppSchema, buildFaqSchema } from '../components/ToolGuide'
import { ToolHeader } from '../components/ToolHeader'
import { claimRows, decodeJwt, expiryInfo } from '../features/jwt-decoder/jwt'
import { makeSampleToken } from '../features/jwt-decoder/sample'
import {
  FAQ_ITEMS,
  PRIVACY_INTRO,
  PRIVACY_POINTS,
  STEPS,
} from '../features/jwt-decoder/content'
import { PAGE_META } from '../lib/pageMeta'
import { usePageMeta } from '../lib/usePageMeta'

const FAQ_SCHEMA = buildFaqSchema(FAQ_ITEMS)
const APP_SCHEMA = buildAppSchema({
  name: 'JWT Decoder',
  description:
    'Decode JWT headers and payloads, read registered claims and watch expiry countdowns entirely in your browser. Nothing is uploaded or verified.',
  features: [
    'Base64url header and payload decoding',
    'Live expiry countdown',
    'Registered claim labels',
    'Audience and issuer inspection',
    'Client-side processing',
  ],
})

function JsonBlock({ value }: { value: string }) {
  return (
    <pre className="scroll-slim max-h-[340px] overflow-auto rounded-lg border border-slate-200 bg-slate-50 p-3.5 font-mono text-[11.5px] leading-relaxed text-slate-800 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200">
      {value}
    </pre>
  )
}

export function JwtDecoder() {
  const [source, setSource] = useState('')
  const [now, setNow] = useState(() => Date.now())
  const [errorDismissed, setErrorDismissed] = useState(false)

  usePageMeta(PAGE_META.jwtDecoder)

  const result = useMemo(() => decodeJwt(source), [source])
  const token = result.token

  useEffect(() => {
    if (!token) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [token])

  useEffect(() => {
    setErrorDismissed(false)
  }, [source])

  const expiry = useMemo(
    () => (token ? expiryInfo(token.payload, now) : null),
    [token, now],
  )
  const claims = useMemo(
    () => (token ? claimRows(token.payload, now) : []),
    [token, now],
  )
  const error = errorDismissed ? null : result.error

  function loadSample() {
    setSource(makeSampleToken())
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <JsonLd id="jwt-decoder-app-schema" data={APP_SCHEMA} />
      <JsonLd id="jwt-decoder-faq-schema" data={FAQ_SCHEMA} />

      <Breadcrumbs items={[{ label: 'Tools', to: '/' }, { label: 'JWT Decoder' }]} />

      <ToolHeader
        title="JWT Decoder"
        highlight="& Inspector"
        description="Paste a JSON Web Token to read its header and claims, check the audience, issuer and expiry — decoded locally in this tab."
        badges={[
          { icon: KeyRound, label: 'Decode only, no keys' },
          { icon: ShieldCheck, label: '100% in-browser' },
        ]}
      />

      <div className="mt-6 space-y-4">
        <StatStrip
          items={[
            {
              label: 'Algorithm',
              value: token ? String(token.header.alg ?? 'none') : '—',
              icon: Fingerprint,
            },
            {
              label: 'Expires',
              value: expiry ? expiry.label : '—',
              icon: Clock,
              tone:
                expiry?.state === 'expired'
                  ? 'warn'
                  : expiry?.state === 'valid'
                    ? 'ok'
                    : undefined,
            },
            {
              label: 'Claims',
              value: token ? String(Object.keys(token.payload).length) : '—',
              icon: Braces,
            },
            {
              label: 'Signature',
              value: token ? (token.signature ? 'Present' : 'None') : '—',
              icon: ShieldCheck,
              tone: token?.signature ? undefined : 'warn',
            },
          ]}
        />

        {error ? (
          <ErrorBanner
            title="Token could not be decoded"
            hint="Nothing was sent anywhere — fix the token above and the claims appear instantly."
            message={error}
            onDismiss={() => setErrorDismissed(true)}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          <Panel
            title="Encoded token"
            className="lg:col-span-2"
            action={
              <button
                type="button"
                onClick={loadSample}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-medium text-indigo-600 transition hover:bg-indigo-500/10 dark:text-indigo-400"
              >
                <Sparkles className="size-3.5" />
                Load sample token
              </button>
            }
          >
            <div className="space-y-3">
              <label htmlFor="jwt-input" className="sr-only">
                JWT token
              </label>
              <textarea
                id="jwt-input"
                value={source}
                onChange={(event) => setSource(event.target.value)}
                spellCheck={false}
                aria-invalid={Boolean(error)}
                placeholder={'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0In0.signature'}
                className="scroll-slim min-h-[150px] w-full resize-y rounded-lg border border-slate-200 bg-white p-3.5 font-mono text-[12px] leading-relaxed break-all text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-400 dark:focus:border-indigo-400/60"
              />
              <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span className="inline-flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  Decoded on this device · 0 bytes uploaded
                </span>
                {source ? (
                  <span className="font-mono">{source.trim().length.toLocaleString()} chars</span>
                ) : null}
              </p>
            </div>
          </Panel>

          <div className="flex min-w-0 flex-col gap-4">
            <Panel title="Actions">
              <div className="space-y-2">
                <CopyButton
                  value={source.trim()}
                  label="Copy token"
                  variant="solid"
                  className="w-full"
                  toastMessage="Token copied"
                />
                <CopyButton
                  value={token ? token.rawPayload : ''}
                  label="Copy payload JSON"
                  variant="outline"
                  className="w-full"
                  disabled={!token}
                  toastMessage="Payload copied"
                />
                <button
                  type="button"
                  onClick={() => setSource('')}
                  disabled={!source}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-[13px] font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900 disabled:pointer-events-none disabled:opacity-40 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                >
                  <Trash2 className="size-3.5" />
                  Clear
                </button>
              </div>

              <div className="mt-4 border-t border-slate-200 pt-4 dark:border-slate-800">
                <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-500 dark:text-slate-400">
                  Reminder
                </span>
                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                  The signature is shown as-is and is <strong className="font-semibold text-slate-600 dark:text-slate-300">not
                  verified</strong>. Anyone can craft these claims — only a server holding the key can
                  prove who issued the token.
                </p>
              </div>
            </Panel>

            <AdSlot variant="rail" className="hidden lg:flex" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Panel
            title="Header"
            subtitle="alg · typ · kid"
            action={
              <CopyButton
                value={token ? token.rawHeader : ''}
                label="Copy"
                variant="ghost"
                className="px-2 py-1"
                disabled={!token}
              />
            }
          >
            {token ? (
              <JsonBlock value={token.rawHeader} />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                The decoding header appears here.
              </p>
            )}
          </Panel>

          <Panel
            title="Payload"
            subtitle="claims"
            action={
              <CopyButton
                value={token ? token.rawPayload : ''}
                label="Copy"
                variant="ghost"
                className="px-2 py-1"
                disabled={!token}
              />
            }
          >
            {token ? (
              <JsonBlock value={token.rawPayload} />
            ) : (
              <p className="rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center text-[13px] text-slate-500 dark:border-slate-700 dark:text-slate-400">
                Claims appear here once a token is pasted.
              </p>
            )}
          </Panel>
        </div>

        <Panel title="Signature" subtitle="base64url · unverified">
          <div className="space-y-3">
            <p className="font-mono text-[11.5px] leading-relaxed break-all text-slate-700 dark:text-slate-300">
              {token?.signature ? token.signature : '—'}
            </p>
            <p className="border-t border-slate-200 pt-3 text-[11px] leading-relaxed text-slate-500 dark:border-slate-800 dark:text-slate-400">
              {token?.signature
                ? 'This value is the raw signature segment. Verifying it means recomputing the HMAC or checking the RSA/ECDSA signature with the issuer key — which belongs on your server, not in a browser.'
                : 'An empty signature usually means alg: "none". Tokens like that are unsigned, and any server that accepts them is trusting the client.'}
            </p>
          </div>
        </Panel>

        <Panel
          title="Claims"
          subtitle={expiry ? expiry.detail : 'Registered claims, decoded'}
          bodyClassName="p-0"
        >
          {claims.length === 0 ? (
            <p className="px-5 py-12 text-center text-[13px] text-slate-500 dark:text-slate-400">
              Claims will be listed here — exp, iat and nbf are converted to local time.
            </p>
          ) : (
            <div className="scroll-slim w-full max-w-full overflow-x-auto overscroll-x-contain">
              <table className="w-full min-w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    >
                      Claim
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    >
                      Value
                    </th>
                    <th
                      scope="col"
                      className="whitespace-nowrap border-b border-slate-200 bg-slate-100 px-4 py-2.5 font-mono text-[10px] font-medium uppercase tracking-[0.08em] text-slate-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300"
                    >
                      When
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr
                      key={claim.key}
                      className="bg-white transition-colors even:bg-slate-50/70 hover:bg-slate-100/70 dark:bg-slate-950 dark:even:bg-slate-900/60 dark:hover:bg-slate-800/50"
                    >
                      <td className="border-b border-slate-200 px-4 py-2.5 align-top dark:border-slate-800">
                        <span className="font-mono text-[11.5px] text-slate-900 dark:text-slate-100">
                          {claim.key}
                        </span>
                        <span className="mt-0.5 block text-[11px] text-slate-500 dark:text-slate-400">
                          {claim.label}
                        </span>
                      </td>
                      <td className="max-w-[420px] border-b border-slate-200 px-4 py-2.5 align-top text-slate-800 dark:border-slate-800 dark:text-slate-200">
                        <span className="break-words">{claim.value}</span>
                      </td>
                      <td className="border-b border-slate-200 px-4 py-2.5 align-top font-mono text-[11px] whitespace-nowrap text-slate-500 dark:border-slate-800 dark:text-slate-400">
                        {claim.note ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>
      </div>

      <ToolGuide
        howToTitle="How to inspect a JWT"
        howToIntro="Three steps, no sign-up and no network round-trip. Everything below runs inside this browser tab."
        steps={STEPS}
        privacyIntro={PRIVACY_INTRO}
        privacyPoints={PRIVACY_POINTS}
        faqIntro="Expiry, audiences, signature verification and what this tool deliberately does not do."
        faqs={FAQ_ITEMS}
        toolId="jwt-decoder"
        category="Security"
      />

    </div>
  )
}
