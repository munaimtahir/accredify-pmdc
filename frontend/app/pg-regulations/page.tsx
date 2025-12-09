"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getProformas, getInstitutions, getPGCompliances, createPGCompliance, updatePGCompliance } from "../../lib/api";
import { ProformaTemplate, Institution, PGItemCompliance } from "../../lib/types";

export default function PGRegulationsPage() {
  const [templates, setTemplates] = useState<ProformaTemplate[]>([]);
  const [institutions, setInstitutions] = useState<Institution[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<ProformaTemplate | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<string>("");
  const [compliances, setCompliances] = useState<Record<string, PGItemCompliance>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    Promise.all([getProformas(), getInstitutions()])
      .then(([templatesData, institutionsData]) => {
        setTemplates(templatesData);
        setInstitutions(institutionsData);
        // Auto-select PMDC-PG-2023 template if available
        const pgTemplate = templatesData.find((t: ProformaTemplate) => t.code === "PMDC-PG-2023");
        if (pgTemplate) {
          setSelectedTemplate(pgTemplate);
        }
      })
      .catch(() => {
        setTemplates([]);
        setInstitutions([]);
      })
      .finally(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (selectedInstitution && selectedTemplate) {
      // Load existing compliances for this institution
      getPGCompliances(selectedInstitution)
        .then((data) => {
          const complianceMap: Record<string, PGItemCompliance> = {};
          data.forEach((c: PGItemCompliance) => {
            complianceMap[c.item] = c;
          });
          setCompliances(complianceMap);
        })
        .catch(() => setCompliances({}));
    }
  }, [selectedInstitution, selectedTemplate]);

  const handleStatusChange = async (itemId: string, status: string) => {
    if (!selectedInstitution) return;

    setSaving(true);
    try {
      const existing = compliances[itemId];
      if (existing) {
        // Update existing
        const updated = await updatePGCompliance(existing.id, { status });
        setCompliances({ ...compliances, [itemId]: updated });
      } else {
        // Create new
        const created = await createPGCompliance({
          institution: selectedInstitution,
          item: itemId,
          status,
          comment: "",
          evidence_url: "",
        });
        setCompliances({ ...compliances, [itemId]: created });
      }
    } catch (error) {
      console.error("Failed to update compliance:", error);
      alert("Failed to update compliance status");
    } finally {
      setSaving(false);
    }
  };

  const handleCommentChange = async (itemId: string, comment: string) => {
    if (!selectedInstitution) return;

    const existing = compliances[itemId];
    if (existing) {
      setSaving(true);
      try {
        const updated = await updatePGCompliance(existing.id, { comment });
        setCompliances({ ...compliances, [itemId]: updated });
      } catch (error) {
        console.error("Failed to update comment:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleEvidenceChange = async (itemId: string, evidence_url: string) => {
    if (!selectedInstitution) return;

    const existing = compliances[itemId];
    if (existing) {
      setSaving(true);
      try {
        const updated = await updatePGCompliance(existing.id, { evidence_url });
        setCompliances({ ...compliances, [itemId]: updated });
      } catch (error) {
        console.error("Failed to update evidence:", error);
      } finally {
        setSaving(false);
      }
    }
  };

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1 style={{ marginBottom: 24 }}>PG Regulations Checklist</h1>

      <div style={{ marginBottom: 24 }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
            Select Institution:
          </label>
          <select
            value={selectedInstitution}
            onChange={(e) => setSelectedInstitution(e.target.value)}
            style={{
              width: "100%",
              padding: 8,
              fontSize: 16,
              border: "1px solid #ccc",
              borderRadius: 4,
            }}
          >
            <option value="">-- Select Institution --</option>
            {institutions.map((inst) => (
              <option key={inst.id} value={inst.id}>
                {inst.name} {inst.city ? `(${inst.city})` : ""}
              </option>
            ))}
          </select>
        </div>

        {templates.length > 1 && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: "bold" }}>
              Select Module:
            </label>
            <select
              value={selectedTemplate?.id || ""}
              onChange={(e) => {
                const template = templates.find((t) => t.id === e.target.value);
                setSelectedTemplate(template || null);
              }}
              style={{
                width: "100%",
                padding: 8,
                fontSize: 16,
                border: "1px solid #ccc",
                borderRadius: 4,
              }}
            >
              <option value="">-- Select Module --</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.title}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {!selectedInstitution && (
        <div
          style={{
            padding: 16,
            backgroundColor: "#f0f0f0",
            borderRadius: 4,
            textAlign: "center",
          }}
        >
          Please select an institution to view and update the checklist.
        </div>
      )}

      {selectedInstitution && selectedTemplate && (
        <div>
          <h2 style={{ marginBottom: 16 }}>{selectedTemplate.title}</h2>
          <p style={{ marginBottom: 24, color: "#666" }}>
            {selectedTemplate.description}
          </p>

          {selectedTemplate.sections.map((section) => (
            <div
              key={section.id}
              style={{
                marginBottom: 32,
                border: "1px solid #ddd",
                borderRadius: 8,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  padding: 16,
                  backgroundColor: "#f5f5f5",
                  borderBottom: "1px solid #ddd",
                }}
              >
                <h3 style={{ margin: 0 }}>
                  {section.code}: {section.title}
                </h3>
                {section.description && (
                  <p style={{ margin: "8px 0 0 0", fontSize: 14, color: "#666" }}>
                    {section.description}
                  </p>
                )}
              </div>

              <div style={{ padding: 16 }}>
                {section.items.map((item, idx) => {
                  const compliance = compliances[item.id];
                  const status = compliance?.status || "NO";

                  return (
                    <div
                      key={item.id}
                      style={{
                        marginBottom: idx < section.items.length - 1 ? 24 : 0,
                        paddingBottom: idx < section.items.length - 1 ? 24 : 0,
                        borderBottom:
                          idx < section.items.length - 1 ? "1px solid #eee" : "none",
                      }}
                    >
                      <div style={{ marginBottom: 12 }}>
                        <strong style={{ display: "block", marginBottom: 4 }}>
                          {item.code}
                          {item.is_licensing_critical && (
                            <span
                              style={{
                                marginLeft: 8,
                                padding: "2px 6px",
                                backgroundColor: "#ff6b6b",
                                color: "white",
                                fontSize: 12,
                                borderRadius: 3,
                              }}
                            >
                              CRITICAL
                            </span>
                          )}
                        </strong>
                        <p style={{ margin: "4px 0", lineHeight: 1.5 }}>
                          {item.requirement_text || item.text}
                        </p>
                        {item.required_evidence_type && (
                          <p style={{ margin: "4px 0", fontSize: 14, color: "#666" }}>
                            <em>Required Evidence: {item.required_evidence_type}</em>
                          </p>
                        )}
                      </div>

                      <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="radio"
                            name={`status-${item.id}`}
                            value="YES"
                            checked={status === "YES"}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={saving}
                          />
                          Yes
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="radio"
                            name={`status-${item.id}`}
                            value="NO"
                            checked={status === "NO"}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={saving}
                          />
                          No
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="radio"
                            name={`status-${item.id}`}
                            value="PARTIAL"
                            checked={status === "PARTIAL"}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={saving}
                          />
                          Partial
                        </label>
                        <label style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <input
                            type="radio"
                            name={`status-${item.id}`}
                            value="NA"
                            checked={status === "NA"}
                            onChange={(e) => handleStatusChange(item.id, e.target.value)}
                            disabled={saving}
                          />
                          N/A
                        </label>
                      </div>

                      <div style={{ marginBottom: 12 }}>
                        <label
                          style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                        >
                          Comments / Notes:
                        </label>
                        <textarea
                          value={compliance?.comment || ""}
                          onChange={(e) => handleCommentChange(item.id, e.target.value)}
                          onBlur={(e) => handleCommentChange(item.id, e.target.value)}
                          placeholder="Add any comments or notes..."
                          disabled={!compliance || saving}
                          style={{
                            width: "100%",
                            padding: 8,
                            fontSize: 14,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                            minHeight: 60,
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{ display: "block", marginBottom: 4, fontSize: 14 }}
                        >
                          Evidence Link / URL:
                        </label>
                        <input
                          type="url"
                          value={compliance?.evidence_url || ""}
                          onChange={(e) => handleEvidenceChange(item.id, e.target.value)}
                          onBlur={(e) => handleEvidenceChange(item.id, e.target.value)}
                          placeholder="https://..."
                          disabled={!compliance || saving}
                          style={{
                            width: "100%",
                            padding: 8,
                            fontSize: 14,
                            border: "1px solid #ccc",
                            borderRadius: 4,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {saving && (
            <div
              style={{
                position: "fixed",
                bottom: 24,
                right: 24,
                padding: 12,
                backgroundColor: "#4CAF50",
                color: "white",
                borderRadius: 4,
              }}
            >
              Saving...
            </div>
          )}
        </div>
      )}
    </main>
  );
}
