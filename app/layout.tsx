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
  title: "Presente Especial - Dia dos Namorados 💕",
  description: "Um presente digital especial para minha namorada no Dia dos Namorados",
  keywords: ["dia dos namorados", "presente", "amor", "romântico", "surpresa"],
  authors: [{ name: "Seu Namorado ❤️" }],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/heart-icon.svg", type: "image/svg+xml" },
      { url: "/heart-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/heart-icon.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/heart-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
  },
  manifest: "/manifest.json",
  themeColor: "#e91e63",
  viewport: "width=device-width, initial-scale=1",
  robots: "noindex, nofollow", // Privado, só para vocês dois
  openGraph: {
    title: "Presente Especial - Dia dos Namorados",
    description: "Um presente digital especial feito com amor",
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/foto1.jpg", // Sua primeira foto
        width: 1200,
        height: 630,
        alt: "Nosso amor",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Presente Especial 💕",
    description: "Feito com amor para minha namorada",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Favicons românticos */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/heart-icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/heart-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Meta tags para tema romântico */}
        <meta name="theme-color" content="#e91e63" />
        <meta name="application-name" content="Presente Especial 💕" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Presente 💕" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Preload das imagens e música para melhor performance */}
        <link rel="preload" href="/foto1.jpg" as="image" />
        <link rel="preload" href="/foto2.jpg" as="image" />
        <link rel="preload" href="/foto3.jpg" as="image" />
        <link rel="preload" href="/musica.mp3" as="audio" />
        
        {/* Meta tag para permitir autoplay de áudio */}
        <meta name="referrer" content="no-referrer" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-pink-400 via-purple-500 to-red-500 min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}