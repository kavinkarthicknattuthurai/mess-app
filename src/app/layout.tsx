import './globals.css';
import type { Metadata } from 'next';
import '@fontsource/lobster';
import '@fontsource/poppins';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';

export const metadata: Metadata = {
  title: 'Extrabite',
  description: 'Mess Menu Selection App',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-poppins">
        <div className="background-wrapper">
        {children}
        </div>
      </body>
    </html>
  );
}
