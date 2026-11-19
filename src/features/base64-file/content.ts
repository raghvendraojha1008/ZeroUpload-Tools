import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Choose encode or decode',
    body: 'Encode turns a local image, SVG, PDF or text file into a Base64 string and a data URI. Decode takes a Base64 payload or data URI back to a previewable file.',
  },
  {
    title: 'Drop a file or paste a string',
    body: 'Files are read with the browser File API — a 2 MB PNG becomes roughly 2.7 MB of Base64, and the size card shows the exact overhead before you paste it anywhere.',
  },
  {
    title: 'Copy, preview or download',
    body: 'Copy the data URI straight into an HTML src, a CSS url() or a JSON field. In decode mode the image renders inline and any other type gets a Download File button.',
  },
]

export const PRIVACY_INTRO =
  'Base64 looks scrambled, which makes it tempting to paste confidential files into a web converter. But Base64 is not encryption — anyone who receives the string can decode it instantly, including the server that hosted the converter.'

export const PRIVACY_POINTS = [
  'The File API reads bytes into memory on this device; there is no upload request and no multipart form.',
  'The data URI and raw string exist only in React state — they are never stored or logged.',
  'Pasting a Base64 payload into a server-side decoder hands over its contents; here the decoding happens with atob() in the tab.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How do I use a data URI in HTML or CSS?',
    answer:
      'In HTML, set it as the source: <img src="data:image/png;base64,iVBORw0KGgo…" alt="Logo" />. In CSS, wrap it in url(): background-image: url("data:image/svg+xml;base64,PHN2Zy…"). Because the payload is inline, the browser needs no extra request — which is why small icons are often embedded this way.',
  },
  {
    question: 'Why is the Base64 version about a third larger?',
    answer:
      'Base64 encodes every 3 bytes as 4 ASCII characters, so the payload grows by 4/3 — about 33%. The tool shows the exact original size, encoded size and percentage so you can decide whether inlining a file is worth the weight.',
  },
  {
    question: 'Is Base64 a form of encryption?',
    answer:
      'No. Base64 is a transport encoding: it makes binary data safe to paste into text-only contexts. It provides zero confidentiality. If a string must stay secret, encrypt it first — this tool only converts.',
  },
  {
    question: 'Which file types can I decode?',
    answer:
      'Any type. Images render in a preview, text-like payloads are shown as UTF-8 text, and everything else (PDF, ZIP, fonts, audio) gets a Download File button that writes the original bytes back out with the right MIME type.',
  },
  {
    question: 'Does it handle SVG and PDF files?',
    answer:
      'Yes. SVG is encoded as image/svg+xml and works in both img tags and CSS backgrounds. PDFs decode to application/pdf and download as a valid .pdf — the browser only renders images inline, so the preview shows a file card instead.',
  },
]
