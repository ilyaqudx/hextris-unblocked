import { NextRequest, NextResponse } from 'next/server';
import { saveUserEvent, getRecentUserEvents, UserEventRecord } from '../../../lib/db';

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

function detectDevice(ua: string): string {
  const lower = ua.toLowerCase();
  if (/mobile|android|iphone|ipod|blackberry|iemobile|opera mini/i.test(lower)) {
    return 'mobile';
  }
  if (/ipad|tablet/i.test(lower)) {
    return 'tablet';
  }
  return 'desktop';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const ip = getClientIp(req);
    const country = req.headers.get('x-vercel-ip-country') || undefined;
    const region = req.headers.get('x-vercel-ip-country-region') || undefined;
    let city: string | undefined = undefined;
    try {
      const rawCity = req.headers.get('x-vercel-ip-city');
      if (rawCity) city = decodeURIComponent(rawCity);
    } catch {
      city = req.headers.get('x-vercel-ip-city') || undefined;
    }

    const userAgent = req.headers.get('user-agent') || body.userAgent || 'unknown';
    const referrer = req.headers.get('referer') || body.referrer || undefined;
    const deviceType = body.deviceType || detectDevice(userAgent);

    const eventRecord: UserEventRecord = {
      eventName: body.eventName || 'custom_event',
      eventType: body.eventType || 'interaction',
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      url: body.url,
      path: body.path,
      referrer,
      ip,
      country,
      region,
      city,
      userAgent,
      deviceType,
      buttonText: body.buttonText,
      elementId: body.elementId,
      payload: body.payload || {},
      clientTime: body.clientTime || new Date().toISOString(),
    };

    const result = await saveUserEvent(eventRecord);

    return NextResponse.json(
      {
        ok: true,
        savedToMongo: result.mongo || false,
        savedToPostgres: result.postgres || false,
        event: {
          name: eventRecord.eventName,
          type: eventRecord.eventType,
          ip: eventRecord.ip,
          country: eventRecord.country,
          city: eventRecord.city,
        },
      },
      {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  } catch (error: any) {
    console.error('[API /track] Error:', error);
    return NextResponse.json(
      { ok: false, error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50', 10);
    const result = await getRecentUserEvents(limit);
    return NextResponse.json(
      {
        ok: true,
        source: result.source,
        count: result.count,
        events: result.events,
      },
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
