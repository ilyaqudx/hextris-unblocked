import { NextResponse } from 'next/server';
import { siteConfig } from '../../../../site.config';

export async function POST(req: Request) {
  try {
    const { photoUrl, userConsent } = await req.json();

    if (!userConsent) {
      return NextResponse.json({ error: 'Consent confirmation required' }, { status: 400 });
    }

    if (!photoUrl) {
      return NextResponse.json({ error: 'Portrait image URL is required' }, { status: 400 });
    }

    // Call fal.ai motion transfer endpoint
    const falApiKey = process.env.FAL_KEY;
    if (!falApiKey) {
      return NextResponse.json({ error: 'Server AI configuration missing' }, { status: 500 });
    }

    // Submit queue task to fal.ai
    const response = await fetch(`https://queue.fal.run/${siteConfig.aiModelEndpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${falApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: photoUrl,
        reference_video_url: `https://${siteConfig.domain}${siteConfig.baseReferenceVideoUrl}`,
        duration: siteConfig.videoDurationSeconds,
        aspect_ratio: "9:16",
      }),
    });

    const data = await response.json();
    return NextResponse.json({
      status: 'queued',
      requestId: data.request_id,
      checkStatusUrl: data.status_url || `https://queue.fal.run/${siteConfig.aiModelEndpoint}/requests/${data.request_id}/status`,
    });
  } catch (error: any) {
    console.error('AI generation proxy error:', error);
    return NextResponse.json({ error: error.message || 'Generation failed' }, { status: 500 });
  }
}
