import express from 'express';
import stripePackage from 'stripe';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config();

const stripe = stripePackage(process.env.STRIPE_SECRET_KEY);
const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use(express.static(path.resolve('dist')));

// Create checkout session
app.post('/create-checkout-session', async (req, res) => {
  const { quantity, price, customerEmail } = req.body; 
  const imageUrl = 'https://via.placeholder.com/150'; 

  try {
    // Create a customer in Stripe
    const customer = await stripe.customers.create({
      email: customerEmail,
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'sgd',
          product_data: {
            name: 'Tate McRae: THINK LATER TOUR',
            description: 'Seat: 38',
            images: [imageUrl], 
          },
          unit_amount: price * 100, // Convert to cents
        },
        quantity: quantity,
      }],
      mode: 'payment',
      success_url: `https://ticke-tree-backend.vercel.app/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: 'ticke-tree-backend.vercel.app/error',
      customer: customer.id, // Use the created customer ID
      allow_promotion_codes: true,
    });

    console.log(session);  // Log for debugging
    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
});

// Retrieve checkout session details
app.get('/checkout-session', async (req, res) => {
  const { session_id } = req.query;

  try {
    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['line_items.data.price.product', 'customer'], // Expand the customer object
    });

    // Log to check if customer_email is present
    console.log("Session Details:", session);

    res.json({
      customer_email: session.customer.email, // Access email from the customer object
      line_items: session.line_items,
      amount_total: session.amount_total,
    });
  } catch (error) {
    console.error("Error retrieving checkout session:", error);
    res.status(500).json({ error: "Failed to retrieve checkout session" });
  }
});

// Send confirmation email
app.post('/send-confirmation-email', async (req, res) => {
  const { email, orderSummary } = req.body;

  let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
          user: process.env.EMAIL_USER, // Use environment variable for email
          pass: process.env.EMAIL_PASS, // Use environment variable for app-specific password
      }
  });

  let mailOptions = {
      from: process.env.EMAIL_USER, // Use environment variable for email
      to: email,
      subject: 'Your Purchase Confirmation',
      html: `
          <h1>Thank You for Your Purchase!</h1>
          <p>Your payment has been successfully processed.</p>
          <h2>Order Summary:</h2>
          <p><strong>Event:</strong> ${orderSummary.eventName}</p>
          <p><strong>Quantity:</strong> ${orderSummary.quantity}</p>
          <p><strong>Total Price:</strong> SGD ${(orderSummary.totalPrice / 100).toFixed(2)}</p>\
      `
  };

  try {
      await transporter.sendMail(mailOptions);
      res.json({ message: 'Email sent successfully' });
  } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
  }
});

// Start the server
app.listen(3000, () => console.log('Backend server running on port 3000'));
