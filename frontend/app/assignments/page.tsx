"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAssignments } from "../../lib/api";
import { Assignment } from "../../lib/types";

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    getAssignments()
      .then(setAssignments)
      .catch(() => setAssignments([]))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <main style={{ padding: 24 }}><p>Loading...</p></main>;

  return (
    <main style={{ padding: 24 }}>
      <h1>Assignments</h1>
      {assignments.length === 0 ? (
        <p>No assignments found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ backgroundColor: "#f0f0f0" }}>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Title</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Program</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Template</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Status</th>
              <th style={{ border: "1px solid #ccc", padding: 8, textAlign: "left" }}>Items</th>
            </tr>
          </thead>
          <tbody>
            {assignments.map((assignment) => (
              <tr key={assignment.id}>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>
                  <a href={`/assignments/${assignment.id}`} style={{ color: "blue", textDecoration: "underline" }}>
                    {assignment.title}
                  </a>
                </td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{assignment.program_name}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{assignment.template_title}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{assignment.status}</td>
                <td style={{ border: "1px solid #ccc", padding: 8 }}>{assignment.item_statuses?.length || 0} items</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
