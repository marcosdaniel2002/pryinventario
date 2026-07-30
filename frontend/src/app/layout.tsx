import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Outfit } from "next/font/google";
import { cn } from "@/lib/utils";
import { AuthProvider } from "@/providers/auth-provider";
import { ConfiguracionProvider } from "@/providers/configuracion-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { QueryProvider } from "@/providers/query-provider";

// Sets the `dark` class on <html> before React hydrates, based on the
// persisted theme preference (falling back to the OS preference), so there
// is no flash of the wrong theme on load.
const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem('stockhub_theme');
    var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle('dark', isDark);
  } catch (e) {}
})();
`;

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "StockHub | Gestión de inventario",
  description: "Controla tu stock, organiza tus productos y mantén tu inventario al día.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", outfit.variable)} suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <QueryProvider>
          <ThemeProvider>
            <ConfiguracionProvider>
              <AuthProvider>{children}</AuthProvider>
            </ConfiguracionProvider>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
