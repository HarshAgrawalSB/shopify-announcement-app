import prisma from "./db.server";

export const getAnnouncementDetails = async (shopUrl) => {
    return await prisma.announcement.findUnique({
        where: { shopUrl: shopUrl },
    });
}