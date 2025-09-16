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
  const sender = body.sender || "unknown";
  const payload = body.payload || {};
  try {
    await fetch(`${SUPABASE_URL}/rest/v1/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation"
      },
      body: JSON.stringify({ room, sender, payload })
    });
    return res.end(JSON.stringify({ ok: true }));
  } catch (err){
    return res.status(500).end(JSON.stringify({ error: String(err) }));
  }
};
