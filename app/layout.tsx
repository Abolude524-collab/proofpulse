import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ProofPulse — Evidence, not guesswork",
  description:
    "Turn a pasted claim or screenshot into a concise, source-linked evidence brief with Gemma and the Gemini API.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col antialiased selection:bg-indigo-100 selection:text-indigo-900">
        {children}
      </body>
    </html>
  );
}
