import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Proxy all requests to Ahrefs API using middleware approach
app.use('/api', async (req, res) => {
  const apiPath = req.path;
  const url = new URL(`https://api.ahrefs.com/v3${apiPath}`);

  // Forward query parameters
  Object.entries(req.query).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, String(value));
  });

  const apiKey = req.headers.authorization;

  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  console.log(`[Proxy] ${req.method} ${url.toString()}`);

  try {
    const response = await fetch(url.toString(), {
      method: req.method,
      headers: {
        'Authorization': apiKey,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      console.log(`[Proxy] Error ${response.status}:`, data);
      return res.status(response.status).json(data);
    }

    console.log(`[Proxy] Success: ${response.status}`);
    res.json(data);
  } catch (error) {
    console.error('[Proxy] Error:', error.message);
    res.status(500).json({ error: 'Failed to fetch from Ahrefs API', details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
  console.log('Ready to proxy requests to Ahrefs API');
});
