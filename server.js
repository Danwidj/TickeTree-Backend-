import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import stripePackage from 'stripe';
import bodyParser from 'body-parser';
import path from 'path';
import nodemailer from 'nodemailer';

// Initialize the app
const app = express();
const port = process.env.PORT || 5001;
const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);

// Middleware
app.use(cors({ origin: 'https://ticke-tree-backend.vercel.app' })); // Allow only the frontend origin
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.resolve('dist')));

// Global CORS middleware to set headers for every response
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://ticke-tree-backend.vercel.app');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// API endpoint for fetching events
app.get('/api/events', async (req, res) => {
    try {
        const username = process.env.EVENTFINDA_USERNAME;
        const password = process.env.EVENTFINDA_PASSWORD;
        const authHeader = 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

        const queryParams = req.query;

        const response = await axios.get('https://api.eventfinda.sg/v2/events.json', {
            headers: { Authorization: authHeader },
            params: { ...queryParams }
        });

        res.json(response.data);
    } catch (error) {
        console.error('Error fetching events:', error.message);
        res.status(500).send('Internal Server Error');
    }
});

// Define other endpoints (e.g., /create-checkout-session) as before...

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});