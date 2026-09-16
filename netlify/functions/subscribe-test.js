const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Grupo "Audiciones" en MailerLite (mismo grupo que la landing de
// Audiciones — decisión explícita para que estos leads compartan
// secuencia de nutrición). No es un dato sensible, así que va fijo
// aquí en vez de depender de una variable de entorno en Netlify.
const GROUP_ID = "198700581779408193";

// Orígenes desde los que puede llamarse esta función (la página vive en
// laschicasdeisart.com/testcommunity, servida por GitHub Pages, fuera de Netlify).
var ALLOWED_ORIGINS = [
  "https://laschicasdeisart.com",
  "https://www.laschicasdeisart.com",
];

function corsHeaders(origin) {
  var allowed = ALLOWED_ORIGINS.indexOf(origin) !== -1;
  var headers = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  if (allowed) {
    headers["Access-Control-Allow-Origin"] = origin;
  }
  return headers;
}

exports.handler = async function (event) {
  var origin = (event.headers && (event.headers.origin || event.headers.Origin)) || "";
  var headers = corsHeaders(origin);

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: headers, body: "Method Not Allowed" };
  }

  var apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: headers,
      body: JSON.stringify({ error: "MailerLite no está configurado (falta MAILERLITE_API_KEY en Netlify)." }),
    };
  }

  var data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "JSON inválido." }) };
  }

  // Honeypot: si el campo trampa viene relleno, es un bot — respondemos ok sin llamar a MailerLite.
  if ((data["bot-field"] || "").trim()) {
    return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
  }

  var email = (data.email || "").trim();

  if (!email || !EMAIL_RE.test(email)) {
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "Falta el email." }) };
  }

  var payload = {
    email: email,
    groups: [GROUP_ID],
  };

  try {
    var response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify(payload),
    });

    var responseBody = await response.text();

    if (!response.ok) {
      console.log("subscribe-test: mailerlite rejected status=" + response.status + " body=" + responseBody);
      return {
        statusCode: 502,
        headers: headers,
        body: JSON.stringify({ error: "MailerLite rechazó la petición.", detail: responseBody }),
      };
    }

    return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.log("subscribe-test: exception " + String(err));
    return {
      statusCode: 502,
      headers: headers,
      body: JSON.stringify({ error: "No se pudo contactar con MailerLite.", detail: String(err) }),
    };
  }
};
