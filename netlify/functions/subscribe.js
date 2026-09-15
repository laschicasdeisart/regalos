const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.handler = async function (event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  var apiKey = process.env.MAILERLITE_API_KEY;
  var groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey || !groupId) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "MailerLite no está configurado (falta MAILERLITE_API_KEY o MAILERLITE_GROUP_ID en Netlify).",
      }),
    };
  }

  var data;
  try {
    data = JSON.parse(event.body || "{}");
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: "JSON inválido." }) };
  }

  var email = (data.email || "").trim();
  var instagram = (data.instagram || "").trim();
  var pitch = (data.pitch || "").trim();

  if (!email || !EMAIL_RE.test(email) || !instagram || !pitch) {
    return { statusCode: 400, body: JSON.stringify({ error: "Faltan campos obligatorios." }) };
  }

  try {
    var response = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: "Bearer " + apiKey,
      },
      body: JSON.stringify({
        email: email,
        fields: {
          instagram: instagram,
          pitch: pitch,
        },
        groups: [groupId],
      }),
    });

    var responseBody = await response.text();

    if (!response.ok) {
      return {
        statusCode: 502,
        body: JSON.stringify({ error: "MailerLite rechazó la petición.", detail: responseBody }),
      };
    }

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (err) {
    return {
      statusCode: 502,
      body: JSON.stringify({ error: "No se pudo contactar con MailerLite.", detail: String(err) }),
    };
  }
};
