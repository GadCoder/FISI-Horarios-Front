import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "bootstrap/dist/css/bootstrap.css";
import { cookies } from "next/headers";
import dynamic from "next/dynamic";

const DynamicBootstrap = dynamic(
  () => require("bootstrap/dist/js/bootstrap.min.js"),
  { ssr: false }
);

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = cookies();
  const theme = cookieStore.get("theme");
  return (
    <html lang="en" data-bs-theme={theme?.value}>
      <body className={inter.className}>{children}</body>
    </html>
  );
}
