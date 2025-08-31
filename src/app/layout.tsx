import type {Metadata, Viewport} from "next";
import {Geist, Geist_Mono} from "next/font/google";
import "./globals.css";
import {AuthProvider} from "@/components/providers/auth-provider";
import React from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});
export const metadata: Metadata = {
    title: "UNO",
    description: "UNO Score Board",
    manifest: "/manifest.json",
};

export const viewport: Viewport = {
    themeColor: "#000000",
    colorScheme: "dark",
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
      <AuthProvider>
          {children}
      </AuthProvider>
      </body>
    </html>
  );
}
