<div align="center">
  <img src="FRONTEND/public/logo.png" alt="Shrink Logo" width="120" style="border-radius: 20px; margin-bottom: 20px;" />
  <h1>Shrink — Modern Edge URL Shortener</h1>
  <p><em>Lightning-fast, highly scalable, and privacy-focused URL shortening at the edge.</em></p>
  
  <p>
    <a href="https://shrink-pi.vercel.app"><strong>Explore the Platform »</strong></a> | 
    <a href="https://worker.ankitcareer018.workers.dev"><strong>Live Backend API »</strong></a>
  </p>

  <p>
    <img alt="React" src="https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB">
    <img alt="Vite" src="https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white">
    <img alt="TailwindCSS" src="https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white">
    <img alt="Cloudflare Pages" src="https://img.shields.io/badge/Cloudflare_Pages-F38020?style=for-the-badge&logo=cloudflare&logoColor=white">
    <img alt="Supabase" src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white">
  </p>
</div>

<br/>

Shrink is a highly scalable, edge-optimized URL Shortener built for extreme performance. Leveraging a modern JAMStack architecture, the application relies entirely on Cloudflare Edge Functions and Cloudflare KV for sub-millisecond global redirects, meaning zero cold starts and unparalleled speed.

## ✨ Key Features

* 🚀 **Ultra-Fast Edge Redirects**: Powered natively by Cloudflare KV directly at the edge, guaranteeing lightning-fast redirect speeds across the globe.
* 📊 **Advanced Edge Analytics**: Automatically captures device type (mobile, tablet, desktop), city, and country securely via Cloudflare's edge headers without relying on slow third-party IP lookups.
* 📱 **Client-Side QR Codes**: Instant, zero-latency QR code generation for shortened links rendered entirely within the browser.
* 🛡️ **Turnstile Protection**: Cloudflare Turnstile integration protects against bots seamlessly without intrusive captchas.
* 🔐 **Secure Authentication**: Fully integrated Supabase identity management for secure user accounts and historical link tracking.
* 🕒 **10-Minute Sessions**: Authenticated sessions automatically expire and sign out after 10 minutes, including after a page reload.
* 🍪 **Cookie Preferences**: Essential authentication and security cookies are supported, while optional cookie preferences can be managed from Cookie Settings. The platform does not use advertising cookies or sell personal data.
* 🔍 **Technical SEO Optimized**: Built-in Open Graph metadata, semantic HTML hierarchy, and optimized performance for high search engine visibility.
* ⚡ **Edge Caching**: Built-in Cache API integration to serve redirected links instantly from the nearest Cloudflare edge node without external environment bindings.
* 🧹 **Automated Link Cleanup**: Leverages Cloudflare Workers Cron Triggers (Scheduled tasks) to automatically purge soft-deleted links from the KV store on a rolling basis.
## ⚙️ Architecture & Folder Structure

The project uses a unified architecture where the React frontend and Cloudflare Edge API live seamlessly in the same repository. 

```mermaid
graph TD
    A[Shrink Project Root] --> B(FRONTEND/)
    
    B --> C[functions/]
    C -.-> |Cloudflare Edge API| D("[[path]].js")
    
    B --> E[src/]
    E --> F[assets/]
    E --> G[components/]
    E --> H[context/ AuthContext.jsx]
    E --> I[pages/ Dashboard, Login]
    E --> J[stores/ useLinkStore.js]
    E --> K[utils/ supabase.js]
    E -.-> |React Core| L(App.jsx)
    
    B --> M[wrangler.jsonc]
    B --> N[.env]
    
    A --> O(BACKEND/)
    O -.-> |Live Cloudflare Worker| P[worker.ankitcareer018.workers.dev]

    style A fill:#2d3436,stroke:#000,stroke-width:2px,color:#fff
    style B fill:#0984e3,stroke:#000,stroke-width:2px,color:#fff
    style C fill:#d63031,stroke:#000,stroke-width:2px,color:#fff
    style D fill:#fab1a0,stroke:#000,stroke-width:1px,color:#000
    style E fill:#00b894,stroke:#000,stroke-width:2px,color:#fff
    style M fill:#e17055,stroke:#000,stroke-width:2px,color:#fff
    style N fill:#ffeaa7,stroke:#000,stroke-width:2px,color:#000
    style O fill:#6c5ce7,stroke:#000,stroke-width:2px,color:#fff
```

## 🛠️ How to Run Locally

To test the full stack (React UI + Cloudflare Edge API) on your local machine, run the following commands:

```bash
# 1. Navigate to the working directory
cd FRONTEND

# 2. Install dependencies
npm install

# 3. Run the complete environment (Vite UI + Wrangler Emulator)
npm run dev:full
```

> **Note**: Running `npm run dev:full` will instantly spin up both the Vite React app and the Cloudflare Wrangler emulator, ensuring the Edge API connects to your local simulated KV store seamlessly!

## 🔗 Environment Variables

To properly configure the application, ensure you have a `.env` and `.dev.vars` file in the `FRONTEND` directory with your Supabase credentials:

```env
# .env (For React/Vite)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_API_URL=https://worker.ankitcareer018.workers.dev

# .dev.vars (For Cloudflare Edge Functions)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

<hr/>
<div align="center">
  <p>Built with ❤️ for speed and privacy.</p>
</div>
