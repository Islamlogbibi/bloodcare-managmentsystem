import type React from "react"
import type { Metadata } from "next"
import ClientLayout from "./client-layout"
import "./globals.css"

export const metadata: Metadata = {
  title: {
    default: "BloodCare - Blood Donation Management System",
    template: "%s | BloodCare",
  },
  description:
    "Professional patient blood donation management application for healthcare providers. Manage patient records, schedule transfusions, and track blood donation data efficiently.",
  keywords: ["blood donation", "healthcare", "patient management", "transfusion", "medical records"],
  authors: [{ name: "BloodCare Team" }],
  creator: "BloodCare",
  publisher: "BloodCare",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://bloodcare.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://bloodcare.app",
    title: "BloodCare - Blood Donation Management System",
    description: "Professional patient blood donation management application for healthcare providers.",
    siteName: "BloodCare",
  },
  twitter: {
    card: "summary_large_image",
    title: "BloodCare - Blood Donation Management System",
    description: "Professional patient blood donation management application for healthcare providers.",
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
  verification: {
    google: "google-site-verification-code",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ClientLayout>{children}</ClientLayout>
}
