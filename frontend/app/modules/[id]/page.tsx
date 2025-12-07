"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getModuleById } from "../../../lib/api";

export default function ModulePage() {
  const params = useParams();
  const id = params?.id as string;
  const [mod, setMod] = useState<any | null>(null);

  useEffect(() => {
    if (id) {
      getModuleById(id).then(setMod).catch(() => setMod(null));
    }
  }, [id]);

  if (!id) return <main><p>No module selected.</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Module Detail</h1>
      {mod ? (
        <>
          <h2>{mod.display_name}</h2>
          <p>Code: {mod.code}</p>
          <p>{mod.description}</p>
        </>
      ) : (
        <p>Loading...</p>
      )}
    </main>
  );
}
