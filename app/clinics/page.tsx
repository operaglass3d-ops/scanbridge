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
          <h1 style={{ fontSize:
mkdir -p ~/scanbridge/app/api/clinics && cat > ~/scanbridge/app/api/clinics/route.ts << 'ENDOFFILE'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('clinics')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clinics: data })
}

export async function POST(req: NextRequest) {
  const { name, email, color } = await req.json()
  const { data, error } = await supabase
    .from('clinics')
    .insert({ name, email, color })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clinic: data })
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const { error } = await supabase.from('clinics').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
