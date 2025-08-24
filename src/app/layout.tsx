import type { Metadata } from "next";
import { Press_Start_2P } from "next/font/google";
import Navbar from "@/components/Navbar";
import "./globals.css";



const font = Press_Start_2P({
  weight: "400",
  variable: "--font-press-start-2p",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "PixelPillaiyar",
  description: "PixelPillaiyar",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html className="dark" lang="en">
      <body className={`${font.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
