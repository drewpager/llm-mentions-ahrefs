import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type, Accept');
    return res.status(200).end();
  }

  // Get the path from the catch-all route
  const { path } = req.query;
  const apiPath = Array.isArray(path) ? path.join('/') : path || '';

  // Build Ahrefs API URL
  const url = new URL(`https://api.ahrefs.com/v3/${apiPath}`);

  // Forward query parameters (excluding the path param)
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path' && value) {
      url.searchParams.append(key, String(value));
    }
  });

  const apiKey = req.headers.authorization;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const response = await fetch(url.toString(), {
      method: req.method || 'GET',
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({
      error: 'Failed to fetch from Ahrefs API',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
