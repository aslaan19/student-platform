import type { Metadata } from "next";
import "./globals.css";
import TranslateButton from "@/components/TranslateButton";

export const metadata: Metadata = {
  title: "منصة الرواد التعليمية",
  description: "نظام تعليمي متكامل للطلاب والمعلمين والمدارس",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&family=IBM+Plex+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <TranslateButton />
      </body>
    </html>
  );
}
