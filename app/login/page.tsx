"use client";
import { useState } from "react";
import { createClient } from "../../lib/supabase";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleAuth() {
    setLoading(true);
    setError("");
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setError("登録しました！ログインしてください。"); setIsSignUp(false); }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("メールアドレスまたはパスワードが違います"); }
      else { router.push("/"); router.refresh(); }
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily: "'DM Sans','Noto Sans JP',sans-serif", background: "#09090c", minHeight: "100vh", color: "#e0e0e8", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Noto+Sans+JP:wght@400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0;}input{background:#111118;border:1px solid #1e1e28;border-radius:8px;padding:10px 14px;color:#ccc;font-size:13px;font-family:inherit;outline:none;width:100%;}input:focus{border-color:#2563eb;}`}</style>

      <div style={{ width: 360 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>WE ScanBridge</div>
          <div style={{ fontSize: 12, color: "#444", marginTop: 4 }}>口腔内スキャン管理システム</div>
        </div>

        <div style={{ background: "#111115", border: "1px solid #1a1a22", borderRadius: 16, padding: "28px" }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#ccc", marginBottom: 20 }}>
            {isSignUp ? "新規登録" : "ログイン"}
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>メールアドレス</div>
              <input type="email" placeholder="example@lab.jp" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#555", marginBottom: 6 }}>パスワード</div>
              <input type="password" placeholder="8文字以上" value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAuth()} />
            </div>

            {error && (
              <div style={{ fontSize: 12, color: error.includes("登録しました") ? "#34d399" : "#f87171", padding: "8px 12px", background: error.includes("登録しました") ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", borderRadius: 8 }}>
                {error}
              </div>
            )}

            <button onClick={handleAuth} disabled={loading} style={{ background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, padding: "11px", fontSize: 13, fontWeight: 500, cursor: "pointer", marginTop: 4 }}>
              {loading ? "処理中..." : isSignUp ? "登録する" : "ログイン"}
            </button>
          </div>

          <div style={{ textAlign: "center", marginTop: 16 }}>
            <span style={{ fontSize: 12, color: "#555" }}>
              {isSignUp ? "すでにアカウントをお持ちの方は" : "アカウントをお持ちでない方は"}
            </span>
            <span onClick={() => { setIsSignUp(!isSignUp); setError(""); }} style={{ fontSize: 12, color: "#2563eb", cursor: "pointer", marginLeft: 4 }}>
              {isSignUp ? "ログイン" : "新規登録"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
