async function getJSON(req){
  return new Promise((resolve, reject)=>{
    let data = "";
    req.on("data", c => data += c);
    req.on("end", ()=> {
      if(!data) return resolve({});
      try{ resolve(JSON.parse(data)); } catch(e){ reject(e); }
    });
    req.on("error", reject);
  });
}
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).end(JSON.stringify({ error: "method not allowed" }));
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE;
  if(!SUPABASE_URL || !SUPABASE_KEY) return res.status(500).end(JSON.stringify({ error: "missing env vars" }));
  let body;
  try { body = await getJSON(req); } catch(e){ return res.status(400).end(JSON.stringify({ error: "invalid json" })); }
  const room = body.room;
  const name = body.name || "Client";
  if(!room) return res.status(400).end(JSON.stringify({ error: "missing room" }));
  try {
    // check room exists
    const q = `${SUPABASE_URL}/rest/v1/rooms?id=eq.${encodeURIComponent(room)}&select=host_name`;
    const chk = await fetch(q, { headers: { "apikey": SUPABASE_KEY, "Authorization": `Bearer ${SUPABASE_KEY}` }});
    const arr = await chk.json();
    if(!arr || arr.length === 0) return res.status(404).end(JSON.stringify({ error: "room not found" }));
    const host_name = arr[0].host_name || "Host";
    // send hello message
    const payload = { type: "hello", name };
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ room, sender: name, payload })
    });
    return res.end(JSON.stringify({ ok: true, host_name }));
  } catch(err){
    return res.status(500).end(JSON.stringify({ error: String(err) }));
  }
};
