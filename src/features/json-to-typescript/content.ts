import type { FaqItem } from '../../components/FaqAccordion'
import type { GuideStep } from '../../components/ToolGuide'

export const STEPS: GuideStep[] = [
  {
    title: 'Paste raw JSON payload',
    body: 'Paste any JSON response from an API, log file, database document, or configuration file. You can also edit the root interface name.',
  },
  {
    title: 'Select target format and settings',
    body: 'Choose between TypeScript Interfaces, TypeScript Type Aliases, or Zod Validation Schemas. Toggle export keywords, readonly modifiers, and optional properties.',
  },
  {
    title: 'Copy or export typed schema',
    body: 'Copy the generated TypeScript types or download a clean .ts file ready to paste directly into your React, Next.js, or Node.js codebase.',
  },
]

export const PRIVACY_INTRO =
  'Production API payloads frequently contain sensitive user records, internal IDs, and proprietary data structures that must never be uploaded to third-party servers.'

export const PRIVACY_POINTS = [
  'All JSON parsing and TypeScript AST type inference executes 100% locally inside your browser runtime.',
  'Zero network requests: no payload data, schemas, or variable names leave your machine.',
  'Works seamlessly in private tabs and offline environments.',
]

export const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'How are nested objects and arrays typed?',
    answer:
      'Nested JSON objects are extracted into separate, strongly-typed interfaces or types (e.g. User, Address, OrderItem) with clean naming conventions, avoiding messy inline definitions and improving code reusability.',
  },
  {
    question: 'How are missing or optional keys handled?',
    answer:
      'When you pass an array of objects where certain items are missing specific fields, the generator automatically detects the discrepancy and marks those fields as optional with the TypeScript "?" modifier.',
  },
  {
    question: 'What is the advantage of generating Zod schemas?',
    answer:
      'Zod provides runtime validation in addition to static TypeScript inference. Generating Zod schemas gives you both a runtime schema (z.object) and a static TypeScript type (z.infer) in one step, ideal for validating API responses and form submissions.',
  },
  {
    question: 'Can I handle null or heterogeneous arrays?',
    answer:
      'Yes. Null fields are marked optional or typed accordingly, and primitive arrays with multiple types (e.g., [1, "two"]) are accurately typed as union types (number | string)[].',
  },
  {
    question: 'Is there a limit on the JSON file size?',
    answer:
      'Because all processing is performed client-side using native JSON parsing and fast string compilation, you can comfortably process multi-megabyte payloads in a fraction of a second.',
  },
]
