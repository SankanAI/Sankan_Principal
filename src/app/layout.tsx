import type { Metadata } from "next";
import "./globals.css";
import { DM_Sans } from 'next/font/google'; // Import DM Sans font
import AppAppBar from "./UI/AppAppBar"; // Adjust path as needed
const dmSans = DM_Sans({ subsets: ['latin'], display: 'swap' });

export const metadata: Metadata = {
  title: "Sankan AI",
  description: "Futuristic Platform for Upcomming Skills",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={dmSans.className}>
      <AppAppBar />
        {children}
      </body>
    </html>
  );
}