# ZeroUpload Tools ⚡🔒

> **Fast, Free & 100% Private Developer Utilities.**  
> Routine data transformations and developer utilities that run entirely in your browser. Zero server uploads, zero storage, zero tracking.

---

## 🌟 Why ZeroUpload?

Most online file converters and developer tools upload your sensitive data (JSON schemas, API tokens, customer CSVs) to third-party cloud servers. They also impose artificial 2-file-per-day limits, aggressive paywalls, and slow network queues.

**ZeroUpload Tools takes a radically private approach:**
- **🔒 100% In-Browser Execution:** Files and data are processed locally via the HTML5 File API and Web Workers. Your data never leaves your device.
- **⚡ Instant Processing:** Zero upload/download network latency. Operations complete at local CPU/RAM speeds.
- **♾️ No Artificial Caps:** Convert and clean files without size ceilings or daily usage limits.
- **🛡️ Built-in Privacy & Compliance:** Fully compliant with privacy regulations (GDPR, CCPA) by design.

---

## 🛠️ Built-in Tools

1. **JSON to CSV / Excel Converter (`/tools/json-to-csv`)**
   - Automatically flattens nested JSON hierarchies.
   - Interactive table preview with pagination.
   - Custom delimiters (comma, semicolon, tab).

2. **JWT Inspector & Expiry Checker (`/tools/jwt-decoder`)**
   - Decodes Base64URL header, payload, and signature client-side without sending secret tokens across the network.
   - Color-coded segments with human-readable timestamps and countdown timers.

3. **CSV Column Cleaner & Sanitizer (`/tools/csv-column-cleaner`)**
   - Visual toggleable column badges to pick which columns to keep or discard.
   - Trims whitespace, removes empty rows, and de-duplicates entries.

4. **Freelance Fee & Profit Calculator (`/tools/freelance-fee-calculator`)**
   - Side-by-side transaction fee comparison for Stripe, PayPal, and Wise.
   - Includes reverse "How much should I invoice?" calculation.

5. **Regex Matcher & Explainer (`/tools/regex-tester`)**
   - Real-time match highlighting, capture group breakdown, and quick preset insertions (email, phone, URL, dates).

---

## 💻 Tech Stack

- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS v4 (Full Light & Dark mode support)
- **Icons:** Lucide React
- **Routing:** React Router v7 with route-level lazy loading and code-splitting
- **Hosting Target:** Cloudflare Pages / Vercel (100% Free Edge Static Delivery)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/raghvendraojha1008/ZeroUpload-Tools.git

# Navigate to project folder
cd ZeroUpload-Tools

# Install dependencies
npm install

# Start local development server
npm run dev
```

### Production Build

```bash
npm run build
```
Build output is saved to the `/dist` directory, ready to deploy to Cloudflare Pages, Vercel, or Netlify.

---

## 📄 License

MIT License. Free for personal, educational, and commercial use.
