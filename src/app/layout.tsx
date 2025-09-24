import { type ReactNode } from 'react';
import { mada, tajawal } from './fonts';

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${tajawal.variable} ${mada.variable} ${mada.className}`}>
      <body>{children}</body>
    </html>
  );
}
