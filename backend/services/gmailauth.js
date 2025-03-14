import { google } from "googleapis";
import nodemailer from "nodemailer";
import { ObjectId } from "mongodb";
import dotenv from "dotenv";

dotenv.config();

// Create OAuth2 client
const createOAuth2Client = () => {
  const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI } = process.env;

  if (!CLIENT_ID || !CLIENT_SECRET || !REDIRECT_URI) {
    console.error("Missing OAuth2 environment variables");
    throw new Error("Missing Google OAuth2 environment variables");
  }

  console.log("OAuth2 client created");
  return new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);
};

// Generate OAuth2 authorization URL
export const getAuthUrl = (userId) => {
  if (!userId) {
    console.error("No userId provided to getAuthUrl");
    throw new Error("Missing userId parameter");
  }

  console.log(`Generating auth URL for userId: ${userId}`);

  const oAuth2Client = createOAuth2Client();
  const SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/userinfo.email",
  ];

  const url = oAuth2Client.generateAuthUrl({
    scope: SCOPES,
    access_type: "offline",
    state: userId,
    prompt: "consent"
  });

  console.log(`Auth URL generated: ${url}`);
  return url;
};

// Save user tokens after OAuth2 callback
export const saveUserTokens = async (userId, code, db) => {
  try {
    console.log(`Exchanging code for tokens | userId: ${userId}, code: ${code}`);
    const oAuth2Client = createOAuth2Client();
    const { tokens } = await oAuth2Client.getToken(code);

    if (!tokens.refresh_token) {
      console.error("Missing refresh token. Check if 'offline' and 'consent' were set.");
      throw new Error("No refresh token received.");
    }

    oAuth2Client.setCredentials(tokens);

    const oauth2 = google.oauth2({ version: "v2", auth: oAuth2Client });
    const { data: userInfo } = await oauth2.userinfo.get();
    const gmailEmail = userInfo.email;

    console.log(`Gmail connected: ${gmailEmail}`);
    console.log(`Saving tokens to DB for user: ${userId}`);

    // Save access token, refresh token, and expiry date to the DB
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          gmail: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiryDate: tokens.expiry_date,
            gmailEmail,
          },
        },
      }
    );

    console.log(`Tokens saved successfully for user: ${userId}`);
    return tokens;
  } catch (err) {
    console.error("Error in saveUserTokens:", err.message);
    throw new Error(`OAuth2 token exchange failed: ${err.message}`);
  }
};

// Handle OAuth2 callback to process code and user authentication
export const handleOAuth2Callback = async (req, res) => {
  const { code, state: userId } = req.query;

  console.log(`OAuth2 callback received | code: ${code}, userId: ${userId}`);

  if (!code || !userId) {
    console.error("Missing code or userId in OAuth2 callback");
    return res.status(400).json({ error: "Missing authorization code or userId" });
  }

  try {
    const tokens = await saveUserTokens(userId, code, req.db);
    console.log("OAuth2 callback handled successfully");
    res.status(200).json({ success: true, tokens });
  } catch (err) {
    console.error("Failed to handle OAuth2 callback:", err.message);
    res.status(500).json({ error: "Failed to authenticate user with Google", details: err.message });
  }
};

// Create nodemailer transporter with OAuth2 credentials
export const createTransporter = async (userId, db) => {
  console.log(`Creating transporter for userId: ${userId}`);
  const user = await db.collection("users").findOne({ _id: new ObjectId(userId) });

  if (!user || !user.gmail || !user.gmail.refreshToken) {
    console.error("Gmail OAuth2 not configured for user");
    throw new Error("Gmail OAuth2 not configured for this user.");
  }

  const { accessToken, refreshToken, expiryDate, gmailEmail } = user.gmail;

  if (!gmailEmail) {
    console.error("Missing Gmail email in DB");
    throw new Error("Missing Gmail email address. Please re-authenticate.");
  }

  const oAuth2Client = createOAuth2Client();
  oAuth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: expiryDate,
  });

  let updatedAccessToken = accessToken;

  // Refresh if token is expired
  if (!accessToken || Date.now() >= expiryDate) {
    console.log("Access token expired. Refreshing...");
    const { token: newAccessToken } = await oAuth2Client.getAccessToken();
    updatedAccessToken = newAccessToken;

    console.log("Access token refreshed");

    // Save the new access token and updated expiry date in DB
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          "gmail.accessToken": updatedAccessToken,
        },
      }
    );
    console.log("Updated tokens in DB");
  }

  // Create the transporter using the new/updated access token
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: gmailEmail,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      refreshToken: refreshToken,
      accessToken: updatedAccessToken,  // Use the refreshed token
    },
  });

  console.log("Transporter created successfully");

  return {
    transporter,
    userEmail: gmailEmail,
    updatedAccessToken,
    refreshToken
  };
};
