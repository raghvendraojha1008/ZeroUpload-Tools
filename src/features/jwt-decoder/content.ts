import type { GuideStep } from '../../components/ToolGuide'
import type { FaqItem } from '../../components/FaqAccordion'

export const STEPS: GuideStep[] = [
  {
    title: 'Paste the token',
    body: 'Copy the access or ID token from your auth response, a curl trace or your browser storage. The “Bearer ” prefix is stripped automatically.',
  },
  {
    title: 'Read the header and payload',
    body: 'Both segments are base64url-decoded and pretty-printed. Registered claims like exp, iat, nbf and aud are labelled and converted to local time.',
  },
  {
    title: 'Check expiry before you debug',
    body: 'The countdown updates every second. An expired token explains most 401s, and an unexpected aud or iss explains most 403s.',
  },
]

export const PRIVACY_INTRO =
  'A JWT is a bearer credential: anyone holding it can act as the user until it expires. Pasting one into a hosted debugger is therefore a credential leak, not just a data leak — there is no upload step here at all.'

export const PRIVACY_POINTS = [
  'Decoding happens with atob and TextDecoder inside this tab. No network request carries the token.',
  'Nothing is written to localStorage, a cookie or a database, so closing the tab discards the token.',
  'The page works offline after loading, which is only possible because decoding is local.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Is it safe to paste a real access token here?',
    answer:
      'The token never leaves your browser — there is no upload endpoint, no analytics call and nothing persisted. That said, treat production tokens carefully anyway: decode a staging token when you can, and revoke anything you are unsure about.',
  },
  {
    question: 'Does this page verify the signature?',
    answer:
      'No. Verification requires the signing secret or the issuer’s public key, and doing it in the browser would either expose the secret or prove nothing about the server. Use this page to inspect claims, then verify signatures server-side with a library such as jose or jsonwebtoken.',
  },
  {
    question: 'Why does the payload show data but the signature look random?',
    answer:
      'A JWS token is signed, not encrypted: header and payload are plain base64url JSON that anyone can read. The signature only proves the issuer produced the token — it hides nothing, so never put secrets in JWT claims.',
  },
  {
    question: 'My token has five segments instead of three. Why can’t it be decoded?',
    answer:
      'Five segments means the token is a JWE — encrypted, not merely signed. Its claims are ciphertext and can only be read with the decryption key. This tool handles signed JWS tokens only.',
  },
  {
    question: 'Which clock decides whether the token is expired?',
    answer:
      'Yours. The countdown compares the exp claim against your device clock, so a machine with drifted time can disagree with the server by minutes. If expiry looks wrong, check your system time before debugging the token.',
  },
]
