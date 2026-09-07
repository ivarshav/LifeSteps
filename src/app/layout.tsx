import { Heebo } from "next/font/google";

import "@/styles/globals.css";

const heebo = Heebo({
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-heebo",
});

export const metadata = {
  title: { default: "צעדי חיים", template: "%s · צעדי חיים" },
  description:
    "רשימות משימות לאירועי חיים — מה צריך לעשות, באיזה סדר, ועם אילו מסמכים.",
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
      className={heebo.variable}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeBootstrap }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
