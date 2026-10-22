import { NextRequest, NextResponse } from 'next/server';
import { saveWaitlistSubscriber, getWaitlistCount, getWaitlistSubscribers, saveUserEvent } from '../../../lib/db';

export const dynamic = 'force-dynamic';

function getClientIp(req: NextRequest): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  const cfIp = req.headers.get('cf-connecting-ip');
  if (cfIp) return cfIp.trim();
  return (req as any).ip || '127.0.0.1';
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = body.email;

    if (!rawEmail || typeof rawEmail !== 'string') {
      return NextResponse.json(
        { ok: false, error: 'Email address is required.' },
        { status: 400 }
      );
    }

    const email = rawEmail.trim().toLowerCase();
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { ok: false, error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    const ip = getClientIp(req);
    const country = req.headers.get('x-vercel-ip-country') || undefined;
    let city: string | undefined = undefined;
    try {
      const rawCity = req.headers.get('x-vercel-ip-city');
      if (rawCity) city = decodeURIComponent(rawCity);
    } catch {
      city = req.headers.get('x-vercel-ip-city') || undefined;
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const referrer = req.headers.get('referer') || body.referrer || undefined;

    // 1. Save to waitlist subscribers table/collection
    const result = await saveWaitlistSubscriber({
      email,
      source: body.source || 'web_waitlist_modal',
      reservedPack: body.reservedPack || undefined,
      ip,
      country,
      city,
      userAgent,
      referrer,
    });

    // 2. Also log as an analytics conversion event
    await saveUserEvent({
      eventName: 'conversion_waitlist_join',
      eventType: 'conversion',
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      url: body.url,
      path: body.path,
      referrer,
      ip,
      country,
      city,
      userAgent,
      buttonText: 'Join Waitlist',
      payload: {
        email,
        source: body.source,
        reservedPack: body.reservedPack,
      },
    });

    return NextResponse.json(
      {
        ok: true,
        message: 'Successfully joined the waitlist! We will notify you first upon launch.',
        savedToBlob: result.blob || false,
        savedToMongo: result.mongo || false,
        savedToPostgres: result.postgres || false,
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /waitlist] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const count = await getWaitlistCount();
    const showList = req.nextUrl.searchParams.get('list') === 'true' || req.nextUrl.searchParams.get('all') === 'true';
    const subscribers = showList ? await getWaitlistSubscribers() : undefined;
    return NextResponse.json(
      { ok: true, count, subscribers },
      {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-store, max-age=0',
        },
      }
    );
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
