import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Providers from "./provider";
const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Verify DreamPlus Gangnam",
  description: "DreamPlus Gangnam",
  icons: {
    icon: "/a41.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
