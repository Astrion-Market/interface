import { useState } from "react"
import { Links, Meta, Outlet, Scripts, ScrollRestoration, isRouteErrorResponse } from "react-router"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Toaster } from "sonner"
import appCss from "@workspace/ui/globals.css?url"
import { ThemeProvider } from "./ui/theme-provider"
import { OperationsProvider } from "./features/crosschain/operations-store"
import { EvmWalletProvider } from "./features/wallet/evm/evm-wallet-provider"
import { WalletProvider } from "./features/wallet/wallet-provider"
import { NotFound } from "./ui/not-found"
import type { Route } from "./+types/root"

// Update this to your production domain before going live.
const SITE_URL = "https://astrion.market"
const SITE_NAME = "astrion.market"
const TITLE = "Astrion: Lend across chains from Stellar"
const DESCRIPTION =
  "Astrion is building access to Aave, Morpho, and Compound lending markets on Base and Ethereum for Stellar users, with clear costs, position risks, and transfer tracking. In development."
const OG_IMAGE = `${SITE_URL}/og-image.svg`
const TWITTER_HANDLE = "@Astrionmarket"

// JSON-LD structured data (WebApplication + FinancialService)
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "@id": `${SITE_URL}/#app`,
      name: "Astrion",
      url: SITE_URL,
      description: DESCRIPTION,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#org`,
      name: "Astrion Labs",
      url: SITE_URL,
      logo: `${SITE_URL}/favicon.svg`,
      sameAs: [
        "https://x.com/Astrionmarket",
        "https://discord.gg/astrionmarket",
        "https://t.me/astrionmarket",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      publisher: { "@id": `${SITE_URL}/#org` },
    },
  ],
}

export const meta: Route.MetaFunction = () => [

      { title: TITLE },

      // ── Core SEO ────────────────────────────────────────────────
      { name: "description", content: DESCRIPTION },
      {
        name: "keywords",
        content:
          "Stellar, cross-chain lending, USDC, Circle CCTP, Aave, Morpho, Compound, Base, Ethereum, DeFi lending",
      },
      { name: "author", content: "astrion labs" },
      { name: "robots", content: "index, follow, max-image-preview:large" },
      { name: "theme-color", content: "#0A0B0D" },
      { name: "color-scheme", content: "dark light" },
      // Prevents phone number detection on iOS / Android WebView
      { name: "format-detection", content: "telephone=no" },

      // ── Open Graph ──────────────────────────────────────────────
      { property: "og:type", content: "website" },
      { property: "og:url", content: SITE_URL },
      { property: "og:site_name", content: SITE_NAME },
      { property: "og:locale", content: "en_US" },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:image", content: OG_IMAGE },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:type", content: "image/svg+xml" },
      {
        property: "og:image:alt",
        content:
          "Astrion: Lend across chains. Bring your liquidity home. Cross-chain lending from Stellar, in development.",
      },

      // ── Twitter / X Card ────────────────────────────────────────
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: TWITTER_HANDLE },
      { name: "twitter:creator", content: TWITTER_HANDLE },
      { name: "twitter:title", content: TITLE },
      { name: "twitter:description", content: DESCRIPTION },
      { name: "twitter:image", content: OG_IMAGE },
      {
        name: "twitter:image:alt",
        content:
          "Astrion: Lend across chains. Bring your liquidity home. Cross-chain lending from Stellar, in development.",
      },
]

export const links: Route.LinksFunction = () => [

      // ── Icons ───────────────────────────────────────────────────
      { rel: "icon", href: "/favicon.svg", type: "image/svg+xml" },
      { rel: "icon", href: "/favicon.ico", sizes: "any" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "manifest", href: "/manifest.json" },

      // ── Canonical ───────────────────────────────────────────────
      { rel: "canonical", href: SITE_URL },

      // ── Fonts ───────────────────────────────────────────────────
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      {
        rel: "preconnect",
        href: "https://fonts.gstatic.com",
        crossOrigin: "anonymous",
      },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Geist+Mono:wght@400;500;600;700&display=swap",
      },

      // ── App CSS ─────────────────────────────────────────────────
      { rel: "stylesheet", href: appCss },
]

// Minified blocking script: runs synchronously before first paint.
// Reads localStorage and sets dark/light class on <html> so CSS variables
// resolve correctly before React hydrates. Prevents the flash of wrong theme.
const THEME_SCRIPT =
  `(function(){try{var t=localStorage.getItem('astrion-theme');var d=t==='dark'||((!t||t==='system')&&window.matchMedia('(prefers-color-scheme:dark)').matches);document.documentElement.classList.add(d?'dark':'light')}catch(e){}})()` as const

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the blocking script adds a class before React
    // hydrates, so the server-rendered HTML and client DOM will differ on the
    // class attribute of <html>. This suppresses the expected mismatch warning.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Must be first: runs before any CSS is applied */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* JSON-LD structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}

export default function App() {
  // One client per app instance: a module-level client would share cached
  // data between server-rendered requests.
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30, // 30s: prices refresh frequently
            refetchOnWindowFocus: true,
          },
        },
      })
  )
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <WalletProvider>
          <EvmWalletProvider>
            <OperationsProvider>
              <Outlet />
            </OperationsProvider>
          </EvmWalletProvider>
        </WalletProvider>
        <Toaster richColors position="bottom-right" />
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error) && error.status === 404) return <NotFound />
  const message = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}` : "Something went wrong"
  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <h1 className="text-heading-page">{message}</h1>
      <p className="text-copy-sm mt-2 text-muted-foreground">Reload the page, or go back to the markets.</p>
      <a href="/markets" className="text-copy-sm mt-4 inline-block text-primary underline-offset-2 hover:underline">
        Go to markets
      </a>
    </main>
  )
}
