import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  const token = authHeader?.replace('Bearer ', '')

  if (!token) return NextResponse.json({ jobs: [] })

  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) return NextResponse.json({ jobs: [] })

  const { searchParams } = new URL(req.url)
  const clinicId = searchParams.get('clinic_id')

  let query = supabase
    .from('jobs')
    .select('*, clinics(id, name, email, color)')
    .in('clinic_id', 
      supabase.from('clinics').select('id').eq('user_id', user.id)
    )
    .order('received_at', { ascending: false })

  if (clinicId) {
    query = query.eq('clinic_id', clinicId)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ jobs: data })
}
