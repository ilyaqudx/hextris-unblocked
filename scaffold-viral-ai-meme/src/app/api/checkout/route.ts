import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { siteConfig } from '../../../../site.config';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16' as any,
});

export async function POST(req: Request) {
  try {
    const { packType, userEmail } = await req.json();

    const selectedPack = siteConfig.pricing[packType as keyof typeof siteConfig.pricing];
    if (!selectedPack) {
      return NextResponse.json({ error: 'Invalid pack type selected' }, { status: 400 });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${siteConfig.name} - ${selectedPack.name} Pack (${selectedPack.videos} Videos)`,
              description: `One-time pack of ${selectedPack.videos} video credits for ${siteConfig.name}. Unused credits do not expire.`,
            },
            unit_amount: Math.round(selectedPack.price * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      customer_email: userEmail || undefined,
      success_url: `https://${siteConfig.domain}/library?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `https://${siteConfig.domain}/pricing?canceled=true`,
      metadata: {
        packType,
        creditsGranted: selectedPack.videos.toString(),
      },
    });

    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: error.message || 'Internal error' }, { status: 500 });
  }
}
