import { NextResponse } from 'next/server'

export async function POST() {
  const token = process.env.GITHUB_TOKEN
  const owner = 'salvadorpelaez'
  const repo = 'pm-agent'
  const workflow = 'weekly-report.yml'

  if (!token) {
    return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 })
  }

  const response = await fetch(
    `https://api.github.com/repos/${owner}/${repo}/actions/workflows/${workflow}/dispatches`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ref: 'main' }),
    }
  )

  if (response.status === 204) {
    return NextResponse.json({ success: true })
  }

  const error = await response.text()
  return NextResponse.json({ error }, { status: response.status })
}
