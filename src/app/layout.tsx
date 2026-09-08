import localFont from "next/font/local";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

import "@/styles/globals.css";

const heebo = localFont({
  src: "./fonts/Heebo-Hebrew.woff2",
  display: "swap",
  variable: "--font-heebo",
  weight: "100 900",
});

export const metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: {
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [{ url: absoluteUrl("/opengraph-image") }],
    locale: "he_IL",
    siteName: SITE_NAME,
    type: "website",
  },
};

const themeBootstrap = `(function(){try{var t=localStorage.getItem("ls_theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}document.documentElement.setAttribute("data-theme",t);}catch(e){}})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="he"
      dir="rtl"
      className={`${heebo.variable} overflow-x-clip`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body className="overflow-x-clip" suppressHydrationWarning>
        <a
          className="focus:inset-block-start-2 focus:inset-inline-start-2 sr-only focus:not-sr-only focus:fixed focus:z-[200] focus:rounded-lg focus:bg-[var(--surface)] focus:px-4 focus:py-2"
          href="#main-content"
        >
          דילוג לתוכן הראשי
        </a>
        <Header />
        <main id="main-content" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
