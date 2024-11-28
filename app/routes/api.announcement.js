import { json } from "@remix-run/node";

import { getAnnouncementDetails } from "../announcement.server";

export async function loader({ request }) {
    // this now uses the Authorization header to authenticate the user
    //   let user = await authenticateWithHeader(request)
    const url = new URL(request.url);
    const shopUrl = url.searchParams.get('shopUrl');

    let announcementData = await getAnnouncementDetails(shopUrl);

    return json({ announcementData });
}