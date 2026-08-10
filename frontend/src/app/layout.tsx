import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/query-provider";
import { AuthProvider } from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://mybarber.my.id"),
  title: {
    default: "MyBarber - Smart Barbershop & AI Haircut Consultant Jakarta",
    template: "%s | MyBarber",
  },
  description:
    "Platform Barbershop Modern #1 di Jakarta. Rekomendasi gaya rambut AI presisi sesuai bentuk wajah, booking antrean online real-time, dan master barber profesional di Sudirman, Kemang & PIK.",
  keywords: [
    "barbershop jakarta",
    "barbershop terbaik jakarta",
    "potong rambut pria",
    "analisis gaya rambut ai",
    "booking barbershop online",
    "barber sudirman",
    "barber kemang",
    "barber pik",
    "textured crop fade",
    "potongan rambut pria 2026",
    "mybarber",
    "konsultasi gaya rambut",
  ],
  authors: [{ name: "MyBarber Indonesia" }],
  creator: "MyBarber Indonesia",
  publisher: "MyBarber Indonesia",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "MyBarber - Smart Barbershop & AI Haircut Consultant Jakarta",
    description:
      "Platform Barbershop Modern #1 di Jakarta. Rekomendasi gaya rambut AI presisi sesuai bentuk wajah & booking antrean online real-time.",
    url: "https://mybarber.my.id",
    siteName: "MyBarber",
    locale: "id_ID",
    type: "website",
    images: [
      {
        url: "/images/hairstyles/textured_crop_fade.png",
        width: 1200,
        height: 630,
        alt: "MyBarber Smart Barbershop AI Experience",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "MyBarber - Smart Barbershop & AI Haircut Consultant",
    description:
      "Rekomendasi gaya rambut AI presisi & booking antrean online barbershop Jakarta.",
    images: ["/images/hairstyles/textured_crop_fade.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "BarberShop",
  "name": "MyBarber Indonesia",
  "image": "https://mybarber.my.id/images/hairstyles/textured_crop_fade.png",
  "@id": "https://mybarber.my.id",
  "url": "https://mybarber.my.id",
  "telephone": "+6281234567890",
  "priceRange": "$$",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Jend. Sudirman No. 45",
    "addressLocality": "Jakarta Selatan",
    "addressRegion": "DKI Jakarta",
    "postalCode": "12190",
    "addressCountry": "ID",
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": -6.2297419,
    "longitude": 106.807708,
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
      "Sunday",
    ],
    "opens": "09:00",
    "closes": "21:00",
  },
  "sameAs": [
    "https://instagram.com/mybarber.id",
    "https://facebook.com/mybarber.id",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${inter.variable} antialiased bg-slate-950 text-slate-50 min-h-screen`}
      >
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
