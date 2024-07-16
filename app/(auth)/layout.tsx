import { ClerkProvider } from "@clerk/nextjs";
import { Inter } from "next/font/google";
import "../globals.css";

export const metadata = {
  title: "Threads",
  description: "Threads, the app build on top of nextjs 14",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${inter.className} flex w-full min-h-screen bg-dark-1 items-center justify-center`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
