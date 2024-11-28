// Backend file (e.g., in Remix) that handles fetching the announcement text based on the shop URL.

import { prisma } from '../../db.server';  // Assuming you have your Prisma setup here
import { json } from '@remix-run/node';
import { cors } from 'remix-utils/cors';


export const loader = async ({ request }) => {
    console.log(request);

    const url = new URL(request.url);
    const shopUrl = url.searchParams.get('shopUrl'); // Extract shop URL from the query string or session

    if (!shopUrl) {
        return json({ error: 'Shop URL is required.' }, { status: 400 });
    }

    try {
        // Query Prisma to fetch the custom text for the shop
        const announcement = await prisma.announcement.findUnique({
            where: {
                shopUrl: shopUrl,  // The unique identifier for your announcement (using the shop's URL)
            },
        });

        if (!announcement) {
            return json({ error: 'No announcement found for this shop.' }, { status: 404 });
        }

        return json({ customText: announcement.customText }); // Return the announcement text
        return json("SUCCESS")
    } catch (error) {
        return json({ error: 'Failed to fetch announcement text.' }, { status: 500 });
    }
};
