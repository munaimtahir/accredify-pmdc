import React from "react";

export const metadata = {
  title: "AccrediFy PMDC-PG",
  description: "PMDC Postgraduate Accreditation Module",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
