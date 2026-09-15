(function () {
  "use strict";

  var form = document.getElementById("casting-form");
  var confirmation = document.getElementById("form-confirmation");

  if (!form) return;

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function setError(fieldId, message) {
    var field = document.getElementById(fieldId);
    var wrapper = field.closest(".field");
    var errorEl = document.getElementById("error-" + fieldId);
    wrapper.classList.add("has-error");
    errorEl.textContent = message;
  }

  function clearError(fieldId) {
    var field = document.getElementById(fieldId);
    var wrapper = field.closest(".field");
    var errorEl = document.getElementById("error-" + fieldId);
    wrapper.classList.remove("has-error");
    errorEl.textContent = "";
  }

  function validate() {
    var valid = true;

    var email = document.getElementById("email").value.trim();
    var instagram = document.getElementById("instagram").value.trim();
    var pitch = document.getElementById("pitch").value.trim();

    if (!email || !EMAIL_RE.test(email)) {
      setError("email", "Introduce un email válido.");
      valid = false;
    } else {
      clearError("email");
    }

    if (!instagram) {
      setError("instagram", "Cuéntanos tu @ de Instagram.");
      valid = false;
    } else {
      clearError("instagram");
    }

    if (!pitch || pitch.length < 10) {
      setError("pitch", "Cuéntanos un poco más — al menos unas frases.");
      valid = false;
    } else {
      clearError("pitch");
    }

    return valid;
  }

  ["email", "instagram", "pitch"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      clearError(id);
    });
  });

  function encodeForm(data) {
    return Object.keys(data)
      .map(function (key) {
        return encodeURIComponent(key) + "=" + encodeURIComponent(data[key]);
      })
      .join("&");
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    var submitBtn = form.querySelector(".btn-submit");
    submitBtn.disabled = true;
    submitBtn.textContent = "Enviando...";

    var email = document.getElementById("email").value.trim();
    var instagram = document.getElementById("instagram").value.trim();
    var pitch = document.getElementById("pitch").value.trim();

    var formPayload = {
      "form-name": "casting-form",
      email: email,
      instagram: instagram,
      pitch: pitch,
    };

    // Registro de respaldo en Netlify Forms (siempre queda guardado aquí).
    var savedToNetlify = fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeForm(formPayload),
    });

    // Alta en tiempo real en MailerLite, vía función serverless (mantiene la API key fuera del navegador).
    var savedToMailerLite = fetch("/.netlify/functions/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email, instagram: instagram, pitch: pitch }),
    }).catch(function () {
      /* best-effort: si falla, la ficha sigue quedando en Netlify Forms */
    });

    Promise.all([savedToNetlify, savedToMailerLite])
      .then(function (results) {
        var netlifyResponse = results[0];
        if (!netlifyResponse.ok) {
          throw new Error("Network response was not ok");
        }
        form.hidden = true;
        confirmation.hidden = false;
        confirmation.scrollIntoView({ behavior: "smooth", block: "center" });
      })
      .catch(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = "Quiero audicionar";
        setError("pitch", "Algo ha fallado al enviar. Inténtalo de nuevo en unos segundos.");
      });
  });
})();
