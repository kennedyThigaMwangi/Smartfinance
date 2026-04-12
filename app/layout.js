import "./globals.css";
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
import SmartFinanceFooter from "@/components/SmartFinanceFooter";

export const metadata = {
  title: "SMARTFINANCE",
  description: "One stop Finance Platform",
};

export default function RootLayout({ children }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <head>
          <link rel="icon" href="/logo-sm.png" sizes="any" />
        </head>
        <body>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Toaster richColors />
          <SmartFinanceFooter />
        </body>
      </html>
    </ClerkProvider>
  );
}