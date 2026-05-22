const TMDB_BEARER_TOKEN = process.env.TMDB_BEARER_TOKEN;
const TMDB_API_KEY = process.env.TMDB_API_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { endpoint, params } = req.body;

    if (!TMDB_BEARER_TOKEN || !TMDB_API_KEY) {
      return res.status(500).json({ error: 'TMDB credentials not configured' });
    }

    const query = new URLSearchParams({ api_key: TMDB_API_KEY, ...(params || {}) });
    const url = `https://api.themoviedb.org/3/${endpoint}?${query.toString()}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${TMDB_BEARER_TOKEN}` }
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('TMDB proxy error:', response.status, text);
      return res.status(response.status).json({ error: `TMDB error: ${response.status}`, detail: text });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('TMDB proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
