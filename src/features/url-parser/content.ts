import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Paste the URL',
    body: 'Drop in a tracking link, an OAuth redirect or an API endpoint with a long query string. The URL API splits it into protocol, host, port, path, parameters and fragment instantly.',
  },
  {
    title: 'Inspect the parameters',
    body: 'Every query key gets its own row with its decoded value. Duplicate keys stay separate, so you can see exactly what the server will receive.',
  },
  {
    title: 'Edit and copy',
    body: 'Add, rename or delete a parameter and the reassembled URL updates live. Copy the encoded form for requests, or the decoded form for reading and sharing.',
  },
]

export const PRIVACY_INTRO =
  'Tracking links and OAuth redirects frequently contain session IDs, one-time codes, tokens and email addresses. Pasting them into a server-side inspector creates a log entry somewhere you cannot delete.'

export const PRIVACY_POINTS = [
  'Parsing uses the browser’s built-in URL and URLSearchParams objects — no request is made.',
  'The URL lives in component state only; it is never persisted or added to the address bar.',
  'Because nothing is uploaded, this page is safe for signed links and production endpoints.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'What are the parts of a URL?',
    answer:
      'A URL reads scheme://user:password@host:port/path?query#fragment. The scheme is http, https or another protocol; host is the domain; port is usually omitted for 80/443; path identifies the resource; the query string holds key=value pairs separated by &; and the fragment after # is handled only by the browser and never sent to the server.',
  },
  {
    question: 'Does editing a parameter re-encode the URL?',
    answer:
      'Yes. Values are written back through URLSearchParams, which percent-encodes spaces, ampersands, slashes and non-ASCII characters correctly. Spaces become + or %20 depending on the serializer, then the URL object normalises them. The decoded view shows the human-readable version for copy-pasting into a doc.',
  },
  {
    question: 'What happens to duplicate query keys?',
    answer:
      'They are kept as separate rows. A URL like ?tag=a&tag=b produces two entries, which is exactly what a server-side parser such as Express or Django sees. Deleting one row leaves the other intact.',
  },
  {
    question: 'Why did https:// get added to my URL?',
    answer:
      'If you paste something like example.com/path?x=1 without a scheme, the browser cannot parse it as a URL, so the tool assumes https:// — the same assumption a modern browser makes. Paste the full scheme if you need to inspect http, ftp or a custom protocol.',
  },
  {
    question: 'Is the fragment sent to the server?',
    answer:
      'No. Everything after # is resolved by the browser and stripped from the request, which is why OAuth implicit-flow tokens and single-page-app routes often live there. This tool shows the fragment separately so it is clear what the network never sees.',
  },
]
