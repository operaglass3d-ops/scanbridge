import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const clinicId = searchParams.get('clinic_id')
    let query = supabase
      .from('jobs')
      .select('*, clinics(id, name, email, color)')
      .order('received_at', { ascending: false })
    if (clinicId) {
      query = query.eq('clinic_id', clinicId)
    }
    const { data, error } = await query
    if (error) throw error
    return NextResponse.json({ jobs: data })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
