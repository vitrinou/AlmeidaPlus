const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { method, table, data, filters, queryString } = req.body;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({ error: 'Supabase credentials not configured' });
    }

    let url = `${SUPABASE_URL}/rest/v1/${table}`;

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'apikey': SUPABASE_KEY
    };

    if ((method === 'POST' || method === 'PATCH') && !queryString) {
      headers['Prefer'] = 'return=representation';
    }

    const queryParams = [];
    if (filters) {
      for (const [key, value] of Object.entries(filters)) {
        queryParams.push(`${key}=eq.${encodeURIComponent(String(value))}`);
      }
    }
    if (queryString) {
      queryParams.push(queryString);
    }
    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    const options = { method, headers };
    if (data && (method === 'POST' || method === 'PATCH')) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);

    if (!response.ok) {
      const text = await response.text();
      console.error('Supabase proxy error:', response.status, text);
      return res.status(response.status).json({ error: `Supabase error: ${response.status}`, detail: text });
    }

    const result = await response.json();
    return res.status(200).json(result);
  } catch (error) {
    console.error('Supabase proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
