import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EpiSat 2.0 — Space-to-Action AI Platform for Disease Early Warning",
  description: "Hyperlocal vector-borne disease outbreak early warning system using Earth Observation, weather data, machine learning, and explainable AI.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col justify-between antialiased bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
