import type {Metadata} from 'next';
import Script from 'next/script';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Poppins } from 'next/font/google';
import { Analytics } from "@vercel/analytics/next"

const poppins = Poppins({ 
  subsets: ['latin'], 
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins' 
});


export const metadata: Metadata = {
  metadataBase: new URL('https://www.intellinews.co.in'),
  title: 'IntelliNews: AI-Powered News, Curated For You',
  description: 'Welcome to intellinews.co.in, your premier source for AI-powered news. Get personalized summaries, explore trending topics, and experience the future of news consumption.',
  icons: {
    icon: '/Intelli News Logo.gif',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8629889765519008"
          crossOrigin="anonymous"
          strategy="lazyOnload"
        />
      </head>
      <body className={`${poppins.variable} font-sans antialiased`}>
        {children}
        <Toaster />
        <Analytics />
      </body>
    </html>
  );
}
