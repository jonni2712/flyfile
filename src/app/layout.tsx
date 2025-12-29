import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { TransferProvider } from "@/context/TransferContext";
import { TeamProvider } from "@/context/TeamContext";
import CookieBanner from "@/components/CookieBanner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FlyFile - Condivisione File Sicura",
  description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end. Perfetta per team e professionisti.",
  keywords: "file sharing, condivisione file, file transfer, crittografia, AES-256, sicurezza",
  authors: [{ name: "FlyFile" }],
  openGraph: {
    title: "FlyFile - Condivisione File Sicura",
    description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end.",
    type: "website",
    locale: "it_IT",
    siteName: "FlyFile",
  },
  twitter: {
    card: "summary_large_image",
    title: "FlyFile - Condivisione File Sicura",
    description: "La piattaforma più sicura per condividere file con crittografia AES-256 end-to-end.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it">
      <body className={`${inter.variable} font-sans antialiased bg-white min-h-screen`}>
        <AuthProvider>
          <TransferProvider>
            <TeamProvider>
              {children}
              <CookieBanner />
            </TeamProvider>
          </TransferProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
