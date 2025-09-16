module.exports = async (req, res) => {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
  if(!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).end(JSON.stringify({ error: "missing env vars" }));
  const url = new URL(req.url, `http://${req.headers.host}`);
  const room = url.searchParams.get("room");
  const since = url.searchParams.get("since");
  if(!room) return res.status(400).end(JSON.stringify({ error: "missing room" }));
  let q = `${SUPABASE_URL}/rest/v1/messages?select=*&room=eq.${encodeURIComponent(room)}&order=created_at.asc`;
  if(since){
    q += `&created_at=gt.${encodeURIComponent(since)}`;
  }
  try {
    const r = await fetch(q, { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }});
    const data = await r.json();
    return res.end(JSON.stringify({ messages: data }));
  } catch(err){
    return res.status(500).end(JSON.stringify({ error: String(err) }));
  }
};
