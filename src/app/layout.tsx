import type { Metadata } from "next";
import { Sora, Poppins } from "next/font/google";
import "./globals.css";
import StoreProvider from "@/components/StoreProvider";
import AuthInitializer from "@/components/AuthInitializer";
import { Toaster } from "react-hot-toast";

const sora = Sora({ 
  subsets: ["latin"],
  variable: "--font-sora",
});

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "Akazi | Plateforme de Recrutement IA",
  description: "Propulsez votre carrière avec l'IA. Recrutement intelligent, matching précis et opportunités exceptionnelles.",
  keywords: ["recrutement", "IA", "emploi", "carrière", "matching", "RH"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${sora.variable} ${poppins.variable} h-full`} suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body h-full antialiased bg-surface text-on-surface">
        <StoreProvider>
          <AuthInitializer>
            {children}
            <Toaster position="top-right" />
          </AuthInitializer>
        </StoreProvider>
      </body>
    </html>
  );
}
