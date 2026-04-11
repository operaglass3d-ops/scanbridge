"use client";
import { useState, useEffect } from "react";

const COLORS = ["#f472b6","#60a5fa","#a78bfa","#34d399","#fb923c","#facc15"];

export default function Clinics() {
  const [clinics, setClinics] = useState<any[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => { fetchClinics(); }, []);

  async function fetchClinics() {
    const r = await fetch("/api/clinics");
    const d = await r.json();
    setClinics(d.clinics || []);
  }

  async function addClinic() {
    if (!name || !email) { setMsg("医院名とメールアドレスを入力してください"); return; }
    setLoading(true);
    const r = await fetch("/api/clinics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, color })
    });
    const d = await r.json();
    if (d.error) { setMsg("エラー: " + d.error); }
    else { setMsg("登録しました！"); setName(""); setEmail(""); fetchClinics(); }
    setLoading(false);
  }

  async function deleteClinic(id: string) {
    if (!confirm("削除しますか？")) return;
    await fetch(`/api/clinics?id=${id}`, { method: "DELETE" });
    fetchClinics();
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Noto Sans JP',sans-serif", background: "#09090c", minHeight: "100vh", color: "#e0e0e8", padding: "32px" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Sans+JP:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input{background:#111118;border:1px solid #1e1e28;border-radius:8px;padding:10px 14px;color:#ccc;font-size:13px;font-family:inherit;outline:none;width:100%;}input:focus{border-color:#333;}`}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 32 }}>
          <a href="/" style={{ fontSize: 12, color: "#555", textDecoration: "none" }}>← ダッシュボードに戻る</a>
          <h1 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginTop: 12 }}>医院管理</h1>
          <p style={{ fontSize: 13, color: "#555", marginTop: 4 }}>医院を登録すると、メールアドレスで自動識別されます</p>
        </div>

        <div style={{ background: "#111115", border: "1px solid #1a1a22", borderRadius: 14, padding: "24px", marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#ccc", marginBottom: 16 }}>新しい医院を登録</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>医院名</div>
              <input placeholder="例：さくら歯科クリニック" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>送信元メールアドレス</div>
              <input placeholder="例：sakura@clinic.jp" value={email} onChange={e => setEmail(e.target.value)} type="email" />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 8 }}>カラー</div>
              <div style={{ display: "flex", gap: 8 }}>
                {COLORS.map(c => (
                  <div key={c} onClick={() => setColor(c)} style={{ width: 28, height: 28, borderRadius: "50%", background: c, cursor: "pointer", border: color === c ? "3px solid #fff" : "3px solid transparent", transition: "border 0.15s" }} />
                ))}
              </div>
            </div>
            {msg && <div style={{ fontSize: 12, color: msg.includes("エラー") ? "#f87171" : "#34d399" }}>{msg}</div>}
            <button onClick={addClinic} disabled={loading} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "10px", fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>
              {loading ? "登録中..." : "登録する"}
            </button>
          </div>
        </div>

        <div style={{ background: "#111115", border: "1px solid #1a1a22", borderRadius: 14, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #1a1a22" }}>
            <div style={{ fontSize: 14, fontWeight: 500, color: "#ccc" }}>登録済み医院 ({clinics.length})</div>
          </div>
          {clinics.length === 0 ? (
            <div style={{ padding: "40px", textAlign: "center", color: "#333", fontSize: 13 }}>まだ登録されていません</div>
          ) : clinics.map(c => (
            <div key={c.id} style={{ padding: "14px 20px", borderBottom: "1px solid #0f0f13", display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${c.color}20`, border: `1px solid ${c.color}30`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 600, color: c.color, flexShrink: 0 }}>
                {c.name?.charAt(0)}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#ddd" }}>{c.name}</div>
                <div style={{ fontSize: 11, color: "#444", fontFamily: "monospace", marginTop: 2 }}>{c.email}</div>
              </div>
              <button onClick={() => deleteClinic(c.id)} style={{ background: "transparent", border: "1px solid #2a2a35", borderRadius: 6, padding: "4px 10px", color: "#555", fontSize: 11, cursor: "pointer" }}>削除</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}