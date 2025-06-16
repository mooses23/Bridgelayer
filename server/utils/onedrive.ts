import axios from "axios";
import qs from "qs";

export function getOneDriveAuthUrl(state: string) {
  const params = qs.stringify({
    client_id: process.env.ONEDRIVE_CLIENT_ID,
    scope: "Files.ReadWrite.All offline_access",
    response_type: "code",
    redirect_uri: `${process.env.BACKEND_URL}/oauth/onedrive/callback`,
    response_mode: "query",
    state,
  });
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}`;
}

export async function exchangeOneDriveCode(code: string) {
  const res = await axios.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", qs.stringify({
    client_id: process.env.ONEDRIVE_CLIENT_ID,
    client_secret: process.env.ONEDRIVE_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: `${process.env.BACKEND_URL}/oauth/onedrive/callback`,
  }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return res.data;
}

export async function refreshOneDriveToken(refresh_token: string) {
  const res = await axios.post("https://login.microsoftonline.com/common/oauth2/v2.0/token", qs.stringify({
    client_id: process.env.ONEDRIVE_CLIENT_ID,
    client_secret: process.env.ONEDRIVE_CLIENT_SECRET,
    refresh_token,
    grant_type: "refresh_token",
    redirect_uri: `${process.env.BACKEND_URL}/oauth/onedrive/callback`,
  }), { headers: { "Content-Type": "application/x-www-form-urlencoded" } });
  return res.data;
}