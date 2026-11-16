import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "Uplink | Find and book events",
    template: "%s | Uplink",
  },
  description:
    "Discover events, book your spot in seconds, and host your own on Uplink.",
  applicationName: "Uplink",
  openGraph: {
    siteName: "Uplink",
    type: "website",
    title: "Uplink | Find and book events",
    description:
      "Discover events, book your spot in seconds, and host your own on Uplink.",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${plusJakarta.variable} font-sans antialiased min-h-full flex flex-col`}
      >
        {children}
      </body>
    </html>
  );
}
