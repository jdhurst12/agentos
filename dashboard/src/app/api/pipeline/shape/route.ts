import { NextRequest, NextResponse } from 'next/server'
import { readItems, writeItems } from '@/lib/pipeline'
import { getConfig } from '@/lib/config'

export async function POST(req: NextRequest) {
  const { slug } = await req.json()
  const items = readItems()
  const item = items.find(i => i.slug === slug)
  if (!item) return NextResponse.json({ ok: false, error: 'Item not found' }, { status: 404 })

  const cfg = getConfig().claude
  const apiKey = cfg.apiKey || process.env.ANTHROPIC_API_KEY
  if (!apiKey) return NextResponse.json({ ok: false, error: 'No ANTHROPIC_API_KEY configured' }, { status: 400 })

  const prompt = `Analyze this idea and respond in JSON only (no markdown):
{
  "title": "Concise title (max 60 chars)",
  "classification": "One of: Feature / Bug Fix / Research / Content / Automation / Strategy",
  "confidence": 0-100,
  "tags": ["tag1", "tag2"],
  "plan": "3-5 sentence action plan"
}

Idea: ${item.idea}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: cfg.model || 'claude-haiku-4-5-20251001',
        max_tokens: 512,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return NextResponse.json({ ok: false, error: `Anthropic API error ${res.status}: ${body}` })
    }

    const data = await res.json()
    const text = data.content?.[0]?.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return NextResponse.json({ ok: false, error: 'Could not parse Claude response' })

    const shaped = JSON.parse(jsonMatch[0])
    Object.assign(item, {
      title: shaped.title || item.title,
      classification: shaped.classification,
      confidence: shaped.confidence,
      tags: shaped.tags,
      plan: shaped.plan,
      stage: 'review',
    })

    writeItems(items)
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) })
  }
}
