import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

async function getUserFromToken(token: string) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  const { data: { user } } = await supabase.auth.getUser(token)
  return user
}

export async function GET(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ jobs: [] })

  const user = await getUserFromToken(token)
  if (!user) return NextResponse.json({ jobs: [] })

  const supabase = getSupabase()

  const { data: clinics } = await supabase
    .from('clinics')
    .select('id')
    .eq('user_id', user.id)

  if (!clinics || clinics.length === 0) return NextResponse.json({ jobs: [] })

  const clinicIds = clinics.map(c => c.id)

  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinic_id')

  let query = supabase
    .from('jobs')
    .select('*, clinics(id, name, email, color)')
    .in('clinic_id', clinicIds)
    .order('received_at', { ascending: false })

  if (clinicId) {
    query = query.eq('clinic_id', clinicId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}
