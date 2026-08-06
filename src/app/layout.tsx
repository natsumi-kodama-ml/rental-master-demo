import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "メディアショップ 商品マスタ管理",
  description: "ゲーム(販売)・DVD/CD/コミック(レンタル)を扱うショップの商品マスタ管理画面",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50">
        <header className="border-b-4 border-gold-400 bg-navy-700">
          <div className="mx-auto max-w-full px-6 py-4">
            <Link
              href="/"
              className="text-base font-bold tracking-wide text-white"
            >
              メディアショップ 商品マスタ管理
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-full flex-1 p-6">{children}</main>
      </body>
    </html>
  );
}
