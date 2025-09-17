import { v4 as uuidv4 } from 'uuid';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(JSON.stringify({ error: 'method not allowed' }));
  }

  try {
    const body = req.body ? JSON.parse(req.body) : {};
    const { name } = body;

    if (!name) {
      return res.status(400).end(JSON.stringify({ error: 'missing name' }));
    }

    // ✅ Use UUID v4 instead of randCode(6)
    const room = uuidv4();

    const r = await fetch(`${SUPABASE_URL}/rest/v1/rooms`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ id: room, host_name: name })
    });

    if (!r.ok) {
      const errText = await r.text();
      return res.status(500).end(JSON.stringify({ error: errText }));
    }

    return res.end(JSON.stringify({ room }));
  } catch (e) {
    console.error('create_room error', e);
    return res.status(500).end(JSON.stringify({ error: String(e) }));
  }
}

