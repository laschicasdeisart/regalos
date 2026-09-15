# Audiciones de las Chicas

Landing page de la convocatoria mensual "Audiciones de las Chicas" (Las Chicas de IsArt).

## Dónde vive cada cosa

La página **de verdad**, la que reciben las visitas de Instagram, está publicada en
**`laschicasdeisart.com/audiciones`** — vive en el repo `laschicasdeisart/landingpage`
(carpeta `audiciones/`), servida por GitHub Pages junto al resto del sitio.

Este repo (`regalos`) tiene dos funciones:

1. **Copia de referencia** del mismo HTML/CSS/JS (útil para revisar cambios de copy o
   estilo antes de llevarlos al repo del sitio principal).
2. **Alojar la función serverless** que conecta el formulario con MailerLite
   (`netlify/functions/subscribe.js`), desplegada en Netlify en
   **`https://audiciones.netlify.app`**. GitHub Pages no puede ejecutar código de
   servidor, así que esta pieza hace de puente: recibe los datos del formulario desde
   `laschicasdeisart.com/audiciones` (llamada cross-origin) y ella sí llama a la API de
   MailerLite con la API key guardada de forma segura (variable de entorno, nunca en el
   código ni en el navegador).

Este repo mismo también está desplegado en Netlify (la misma URL de arriba), así que su
copia de `index.html` funciona igual como página de staging — con la ventaja extra de
que, al estar en Netlify de verdad, también usa Netlify Forms como respaldo automático.
La copia de producción (`landingpage/audiciones/`) no tiene Netlify Forms porque
GitHub Pages no lo soporta; su único destino de datos es MailerLite vía la función.

## Estructura

```
index.html                     copia de referencia / staging
css/style.css                  estilos
js/script.js                   validación + envío (Netlify Forms + función MailerLite)
netlify.toml                   config de despliegue (incluye netlify/functions)
netlify/functions/subscribe.js función serverless: recibe el POST y da de alta en MailerLite
images/hero.jpg                foto del hero
```

## Formulario y captura de datos

- **Producción** (`laschicasdeisart.com/audiciones`): el JS llama por fetch a
  `https://audiciones.netlify.app/.netlify/functions/subscribe`, que valida los campos,
  descarta bots (honeypot) y da de alta la suscriptora en MailerLite con los campos
  personalizados `instagram` y `pitch`. Confirmado funcionando de punta a punta.
- **Staging** (este repo, desplegado en Netlify): además de llamar a la misma función,
  también guarda cada envío en Netlify Forms (Site → Forms) como respaldo adicional —
  esto no aplica a la copia de producción por la limitación de GitHub Pages explicada
  arriba.

### Variables de entorno (ya configuradas en Netlify)

- `MAILERLITE_API_KEY` — token de la API de MailerLite.
- `MAILERLITE_GROUP_ID` — opcional; si no está presente, la suscriptora se crea sin
  grupo asignado.

### CORS

`subscribe.js` solo acepta llamadas desde `https://laschicasdeisart.com` y
`https://www.laschicasdeisart.com` (lista `ALLOWED_ORIGINS` al principio del archivo).
Si en el futuro la página se sirve desde otro dominio, hay que añadirlo ahí.

## Si algo falla

Netlify → proyecto `audiciones` → **Cloud compute → Functions → subscribe** tiene el log
en tiempo real de cada invocación (se retiene 24h). Ahí se ve el status code que devolvió
MailerLite y cualquier error de validación.

## Actualizar el contenido de producción

Editar en este repo (`regalos`) para probar visualmente, y cuando esté listo, copiar
`index.html`, `css/style.css`, `js/script.js` e `images/hero.jpg` al repo
`landingpage`, carpeta `audiciones/`, commit y push a `main` — GitHub Pages lo publica
solo, sin pasos adicionales.

## Notas de marca

- Sin esquinas redondeadas en ningún elemento (`border-radius: 0`), según guía de marca.
- Tipografías: Anton (titulares condensados en mayúscula, estilo póster/collage inspirado en rectangles.fm) + Space Mono (etiquetas, números, nota de cierre, estilo "a máquina") + Inter (texto e interfaz).
- Paleta: fondo `#080c0b`, verde azulado `#1b9986`, mostaza `#c8922a`, naranja quemado `#d4622a`.
- Sin emojis en copy ni en iconografía.
