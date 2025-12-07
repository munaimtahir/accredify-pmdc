import Link from "next/link";

export default function HomePage() {
  return (
    <main style={{ padding: 24 }}>
      <h1>AccrediFy — PMDC Postgraduate Accreditation</h1>
      <p>Use the navigation to access the dashboard.</p>
      <Link href="/dashboard">Go to Dashboard</Link>
    </main>
  );
}
