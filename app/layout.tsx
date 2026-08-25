import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import Navbar from "@/components/Navbar";
import BroadcastPopup from "@/components/BroadcastPopup";
import Footer from "@/components/Footer";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins"
});

export const metadata: Metadata = {
  title: "RYUU-STORE | Suntik Sosmed Termurah & Terpercaya",
  description:
    "RYUU-STORE — layanan top up & suntik sosmed (followers, likes, views) termurah, otomatis, pembayaran QRIS."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('ryuu-theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.classList.add('dark');}}catch(e){}`
          }}
        />
      </head>
      <body className={`${poppins.variable} font-poppins min-h-screen flex flex-col antialiased`}>
        <ThemeProvider>
          <Navbar />
          <BroadcastPopup />
          <main className="flex-1 w-full max-w-5xl mx-auto px-4 pb-16">{children}</main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
