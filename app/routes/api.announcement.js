import { json } from "@remix-run/node";
import { getAnnouncementDetails } from "../announcement.server";
import { cors } from "remix-utils/cors";

export async function loader({ request }) {
    // Extract the shopUrl from the query parameters
    const url = new URL(request.url);
    const shopUrl = url.searchParams.get('shopUrl');

    // Fetch the announcement data based on the shopUrl
    let announcementData = await getAnnouncementDetails(shopUrl);

    // Create the response object
    const response = json({ announcementData });

    await cors(request, response);

    return response;
}
