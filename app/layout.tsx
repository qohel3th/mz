import type { Metadata, Viewport } from "next";
import { Cinzel, Frank_Ruhl_Libre, Gveret_Levin, Inter, Reenie_Beanie } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppShell } from "@/components/shell/AppShell";

const body = Inter({ variable: "--font-body", subsets: ["latin"], display: "swap" });
const display = Cinzel({ variable: "--font-display", subsets: ["latin"], weight: ["400", "600", "700"], display: "swap" });
const hand = Reenie_Beanie({ variable: "--font-hand", subsets: ["latin"], weight: "400", display: "swap" });
const handHe = Gveret_Levin({ variable: "--font-hand-he", subsets: ["hebrew", "latin"], weight: "400", display: "swap" });
const hebrew = Frank_Ruhl_Libre({
  variable: "--font-hebrew",
  subsets: ["hebrew", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mission Zero",
  description: "Action Cures Anxiety. A mobile identity + practice academy.",
  applicationName: "Mission Zero",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MZ",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      { url: "/icons/apple-touch-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/apple-touch-icon-120.png", sizes: "120x120", type: "image/png" },
    ],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#0b0810",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // lang/dir/data-theme are synced on the client by <HtmlAttrs>; suppress the
    // one-time attribute diff so the persisted locale doesn't trigger a warning.
    <html
      lang="en"
      dir="ltr"
      data-theme="arcane"
      suppressHydrationWarning
      className={`${body.variable} ${display.variable} ${hebrew.variable} ${hand.variable} ${handHe.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
