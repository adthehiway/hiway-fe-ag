import type { Metadata } from "next";
import { Geist, Geist_Mono, Roboto } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "@HiwayDev/elv-player-js/dist/elv-player-js.css";
import NextTopLoader from "nextjs-toploader";
import PlausibleAnalytics from "@/components/common/plausible-analytics";

const fontSans = Roboto({
  variable: "--font-sans",
  subsets: ["latin"],
});

const env = process.env.NEXT_PUBLIC_ENVIRONMENT;

export const metadata: Metadata = {
  title: {
    template: "%s | Hiway",
    default: "Hiway",
  },
  description: "Hiway is a platform for uploading and sharing videos",
  icons: {
    icon:
      env === "development"
        ? "/favicon-dev.ico"
        : env === "staging"
        ? "/favicon-staging.ico"
        : "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className="h-full"
      style={{ colorScheme: "dark" }}
      suppressHydrationWarning
    >
      <body
        className={`${fontSans.variable} antialiased h-full w-full min-h-screen`}
      >
        <PlausibleAnalytics />
        <NextTopLoader
          color="oklch(0.8138 0.14536 182.488)"
          showSpinner={false}
        />
        <Providers>{children}</Providers>
        <ToastContainer
          position="bottom-center"
          theme="dark"
          stacked
          progressClassName="toastify-progress-bar"
          className="toastify-body"
          limit={3}
          pauseOnFocusLoss={false}
        />
      </body>
    </html>
  );
}
