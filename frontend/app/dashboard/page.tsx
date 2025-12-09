"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboardSummary } from "../../lib/api";

type DashboardData = {
  modules: number;
  templates: number;
  assignments: number;
  programs: number;
  evidence: number;
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    getDashboardSummary().then(setData).catch(() => setData(null));
  }, [router]);

  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      {data ? (
        <div>
          <ul>
            <li>Modules: {data.modules}</li>
            <li>Templates: {data.templates}</li>
            <li>Programs: {data.programs}</li>
            <li>Assignments: {data.assignments}</li>
            <li>Evidence: {data.evidence}</li>
          </ul>
          <div style={{ marginTop: 24 }}>
            <h2>Quick Links</h2>
            <ul>
              <li><a href="/modules" style={{ color: "blue", textDecoration: "underline" }}>View Modules</a></li>
              <li><a href="/proformas" style={{ color: "blue", textDecoration: "underline" }}>View Proforma Templates</a></li>
              <li><a href="/assignments" style={{ color: "blue", textDecoration: "underline" }}>View Assignments</a></li>
              <li><a href="/pg-regulations" style={{ color: "blue", textDecoration: "underline" }}>PG Regulations Checklist</a></li>
            </ul>
          </div>
        </div>
      ) : (
        <p>Loading or not authenticated.</p>
      )}
    </main>
  );
}
