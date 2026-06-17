import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TCC Leiriele",
  description: "Otimização de problemas de programação linear inteira",
  openGraph: {
    title: "TCC Leiriele",
    description: "Otimização de problemas de programação linear inteira",
    url: "https://projeto-tcc-gules.vercel.app/",
    siteName: "TCC Leiriele",
    locale: "pt_BR",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "TCC Leiriele",
    description: "Otimização de problemas de programação linear inteira",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
