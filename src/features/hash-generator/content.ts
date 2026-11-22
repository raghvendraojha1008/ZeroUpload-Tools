import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Enter text or drop a local file',
    body: 'Type or paste sensitive text, passwords, or drag-and-drop any local file (binaries, zip, images, documents). Files are read locally into browser memory via FileReader.',
  },
  {
    title: 'View all cryptographic hashes simultaneously',
    body: 'Immediately view SHA-256, SHA-512, SHA-384, SHA-1, and MD5 hashes computed in parallel using hardware-accelerated WebCrypto.',
  },
  {
    title: 'Verify checksum match',
    body: 'Paste an expected checksum from a software release page, vendor manifest, or Git commit to verify an exact, tamper-free match.',
  },
]

export const PRIVACY_INTRO =
  'Computing checksums often involves proprietary binaries, private keys, passwords, or company files that must never touch a remote server.'

export const PRIVACY_POINTS = [
  'Hashes are generated locally via the native browser Web Cryptography API (crypto.subtle).',
  'Files never leave your machine: 0 bytes uploaded, zero server requests, and zero network logging.',
  'Works completely offline once loaded in your browser.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How are hashes computed without uploading my file?',
    answer:
      'Modern web browsers provide the native Web Cryptography API (crypto.subtle) and the FileReader API. When you drop a file onto this page, JavaScript reads the file buffer directly into your device memory and computes the hash locally using your processor, without sending a single packet over the internet.',
  },
  {
    question: 'What is the difference between SHA-256 and MD5?',
    answer:
      'MD5 generates a 128-bit hash and is primarily used for quick legacy file integrity checks (e.g., confirming a download was not corrupted), but it is cryptographically broken and vulnerable to collisions. SHA-256 generates a 256-bit cryptographic digest and remains secure against collision and preimage attacks.',
  },
  {
    question: 'Can I hash large files (e.g. 500MB or 1GB)?',
    answer:
      'Yes. Because processing runs locally in your browser memory, you can hash files without bandwidth caps or upload waiting times.',
  },
  {
    question: 'Can a hash be reversed back into the original text or file?',
    answer:
      'No. Cryptographic hash functions are strictly one-way mathematical transformations. It is computationally infeasible to reconstruct the original input from the output digest.',
  },
  {
    question: 'Does case matter when comparing checksums?',
    answer:
      'No. Hexadecimal hashes are case-insensitive (e.g. "a3f" is identical to "A3F"). Our verification tool automatically normalizes case and trims whitespace when comparing checksums.',
  },
]
