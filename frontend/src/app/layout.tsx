// src/app/layout.tsx
import "./globals.css";
import ClientLayout from "../components/ClientLayout";
import { SocketProvider } from "@/components/SocketContext";
import { UserProvider } from "@/components/UserContext";
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>
          <UserProvider>
            <SocketProvider>{children}</SocketProvider>
          </UserProvider>
        </ClientLayout>
      </body>
    </html>
  );
}
