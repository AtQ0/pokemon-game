import type { Metadata } from "next";
import Image from "next/image";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon Themed App",
  description: "A Next.js app with Pokémon colors",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased flex flex-col min-h-screen`}
      >
        {/* Header */}
        <header className="p-2 bg-red-600 shadow flex justify-center">
          <Image
            src="/images/pokemon-logo.png"
            alt="Pokémon Logo"
            width={300}
            height={90}
            className="h-auto w-auto max-h-12"
            priority
          />
        </header>

        {/* Main Content */}
        <main className="flex-1 flex flex-col bg-[#78C850]">
          {children}
        </main>

        {/* Footer */}
        <footer className="p-4 bg-red-600 shadow text-center">
          <p className="text-white font-bold">
            © {new Date().getFullYear()} AtQo. All rights reserved.
          </p>
        </footer>
      </body>
    </html>
  );
}
