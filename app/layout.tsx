import type { Metadata, Viewport } from "next";
import { Cairo, Amiri_Quran } from "next/font/google";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ServiceWorkerRegister";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  variable: "--font-cairo",
  display: "swap",
  weight: ["400", "600", "700", "800"],
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  variable: "--font-amiri-quran",
  display: "swap",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "نور — تطبيق تحفيظ القرآن للأطفال",
  description:
    "تطبيق يساعد الأطفال على حفظ القرآن بمساعدة الذكاء الاصطناعي، مع متابعة من الأم.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "نور",
    startupImage: ["/icon-512.svg"],
  },
  icons: {
    icon: [
      { url: "/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    apple: [{ url: "/icon-192.svg", sizes: "192x192" }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0d7a3f",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} ${amiriQuran.variable}`}>
      <body className="antialiased">
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
