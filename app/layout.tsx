import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Signal",
    template: "%s · Signal",
  },
  description:
    "A stakeholder intelligence workspace for capturing signals, testing judgement, and tracking relationship sentiment over time.",
  robots: {
    index: false,
    follow: false,
  },
  applicationName: "Signal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}