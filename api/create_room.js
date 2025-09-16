function randCode(len=6){
  const chars = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let s = "";
  for(let i=0;i<len;i++) s += chars[Math.floor(Math.random()*chars.length)];
  return s;
}
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
  try { body = await getJSON(req); } catch(e){ return res.status(400).end(JSON.stringify({ error: "invalid json body" })); }
  const name = body.name || "Host";
  const room = randCode(6);
  try {
    const r = await fetch(`${SUPABASE_URL}/rest/v1/rooms`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ id: room, host_name: name })
    });
    if (!r.ok) {
      const txt = await r.text();
      return res.status(500).end(JSON.stringify({ error: txt }));
    }
    return res.end(JSON.stringify({ room }));
  } catch (err) {
    return res.status(500).end(JSON.stringify({ error: String(err) }));
  }
};
