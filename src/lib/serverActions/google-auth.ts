import { google } from "googleapis";

const oauth2Client = new google.auth.OAuth2(
  process.env.AUTH_GOOGLE_ID,
  process.env.AUTH_GOOGLE_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export default oauth2Client;
