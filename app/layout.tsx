import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Oven Grill Cafe",
  description: "Delicious Food, Freshly Made",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* 🔥 QZ Tray Script for Direct Printing */}
        <script 
          src="https://cdn.jsdelivr.net/npm/qz-tray@2.2.4/qz-tray.js" 
          async 
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  );
}