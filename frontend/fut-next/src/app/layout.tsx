import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
import { Container } from "@/components/ui/Container";
import { StoreProvider } from "./Redux/ProviderStore";
import Providers from "./Providers";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <body className={inter.className}>
          <StoreProvider>
            <ViewTransitions>
              <Providers>
                {/* <Header /> */}
                <div className="  hidden dark:block w-full h-full absolute inset-0 z-[-1] ">
                  {/* <StarsCanvas /> */}
                </div>
                <Container>{children}</Container>
              </Providers>
            </ViewTransitions>
          </StoreProvider>
        </body>
      </ThemeProvider>
    </html>
  );
}
