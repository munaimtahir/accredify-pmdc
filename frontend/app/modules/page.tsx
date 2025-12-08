"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getModules } from "../../lib/api";
import { Module } from "../../lib/types";

export default function ModulesPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    getModules()
      .then(setModules)
      .catch(() => setModules([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main style={{ padding: 24 }}><p>Loading...</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Modules</h1>
      {modules.length === 0 ? (
        <p>No modules found.</p>
      ) : (
        <ul>
          {modules.map((mod) => (
            <li key={mod.id} style={{ marginBottom: 16 }}>
              <h3>
                <a href={`/modules/${mod.id}`} style={{ color: "blue", textDecoration: "underline" }}>
                  {mod.display_name}
                </a>
              </h3>
              <p>Code: {mod.code}</p>
              {mod.description && <p>{mod.description}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
