"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "../lib/supabase";
import { useRouter } from "next/navigation";

const statusConfig: Record<string, { bg: string; text: string; dot: string; pulse: boolean }> = {
  done:       { bg: "rgba(52,211,153,0.12)",  text: "#34d399", dot: "#34d399", pulse: false },
  processing: { bg: "rgba(96,165,250,0.12)",  text: "#60a5fa", dot: "#60a5fa", pulse: true  },
  pending:    { bg: "rgba(156,163,175,0.1)",  text: "#9ca3af", dot: "#9ca3af", pulse: false },
  error:      { bg: "rgba(248,113,113,0.12)", text: "#f87171", dot: "#f87171", pulse: false },
};
const statusLabel: Record<string, string> = {
  done: "完了", processing: "処理中", pending: "待機中", error: "エラー"
};

export default function Home() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createClient();

  const fetchData = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push("/login"); return; }
    
    setUserEmail(session.user.email || "");
    const token = session.access_token;
    const headers = { Authorization: `Bearer ${token}` };

    const [jobsRes, clinicsRes] = await Promise.all([
      fetch("/api/jobs", { headers }).then(r => r.json()),
      fetch("/api/clinics", { headers }).then(r => r.json()),
    ]);
    setJobs(jobsRes.jobs || []);
    setClinics(clinicsRes.clinics || []);
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchData(); }, [fetchData]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const displayJobs = jobs.filter(j => {
    const matchClinic = selectedClinic ? j.clinic_id === selectedClinic : true;
    const matchSearch = search
      ? (j.email_from?.includes(search) || j.email_subject?.includes(search))
      : true;
    return matchClinic && matchSearch;
  });

  const jobsForStats = selectedClinic ? jobs.filter(j => j.clinic_id === selectedClinic) : jobs;

  return (
    <div style={{ fontFamily: "'DM Sans','Noto Sans JP',sans-serif", background: "#09090c", minHeight: "100vh", color: "#e0e0e8", display: "flex" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Mono:wght@400;500&family=Noto+Sans+JP:wght@300;400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.3;}}
        .pulse{animation:pulse 1.6s ease-in-out infinite;}
        .clinic-card{transition:all 0.15s;cursor:pointer;border-radius:12px;border:1px solid transparent;}
        .clinic-card:hover{background:rgba(255,255,255,0.04)!important;}
        .row{transition:background 0.12s;cursor:pointer;}
        .row:hover{background:rgba(255,255,255,0.025);}
        input{background:#111118;border:1px solid #1e1e28;border-radius:8px;padding:8px 14px;color:#ccc;font-size:13px;font-family:inherit;outline:none;}
        input::placeholder{color:#383845;}
      `}</style>

      {/* Sidebar */}
      <div style={{ width: 256, background: "#0d0d11", borderRight: "1px solid #141418", display: "flex", flexDirection: "column", padding: "20px 10px", gap: 2, flexShrink: 0, overflowY: "auto" }}>
        <div style={{ padding: "6px 10px 20px" }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: "#fff" }}>ScanBridge</div>
          <div style={{ fontSize: 11, color: "#383845", marginTop: 2 }}>口腔内スキャン管理</div>
        </div>

        <div className="clinic-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: !selectedClinic ? "rgba(255,255,255,0.05)" : "transparent" }} onClick={() => setSelectedClinic(null)}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#1c1c24", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#666" }}>全</div>
          <div>
            <div style={{ fontSize: 12.5, fontWeight: 500, color: !selectedClinic ? "#fff" : "#888" }}>すべての医院</div>
            <div style={{ fontSize: 11, color: "#383845" }}>{jobs.length} 件</div>
          </div>
        </div>

        <div style={{ height: 1, background: "#141418", margin: "8px 2px" }} />

        {clinics.map(c => (
          <div key={c.id} className="clinic-card" style={{ padding: "10px 12px", display: "flex", alignItems: "center", gap: 10, background: selectedClinic === c.id ? "rgba(255,255,255,0.04)" : "transparent" }} onClick={() => setSelectedClinic(c.id)}>
            <div style={{ width: 30, height: 30, borderRadius: 8, background: `${c.color || "#60a5fa"}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 600, color: c.color || "#60a5fa" }}>
              {c.name?.charAt(0) || "?"}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: selectedClinic === c.id ? "#fff" : "#999", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.name}</div>
              <div style={{ fontSize: 10.5, color: "#383845", fontFamily: "DM Mono, monospace", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{c.email}</div>
            </div>
          </div>
        ))}

        {clinics.length === 0 && !loading && (
          <div style={{ padding: "12px 10px", fontSize: 11, color: "#333", textAlign: "center" }}>
            <a href="/clinics" style={{ color: "#2563eb", textDecoration: "none" }}>医院を登録する →</a>
          </div>
        )}

        <div style={{ marginTop: "auto", padding: "12px 10px", borderTop: "1px solid #141418" }}>
          <div style={{ fontSize: 11, color: "#888", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</div>
          <button onClick={handleLogout} style={{ background: "transparent", border: "1px solid #1e1e28", borderRadius: 8, padding: "6px 12px", color: "#aaa", fontSize: 11, cursor: "pointer", width: "100%" }}>
            ログアウト
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div style={{ padding: "20px 28px 16px", borderBottom: "1px solid #111116" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <div>
              <h1 style={{ fontSize: 17, fontWeight: 600, color: "#fff" }}>
                {selectedClinic ? clinics.find(c => c.id === selectedClinic)?.name : "すべての医院"}
              </h1>
              <div style={{ fontSize: 11, color: "#383845", marginTop: 2 }}>{jobsForStats.length} 件のジョブ</div>
            </div>
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <a href="/clinics" style={{ background: "#1a1a24", border: "1px solid #1e1e28", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#888", textDecoration: "none", whiteSpace: "nowrap" }}>医院管理 →</a>
              <input placeholder="件名で検索…" value={search} onChange={e => setSearch(e.target.value)} style={{ width: 200 }} />
            </div>
          </div>

          <div style={{ display: "flex", gap: 24 }}>
            {[
              { label: "総件数", value: jobsForStats.length, color: "#ccc" },
              { label: "完了", value: jobsForStats.filter(j => j.status === "done").length, color: "#34d399" },
              { label: "処理中", value: jobsForStats.filter(j => j.status === "processing").length, color: "#60a5fa" },
              { label: "待機中", value: jobsForStats.filter(j => j.status === "pending").length, color: "#9ca3af" },
              { label: "エラー", value: jobsForStats.filter(j => j.status === "error").length, color: "#f87171" },
            ].map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 5 }}>
                <span style={{ fontSize: 22, fontWeight: 600, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "#333" }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ flex: 1, overflow: "auto", padding: "12px 28px 24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#333", fontSize: 13 }}>読み込み中...</div>
          ) : displayJobs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px", color: "#2e2e38", fontSize: 13 }}>
              {jobs.length === 0 ? "まだデータがありません。メールを転送してください。" : "該当するデータがありません"}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #111116" }}>
                  {["医院", "件名", "受信日時", "ダウンロードURL", "ステータス"].map((h, i) => (
                    <th key={i} style={{ padding: "8px 12px", textAlign: "left", fontSize: 10, color: "#2e2e38", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.7px" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayJobs.map(job => {
                  const clinic = clinics.find(c => c.id === job.clinic_id);
                  const s = statusConfig[job.status] || statusConfig.pending;
                  return (
                    <tr key={job.id} className="row" style={{ borderBottom: "1px solid #0f0f13" }}>
                      <td style={{ padding: "13px 12px" }}>
                        <div style={{ fontSize: 12, fontWeight: 500, color: "#bbb" }}>{clinic?.name || "未登録"}</div>
                        <div style={{ fontSize: 10, color: "#2e2e38", fontFamily: "DM Mono, monospace" }}>{job.email_from}</div>
                      </td>
                      <td style={{ padding: "13px 12px", fontSize: 12, color: "#888", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{job.email_subject || "—"}</td>
                      <td style={{ padding: "13px 12px", fontSize: 11, color: "#444", fontFamily: "DM Mono, monospace" }}>{job.received_at ? new Date(job.received_at).toLocaleString("ja-JP") : "—"}</td>
                      <td style={{ padding: "13px 12px", fontSize: 11, color: "#444", maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {job.download_url ? <a href={job.download_url} target="_blank" rel="noopener noreferrer" style={{ color: "#60a5fa" }}>リンクを開く ↗</a> : "—"}
                      </td>
                      <td style={{ padding: "13px 12px" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: s.bg, color: s.text, borderRadius: 20, padding: "3px 10px", fontSize: 11.5, fontWeight: 500 }}>
                          <span className={s.pulse ? "pulse" : ""} style={{ width: 5, height: 5, borderRadius: "50%", background: s.dot, display: "inline-block" }} />
                          {statusLabel[job.status] || job.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
