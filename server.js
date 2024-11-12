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
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.resolve('dist')));

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

app.post('/create-checkout-session', async (req, res) => {
    const { cartItems } = req.body;

    console.log("Received cart items:", cartItems);

    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
        return res.status(400).send({ error: 'No items in the cart' });
    }

    try {
        const lineItems = cartItems.map(item => {
            console.log("Item image URL:", item.imageUrl); // Log the image URL
            return {
                price_data: {
                    currency: 'sgd',
                    product_data: {
                        name: item.eventName,
                        metadata: {
                            eventDate: item.eventDate,
                            seatNumbers: JSON.stringify(item.seatNumbers), // Store seat numbers as JSON
                            imageUrl: item.imageUrl, // Optionally store the image URL
                        },
                    },
                    unit_amount: item.pricePerItem * 100,
                },
                quantity: item.quantity,
            };
        });

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: `https://ticke-tree-backend.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: 'https://ticke-tree-backend.vercel.app/error',
            allow_promotion_codes: true,
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/checkout-session', async (req, res) => {
    const { session_id } = req.query;
    try {
        const session = await stripe.checkout.sessions.retrieve(session_id, {
            expand: ['line_items.data.price.product', 'customer'],
        });

        const items = session.line_items.data.map(item => ({
            eventName: item.price.product.name,
            eventDate: item.price.product.metadata.eventDate,
            seatNumbers: JSON.parse(item.price.product.metadata.seatNumbers || '[]'), // Parse seat numbers
            quantity: item.quantity,
            pricePerItem: item.price.unit_amount / 100,
            imageUrl: item.price.product.metadata.imageUrl,
        }));

        const orderSummary = items[0];
        const customerEmail = session.customer_details?.email || session.customer?.email;

        // Send confirmation email
        await sendConfirmationEmail(customerEmail, orderSummary);

        res.json({
            customer_email: customerEmail,
            line_items: session.line_items,
            amount_total: session.amount_total,
            orderSummary,
        });
    } catch (error) {
        console.error("Error fetching session details:", error);
        res.status(500).send("Failed to retrieve session details.");
    }
});

// Import sendConfirmationEmail function
async function sendConfirmationEmail(email, orderSummary) {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your Purchase Confirmation',
            html: `
                <p>Your payment has been successfully processed.</p>
                <h2>Order Summary:</h2>
                <p><strong>Event:</strong> ${orderSummary.eventName}</p>
                <p><strong>Date:</strong> ${orderSummary.eventDate}</p>
                <p><strong>Seats:</strong> ${orderSummary.seatNumbers.join(', ')}</p>
                <p><strong>Quantity:</strong> ${orderSummary.quantity}</p>
                <p><strong>Total Price:</strong> SGD ${(isNaN(orderSummary.totalPrice / 100) ? '50.00' : (orderSummary.totalPrice / 100).toFixed(2))}</p>

            `
        };

        await transporter.sendMail(mailOptions);
        console.log(`Email sent successfully to: ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send confirmation email.');
    }
}

// Define the endpoint
app.post('/send-confirmation-email', async (req, res) => {
    const { email, orderSummary } = req.body;
    try {
        await sendConfirmationEmail(email, orderSummary);
        res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
        console.error('Failed to send email:', error);
        res.status(500).json({ message: 'Failed to send email' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
