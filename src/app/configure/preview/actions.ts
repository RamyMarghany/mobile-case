"use server";

import { BASE_PRICE, PRODUCT_PRICES } from "@/config/products";
import { db } from "@/db";
import { stripe } from '@/lib/stripe'
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { Order } from '@prisma/client'

export const createCheckoutSession = async ({ configurationId }: { configurationId: string }) => {
    const configuration = await db.configuration.findUnique({
        where: {
            id: configurationId,
        },
    });

    // check if there is a configuration
    if (!configuration) {
        throw new Error("Configuration not found");
    }

    // get user session
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // check if user is logged in
    if (!user) {
        throw new Error("User not found");
    }

    const { material, finish } = configuration;

    // calculate total price on sever side
    let price = BASE_PRICE;
    if (material === "polycarbonate") price += PRODUCT_PRICES.material.polycarbonate
    if (finish === 'textured') price += PRODUCT_PRICES.finish.textured

    let order: Order | undefined = undefined;

    const existingOrder = await db.order.findFirst({
        where: {
            userId: user.id,
            configurationId: configuration.id,
        },
    })

    // create new order if not exists
    if (existingOrder) {
        order = existingOrder
    } else {
        order = await db.order.create({
            data: {
                amount: price / 100,
                userId: user.id,
                configurationId: configuration.id,
            },
        })
    }
    // create a product which user buy to create a payment session
    const product = await stripe.products.create({
        name: 'Custom iPhone Case',
        images: [configuration.imageUrl],
        default_price_data: {
            currency: 'USD',
            unit_amount: price,
        },
    })

    // create a payment session
    const stripeSession = await stripe.checkout.sessions.create({
        line_items: [
            {
                price: product.default_price as string,
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/thank-you?orderId=${order.id}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/configure/preview?id=${configuration.id}`,
        // needed for webhook
        metadata: {
            orderId: order.id,
            userId: user.id,
        },
        payment_method_types: ['card', 'paypal'],
        shipping_address_collection: {
            allowed_countries: ['US', 'CA', 'DE'],
        }
    })

    // url is the url of checkout page hosted by Stripe
    return {
        url: stripeSession.url,
    }

}
