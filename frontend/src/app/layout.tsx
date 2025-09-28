// src/app/layout.tsx
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { SocketProvider } from "@/components/SocketContext";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <SocketProvider>{children}</SocketProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
