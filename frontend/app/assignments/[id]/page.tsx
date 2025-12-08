"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAssignmentById } from "../../../lib/api";
import { Assignment } from "../../../lib/types";

export default function AssignmentDetailPage() {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
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
      getAssignmentById(id)
        .then(setAssignment)
        .catch(() => setAssignment(null))
        .finally(() => setLoading(false));
    }
  }, [id, router]);

  if (loading) return <main style={{ padding: 24 }}><p>Loading...</p></main>;
  if (!assignment) return <main style={{ padding: 24 }}><p>Assignment not found.</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>{assignment.title}</h1>
      <p><strong>Program:</strong> {assignment.program_name}</p>
      <p><strong>Template:</strong> {assignment.template_title}</p>
      <p><strong>Status:</strong> {assignment.status}</p>
      
      <h2>Item Statuses</h2>
      {assignment.item_statuses && assignment.item_statuses.length > 0 ? (
        <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16 }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Item</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Comment</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Score</th>
            </tr>
          </thead>
          <tbody>
            {assignment.item_statuses.map((itemStatus) => (
              <tr key={itemStatus.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{itemStatus.item_text}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{itemStatus.status}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{itemStatus.comment || "-"}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{itemStatus.score !== null ? itemStatus.score : "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No item statuses recorded yet.</p>
      )}
    </main>
  );
}
