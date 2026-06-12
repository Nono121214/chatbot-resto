// netlify/functions/reservation.js
exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  let resa;
  try { resa = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "JSON invalide" }) }; }

  // Trace dans les logs Netlify (toujours consultable)
  console.log("📅 NOUVELLE RÉSERVATION:", JSON.stringify(resa));

  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (webhookUrl) {
    try {
      const res = await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "chatbot-site",
          recue_le: new Date().toISOString(),
          ...resa
        })
      });
      if (!res.ok) console.error("Webhook n8n a répondu:", res.status);
    } catch (err) {
      console.error("Webhook n8n injoignable:", err.message);
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
