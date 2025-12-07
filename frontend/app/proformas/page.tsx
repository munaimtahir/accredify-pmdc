"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProformas } from "../../lib/api";
import { ProformaTemplate } from "../../lib/types";

export default function ProformasPage() {
  const [proformas, setProformas] = useState<ProformaTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    getProformas()
      .then(setProformas)
      .catch(() => setProformas([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main style={{ padding: 24 }}><p>Loading...</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Proforma Templates</h1>
      {proformas.length === 0 ? (
        <p>No templates found.</p>
      ) : (
        <ul>
          {proformas.map((proforma) => (
            <li key={proforma.id} style={{ marginBottom: 16 }}>
              <h3>
                <a href={`/proformas/${proforma.id}`} style={{ color: "blue", textDecoration: "underline" }}>
                  {proforma.title}
                </a>
              </h3>
              <p>Code: {proforma.code}</p>
              <p>Version: {proforma.version}</p>
              {proforma.authority_name && <p>Authority: {proforma.authority_name}</p>}
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
