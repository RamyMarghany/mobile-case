import { db } from "@/db";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
import Stripe from "stripe";


export async function POST(req: Request) {
    try {
        const body = await req.text()
        // to verify the webhook signature is from Stripe
        const signature = req.headers.get("stripe-signature") ?? "";
        if (!signature) {
            // bad request
            return new Response("Missing signature", { status: 400 })
        }
        const event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
        // check the checkout session is completed (handled by Stripe)
        if (event.type === "checkout.session.completed") {
            if (!event.data.object.customer_details?.email) {
                // bad request
                return new Response("Missing user email", { status: 400 })
            }
            const session = event.data.object as Stripe.Checkout.Session
            const { userId, orderId } = session.metadata || {
                userId: null,
                orderId: null
            }
            if (!userId || !orderId) {
                // bad request
                throw new Error('Invalid request metadata')
            }

            // getting from the checkout from (Stripe)
            const billingAddress = session.customer_details!.address
            const shippingAddress = session.shipping_details!.address

            const updatedOrder = await db.order.update({
                where: {
                    id: orderId,
                    userId: userId,
                },
                data: {
                    // Stipe confirm is paid if it reach to this point
                    isPaid: true,
                    shippingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: shippingAddress!.city!,
                            country: shippingAddress!.country!,
                            postalCode: shippingAddress!.postal_code!,
                            street: shippingAddress!.line1!,
                            state: shippingAddress!.state,
                        },
                    },
                    billingAddress: {
                        create: {
                            name: session.customer_details!.name!,
                            city: billingAddress!.city!,
                            country: billingAddress!.country!,
                            postalCode: billingAddress!.postal_code!,
                            street: billingAddress!.line1!,
                            state: billingAddress!.state,
                        },
                    },
                }
            })
        }
        return NextResponse.json({ result: event, ok: true })
    } catch (error) {
        console.log(error)
        return NextResponse.json({ message: "something went wrong!", result: error, ok: false }, { status: 500 })

    }
}