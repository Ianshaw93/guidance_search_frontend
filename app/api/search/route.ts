import { NextRequest, NextResponse } from 'next/server';

// Configure your upstream backend URL here or via env var
const UPSTREAM_URL = process.env.BACKEND_URL ?? 'https://c814b2903a2b.ngrok-free.app';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const upstreamResponse = await fetch(`${UPSTREAM_URL}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
      // Disable Next.js fetch caching for dynamic backend searches
      cache: 'no-store',
    });

    const contentType = upstreamResponse.headers.get('content-type') || 'application/json';
    const text = await upstreamResponse.text();

    if (!upstreamResponse.ok) {
      return new NextResponse(text || 'Upstream error', {
        status: upstreamResponse.status,
        headers: {
          'content-type': contentType,
        },
      });
    }

    return new NextResponse(text, {
      status: 200,
      headers: {
        'content-type': contentType,
      },
    });
  } catch (error) {
    return NextResponse.json({ message: 'Proxy error', error: (error as Error).message }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic';

