import "./globals.css"
import Navbar from "@/components/layoutComponents/navbar"
import Footer from "@/components/layoutComponents/footer"
import { geistSans, geistMono } from "@/lib/fonts"
import { Analytics } from "@vercel/analytics/react"
import { Providers } from "./providers"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <Navbar />
          <main className="max-w-[1600px] mx-auto my-[64px] px-6">
            {children}
          </main>
          <Footer />
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}