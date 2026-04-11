import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

function extractUrls(text: string): string[] {
  const urlRegex = /https?:\/\/[^\s<>"{}|\\^`[\]]+/g
  const urls = text.match(urlRegex) || []
  return urls.filter(url =>
    /download|scan|file|stl|ply|obj|dcm/i.test(url)
  ).length > 0
    ? urls.filter(url => /download|scan|file|stl|ply|obj|dcm/i.test(url))
    : urls
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const fromEmail = body.From || body.FromFull?.Email || ''
    const subject = body.Subject || ''
    const textBody = body.TextBody || ''
    const htmlBody = body.HtmlBody || ''
    const fullText = textBody + ' ' + htmlBody.replace(/<[^>]+>/g, ' ')
    const urls = extractUrls(fullText)
    const { data: clinic } = await supabase
      .from('clinics')
      .select('id, name')
      .eq('email', fromEmail)
      .single()
    if (urls.length === 0) {
      return NextResponse.json({ message: 'No URLs found' }, { status: 200 })
    }
    for (const url of urls) {
      await supabase.from('jobs').insert({
        clinic_id: clinic?.id || null,
        email_from: fromEmail,
        email_subject: subject,
        download_url: url,
        status: 'pending',
        received_at: new Date().toISOString(),
      })
    }
    return NextResponse.json({ message: 'OK', urls_found: urls.length })
  } catch (error) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
