
import axios from 'axios';

const ONEDRIVE_CLIENT_ID = process.env.ONEDRIVE_CLIENT_ID;
const ONEDRIVE_CLIENT_SECRET = process.env.ONEDRIVE_CLIENT_SECRET;
const ONEDRIVE_REDIRECT_URI = `${process.env.BACKEND_URL}/oauth/onedrive/callback`;

export function getOneDriveAuthUrl(tenantId: string): string {
  const params = new URLSearchParams({
    client_id: ONEDRIVE_CLIENT_ID!,
    response_type: 'code',
    redirect_uri: ONEDRIVE_REDIRECT_URI,
    scope: 'Files.ReadWrite offline_access',
    state: tenantId,
  });
  
  return `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params.toString()}`;
}

export async function exchangeOneDriveCode(code: string) {
  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    grant_type: 'authorization_code',
    client_id: ONEDRIVE_CLIENT_ID,
    client_secret: ONEDRIVE_CLIENT_SECRET,
    code,
    redirect_uri: ONEDRIVE_REDIRECT_URI,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data;
}

export async function refreshOneDriveToken(refreshToken: string) {
  const response = await axios.post('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    grant_type: 'refresh_token',
    client_id: ONEDRIVE_CLIENT_ID,
    client_secret: ONEDRIVE_CLIENT_SECRET,
    refresh_token: refreshToken,
  }, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  
  return response.data;
}
