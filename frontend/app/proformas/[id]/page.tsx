"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getProformaById } from "../../../lib/api";
import { ProformaTemplate } from "../../../lib/types";

export default function ProformaPage() {
  const [proforma, setProforma] = useState<ProformaTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    if (id) {
      getProformaById(id)
        .then(setProforma)
        .catch(() => setProforma(null))
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  if (loading) return <main style={{ padding: 24 }}><p>Loading...</p></main>;
  if (!proforma) return <main style={{ padding: 24 }}><p>Template not found.</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{proforma.title}</h1>
      <p>Code: {proforma.code} | Version: {proforma.version}</p>
      {proforma.authority_name && <p>Authority: {proforma.authority_name}</p>}
      
      <h2>Sections</h2>
      {proforma.sections && proforma.sections.length > 0 ? (
        proforma.sections.map((section) => (
          <div key={section.id} style={{ marginBottom: 24, border: "1px solid #ccc", padding: 16 }}>
            <h3>{section.order}. {section.title}</h3>
            {section.items && section.items.length > 0 ? (
              <ul>
                {section.items.map((item) => (
                  <li key={item.id}>
                    {item.text} (Weight: {item.weight})
                  </li>
                ))}
              </ul>
            ) : (
              <p>No items in this section.</p>
            )}
          </div>
        ))
      ) : (
        <p>No sections defined.</p>
      )}
    </main>
  );
}
