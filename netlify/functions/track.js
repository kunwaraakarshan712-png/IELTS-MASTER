// Netlify Function to forward events to LOG_WEBHOOK_URL
exports.handler = async function(event, context) {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method Not Allowed' };
  const webhook = process.env.LOG_WEBHOOK_URL;
  let payload;
  try { payload = JSON.parse(event.body); } catch(e){ payload = {raw: event.body}; }
  if (!webhook) {
    console.log('track event (no webhook):', payload);
    return { statusCode: 204, body: '' };
  }
  try {
    const res = await fetch(webhook, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    const text = await res.text();
    return { statusCode: 200, body: JSON.stringify({ forwarded:true, status: res.status, resp: text }) };
  } catch(err) {
    console.error('forward error', err);
    return { statusCode: 500, body: JSON.stringify({ error: String(err) }) };
  }
};
