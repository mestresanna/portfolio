import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const THEME_INIT_SCRIPT = `try{if(localStorage.getItem('portfolio-theme')==='dark'){document.documentElement.classList.add('dark')}}catch(e){}`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://annamestres.com"),

  title: {
    default: "Anna Mestres — AI & Software Development",
    template: "%s - Anna Mestres",
  },

  description:
    "Portfolio of Anna Mestres, an Applied Computer Science graduate focused on AI and software development.",

  openGraph: {
    title: "Anna Mestres - AI & Software Development",
    description:
      "Portfolio of Anna Mestres, an Applied Computer Science graduate focused on AI and software development.",
    url: "https://yourdomain.com",
    siteName: "Anna Mestres",
    images: [
      {
        url: "/og-image.jpeg",
        width: 1200,
        height: 630,
        alt: "Anna Mestres - AI & Software Development",
      },
    ],
    locale: "en_US",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "Anna Mestres - AI & Software Development",
    description:
      "Portfolio of Anna Mestres, an Applied Computer Science graduate focused on AI and software development.",
    images: ["/og-image.jpeg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
        />
        {children}
      </body>
    </html>
  );
}
