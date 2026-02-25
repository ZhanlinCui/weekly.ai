import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC, Plus_Jakarta_Sans } from "next/font/google";
import { PageShell } from "@/components/layout/page-shell";
import { LocaleProvider } from "@/i18n";
import "./globals.css";
import "../styles/tokens.css";
import "../styles/base.css";
import "../styles/home.css";
import "../styles/chat.css";
import "../styles/reader.css";

const displayFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const bodyFont = Noto_Sans_SC({
  subsets: ["latin"],
  variable: "--font-cjk",
  weight: ["400", "500", "600", "700"],
});

const bodyLatinFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const monoFont = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "WeeklyAI - Discover This Week's Hottest AI Products",
  description: "Global AI product discovery platform — dark horses & rising stars",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var key = "weeklyai_theme";
                  var stored = window.localStorage.getItem(key);
                  var next = stored === "dark" || stored === "light"
                    ? stored
                    : (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                  document.documentElement.setAttribute("data-theme", next);
                } catch (_) {
                  document.documentElement.setAttribute("data-theme", "light");
                }
              })();
            `,
          }}
        />
      </head>
      <body className={`${displayFont.variable} ${bodyLatinFont.variable} ${bodyFont.variable} ${monoFont.variable}`}>
        <LocaleProvider>
          <PageShell>{children}</PageShell>
        </LocaleProvider>
      </body>
    </html>
  );
}
