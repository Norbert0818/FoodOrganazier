import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meniu & Cumpărături",
  description: "Planificator de mese și listă inteligentă de cumpărături"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
