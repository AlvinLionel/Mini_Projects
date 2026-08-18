const express = require("express");
const axios = require("axios");
const moment = require("moment");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));

const consumerKey = process.env.CONSUMER_KEY;
const consumerSecret = process.env.CONSUMER_SECRET;
const shortCode = process.env.SHORTCODE;
const passKey = process.env.PASSKEY;
const callbackUrl = process.env.CALLBACK_URL;

const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

async function getToken() {
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString("base64");
  const res = await axios.get(
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials",
    { headers: { Authorization: `Basic ${auth}` } }
  );
  console.log("Access token retrieved");
  return res.data.access_token;
}

app.post("/stkpush", async (req, res) => {
  try {
    const { phone, amount, productId } = req.body;
    console.log("STK Push request received:", { phone, amount, productId });

    const normalizedPhone = String(phone).trim();
    const normalizedAmount = Number.parseInt(amount, 10);

    if (!/^254\d{9}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: "Phone number must be in the format 2547XXXXXXXX." });
    }

    if (!Number.isInteger(normalizedAmount) || normalizedAmount <= 0) {
      return res.status(400).json({ error: "Amount must be a positive integer." });
    }

    const timestamp = moment().format("YYYYMMDDHHmmss");
    const password = Buffer.from(shortCode + passKey + timestamp).toString("base64");
    const token = await getToken();

    const [rows] = await db.execute("SELECT stock FROM products WHERE id = ?", [productId]);
    if (!rows.length || rows[0].stock <= 0) {
      console.log("Product out of stock:", productId);
      return res.status(400).json({ error: "❌ Product out of stock" });
    }

    const stkRes = await axios.post(
      "https://sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest",
      {
        BusinessShortCode: shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: normalizedAmount,
        PartyA: normalizedPhone,
        PartyB: shortCode,
        PhoneNumber: normalizedPhone,
        CallBackURL: callbackUrl,
        AccountReference: "Order123",
        TransactionDesc: "Checkout Payment"
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    console.log("Safaricom STK Response:", stkRes.data);

    const [result] = await db.execute(
      "INSERT INTO transactions (product_id, checkout_request_id, result_code, result_desc, amount, phone_number, status) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        productId,
        stkRes.data.CheckoutRequestID,
        0,
        "Pending",
        amount,
        phone,
        "pending"
      ]
    );

    res.json(stkRes.data);
  } catch (error) {
    if (error.response) {
      console.error("Safaricom error. Full error object:", {
        status: error.response.status,
        headers: error.response.headers,
        data: error.response.data
      });
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error("Error in /stkpush:", error.message);
      res.status(500).json({ error: error.message });
    }
  }
});

app.post("/callback", async (req, res) => {

  const { Body } = req.body;
  if (Body && Body.stkCallback) {
    const cb = Body.stkCallback;
    console.log("Parsed callback:", {
      CheckoutRequestID: cb.CheckoutRequestID,
      ResultCode: cb.ResultCode,
      ResultDesc: cb.ResultDesc
    });

    await db.execute(
      "UPDATE transactions SET result_code=?, result_desc=?, mpesa_receipt_number=?, transaction_date=?, status=? WHERE checkout_request_id=?",
      [
        cb.ResultCode,
        cb.ResultDesc,
        cb.CallbackMetadata?.Item?.find(i => i.Name === "MpesaReceiptNumber")?.Value || null,
        cb.CallbackMetadata?.Item?.find(i => i.Name === "TransactionDate")?.Value || null,
        cb.ResultCode === 0 ? "success" : "failed",
        cb.CheckoutRequestID
      ]
    );

    const [cbResult] = await db.execute(
      "INSERT INTO callbacks (transaction_id, raw_payload) VALUES (?, ?)",
      [cb.CheckoutRequestID, JSON.stringify(req.body)]
    );
    console.log("Callback logged with ID:", cbResult.insertId);

    if (cb.ResultCode === 0) {
      const [rows] = await db.execute(
        "SELECT product_id FROM transactions WHERE checkout_request_id = ?",
        [cb.CheckoutRequestID]
      );
      if (rows.length > 0) {
        const productId = rows[0].product_id;
        await db.execute(
          "UPDATE products SET stock = stock - 1 WHERE id = ?",
          [productId]
        );
      }
    }

    res.json({ ResultCode: 0, ResultDesc: "Callback received successfully" });
  } else {
    console.log("Invalid callback data");
    res.json({ ResultCode: 1, ResultDesc: "Invalid callback data" });
  }
});

app.listen(PORT, () => console.log("Server running on http://localhost:" + PORT));
