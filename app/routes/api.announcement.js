import { json } from "@remix-run/node";

import { getAnnouncementDetails } from "../announcement.server";
import { cors } from "remix-utils/cors";

export async function loader({ request }) {
    // this now uses the Authorization header to authenticate the user
    //   let user = await authenticateWithHeader(request)
    const url = new URL(request.url);
    const shopUrl = url.searchParams.get('shopUrl');

    if (request.method === "OPTIONS") {
        const response = json({
            status: 200,
        });
        return await cors(request, response);
    }

    let announcementData = await getAnnouncementDetails(shopUrl);

    const response = json({ announcementData })

    // return json({ announcementData });

    return cors(request, response)
}