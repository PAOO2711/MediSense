import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const backendBaseUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

  try {
    const formData = await request.formData();

    // Try to obtain a Better Auth JWT from the current cookie session.
    let authorization: string | undefined;
    try {
      const tokenResponse = await fetch(`${request.nextUrl.origin}/api/auth/token`, {
        method: 'GET',
        headers: {
          cookie: request.headers.get('cookie') ?? '',
        },
      });

      if (tokenResponse.ok) {
        const tokenPayload = (await tokenResponse.json()) as { token?: string };
        if (tokenPayload?.token) {
          authorization = `Bearer ${tokenPayload.token}`;
        }
      }
    } catch {
      // If token retrieval fails, continue without Authorization header.
    }

    const upstreamResponse = await fetch(`${backendBaseUrl}/transcribe_and_analyze`, {
      method: 'POST',
      headers: authorization ? { Authorization: authorization } : undefined,
      body: formData,
    });

    const contentType = upstreamResponse.headers.get('content-type') ?? 'application/json';
    const bodyText = await upstreamResponse.text();

    return new NextResponse(bodyText, {
      status: upstreamResponse.status,
      headers: {
        'content-type': contentType,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Error proxying transcribe_and_analyze request' },
      { status: 500 }
    );
  }
}
