const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Orígenes desde los que puede llamarse esta función (la landing vive en
// laschicasdeisart.com/audiciones, servida por GitHub Pages, fuera de Netlify).
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

  console.log("subscribe: method=" + event.httpMethod + " origin=" + origin + " originAllowed=" + (headers["Access-Control-Allow-Origin"] ? "yes" : "no"));

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: headers, body: "Method Not Allowed" };
  }

  var apiKey = process.env.MAILERLITE_API_KEY;
  var groupId = process.env.MAILERLITE_GROUP_ID;

  console.log("subscribe: apiKeyPresent=" + Boolean(apiKey) + " groupIdPresent=" + Boolean(groupId));

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
    console.log("subscribe: invalid JSON body=" + event.body);
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "JSON inválido." }) };
  }

  // Honeypot: si el campo trampa viene relleno, es un bot — respondemos ok sin llamar a MailerLite.
  if ((data["bot-field"] || "").trim()) {
    return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
  }

  var email = (data.email || "").trim();
  var instagram = (data.instagram || "").trim();
  var pitch = (data.pitch || "").trim();

  if (!email || !EMAIL_RE.test(email) || !instagram || !pitch) {
    console.log("subscribe: missing/invalid fields email=" + JSON.stringify(email) + " instagram=" + JSON.stringify(instagram) + " pitchLen=" + pitch.length);
    return { statusCode: 400, headers: headers, body: JSON.stringify({ error: "Faltan campos obligatorios." }) };
  }

  var payload = {
    email: email,
    fields: {
      instagram: instagram,
      pitch: pitch,
    },
  };
  if (groupId) {
    payload.groups = [groupId];
  }

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

    console.log("subscribe: mailerlite status=" + response.status + " body=" + responseBody);

    if (!response.ok) {
      return {
        statusCode: 502,
        headers: headers,
        body: JSON.stringify({ error: "MailerLite rechazó la petición.", detail: responseBody }),
      };
    }

    return { statusCode: 200, headers: headers, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    console.log("subscribe: exception " + String(err));
    return {
      statusCode: 502,
      headers: headers,
      body: JSON.stringify({ error: "No se pudo contactar con MailerLite.", detail: String(err) }),
    };
  }
};
