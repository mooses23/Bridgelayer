import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bridgelayer - Meta-SaaS Platform",
  description: "Multi-tenant, multi-vertical platform with standalone and regenerative verticals",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}