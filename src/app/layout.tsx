import type { Metadata } from "next";
import { Geist, Geist_Mono, Josefin_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/src/components/SiteHeader";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const josefin = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Groundwork | Where every quest begins",
  description: "Your celestial garden for the job search journey",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${josefin.variable} h-full antialiased bg-background text-foreground`}
    >
      <body className="min-h-full flex flex-col text-zinc-200 font-sans bg-transparent">
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
