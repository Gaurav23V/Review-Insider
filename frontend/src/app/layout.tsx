// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar"; // Import the Navbar

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ReviewInsight Pro",
  description: "AI-Powered Review Analysis Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar /> {/* Add the Navbar here */}
        <main className="container mx-auto p-4 md:p-6 lg:p-8"> {/* Add main content container */}
          {children} {/* Page content will be rendered here */}
        </main>
      </body>
    </html>
  );
}
