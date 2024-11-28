import express from 'express';
import path from 'path';
import cors from 'cors';
import prisma from './db.server.js';  // Path to your Prisma client


// If you're using the `createRequestHandler` from Remix
import { createRequestHandler } from '@remix-run/express';

const app = express();

app.use(cors({
    origin: '*',  // For local dev, or specify allowed domains in production
    methods: ['GET'],
    allowedHeaders: ['Content-Type'],
}));


// Serve static assets
// app.use(express.static(path.join(__dirname, "public")));

// Create an API endpoint
app.get("/api/get-announcement-text", async (req, res) => {
    const shopUrl = req.query.shopUrl;  // Extract shopUrl from the query params

    if (!shopUrl) {
        return res.status(400).json({ error: 'Shop URL is required.' });
    }

    try {
        // Query the Prisma database to find the announcement by shopUrl
        const announcement = await prisma.announcement.findUnique({
            where: { shopUrl: shopUrl },
        });

        if (!announcement) {
            return res.status(404).json({ error: 'No announcement found for this shop.' });
        }

        // Return the customText field from the announcement object
        return res.json({ customText: announcement.customText });
    } catch (error) {
        console.error('Error fetching announcement:', error);
        return res.status(500).json({ error: 'Failed to fetch announcement text.' });
    }
});

// Handle Remix routes
app.all("*", (req, res) => {
    return createRequestHandler({ req, res });
});

// Set the port
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
