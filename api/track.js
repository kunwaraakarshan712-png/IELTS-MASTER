// Vercel Serverless Function: forwards events to a configured webhook.
// Set environment variable LOG_WEBHOOK_URL to an endpoint that accepts JSON POSTs.
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const payload = req.body || {};
  const webhook = process.env.LOG_WEBHOOK_URL;
  if (!webhook) {
    // If no webhook configured, return 204 (accepted) — logs are still visible in server logs
    console.log('track event (no webhook):', payload);
    return res.status(204).end();
  }
  try {
    const r = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await r.text();
    return res.status(200).json({ forwarded: true, status: r.status, resp: text });
  } catch (err) {
    console.error('forward error', err);
    return res.status(500).json({ error: String(err) });
  }
}
