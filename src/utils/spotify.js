// Spotify Web API service with PKCE Authentication
// Note: You need to set these as environment variables or create a .env file
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI || `${window.location.origin}/callback`;
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-read-playback-state',
  'user-modify-playback-state'
].join(' ');

let accessToken = localStorage.getItem('spotify_access_token');
let refreshToken = localStorage.getItem('spotify_refresh_token');
let tokenExpiry = parseInt(localStorage.getItem('spotify_token_expiry') || '0');

// PKCE Helper Functions
function generateRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], '');
}

async function sha256(plain) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest('SHA-256', data);
}

function base64urlencode(arrayBuffer) {
  const bytes = new Uint8Array(arrayBuffer);
  let str = '';
  bytes.forEach(b => str += String.fromCharCode(b));
  return btoa(str)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
  const hashed = await sha256(codeVerifier);
  return base64urlencode(hashed);
}

export async function getAuthURL() {
  const codeVerifier = generateRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  
  // Store the code verifier for later use
  sessionStorage.setItem('spotify_code_verifier', codeVerifier);
  
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge
  });
  
  const authUrl = `https://accounts.spotify.com/authorize?${params.toString()}`;
  
  // DEBUG: Log the values being used
  console.log('=== SPOTIFY AUTH DEBUG ===');
  console.log('CLIENT_ID:', CLIENT_ID);
  console.log('REDIRECT_URI:', REDIRECT_URI);
  console.log('Full Auth URL:', authUrl);
  console.log('==========================');
  
  return authUrl;
}

export async function exchangeCode(code) {
  const codeVerifier = sessionStorage.getItem('spotify_code_verifier');
  
  if (!codeVerifier) {
    throw new Error('Code verifier not found. Please try logging in again.');
  }
  
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        code_verifier: codeVerifier
      })
    });

    const data = await response.json();
    
    // Clear the code verifier after use
    sessionStorage.removeItem('spotify_code_verifier');
    
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token, data.expires_in);
      return data.access_token;
    }
    throw new Error(data.error_description || data.error || 'Failed to get access token');
  } catch (err) {
    console.error('Token exchange error:', err);
    throw err;
  }
}

export function setTokens(token, refresh, expiresIn) {
  accessToken = token;
  refreshToken = refresh;
  tokenExpiry = Date.now() + (expiresIn * 1000);
  
  localStorage.setItem('spotify_access_token', token);
  localStorage.setItem('spotify_refresh_token', refresh);
  localStorage.setItem('spotify_token_expiry', tokenExpiry.toString());
}

export async function getAccessToken() {
  // Check if token is expired
  if (Date.now() > tokenExpiry && refreshToken) {
    await refreshAccessToken();
  }
  return accessToken;
}

async function refreshAccessToken() {
  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID
      })
    });

    const data = await response.json();
    if (data.access_token) {
      setTokens(data.access_token, data.refresh_token || refreshToken, data.expires_in);
    }
  } catch (err) {
    console.error('Token refresh error:', err);
    clearTokens();
  }
}

export function clearTokens() {
  accessToken = null;
  refreshToken = null;
  tokenExpiry = 0;
  localStorage.removeItem('spotify_access_token');
  localStorage.removeItem('spotify_refresh_token');
  localStorage.removeItem('spotify_token_expiry');
}

export async function getCurrentUser() {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return await response.json();
  } catch (err) {
    console.error('Get user error:', err);
    return null;
  }
}

export async function searchTracks(query) {
  const token = await getAccessToken();
  if (!token) return [];

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data = await response.json();
    return data.tracks?.items || [];
  } catch (err) {
    console.error('Search error:', err);
    return [];
  }
}

export async function playTrack(trackUri, deviceId) {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/me/player/play${deviceId ? `?device_id=${deviceId}` : ''}`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ uris: [trackUri] })
      }
    );
    return response.ok;
  } catch (err) {
    console.error('Play track error:', err);
    return false;
  }
}

export async function pausePlayback() {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (err) {
    console.error('Pause error:', err);
    return false;
  }
}

export async function resumePlayback() {
  const token = await getAccessToken();
  if (!token) return false;

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.ok;
  } catch (err) {
    console.error('Resume error:', err);
    return false;
  }
}

export async function getPlaybackState() {
  const token = await getAccessToken();
  if (!token) return null;

  try {
    const response = await fetch('https://api.spotify.com/v1/me/player', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (err) {
    console.error('Get playback state error:', err);
    return null;
  }
}

export function isAuthenticated() {
  return !!accessToken && Date.now() < tokenExpiry;
}

export function getStoredToken() {
  return accessToken;
}
