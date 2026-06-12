// netlify/functions/reservation.js
// Reçoit une réservation confirmée et la transmet au restaurant.
// Priorité 1 : webhook n8n (variable N8N_WEBHOOK_URL) → de là tu peux faire
//              Google Agenda, email, SMS, Google Sheets, etc.
// Si la variable n'est pas définie : la réservation est simplement journalisée
// dans les logs Netlify (Functions → reservation → logs). Le chatbot, lui,
// fonctionne dans tous les cas.

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Méthode non autorisée" }) };
  }

  let resa;
  try { resa = JSON.parse(event.body || "{}"); }
  catch { return { statusCode: 400, body: JSON.stringify({ error: "JSON invalide" }) }; }

  // Trace systématique dans les logs Netlify (toujours consultable)
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
      // On ne renvoie pas d'erreur au client : la résa est dans les logs.
    }
  }

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ok: true })
  };
};
