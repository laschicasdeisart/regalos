# Audiciones de las Chicas

Landing page de la convocatoria mensual "Audiciones de las Chicas" (Las Chicas de IsArt). Sitio estático, sin build — listo para desplegar en Netlify.

## Estructura

```
index.html                     página completa
css/style.css                  estilos
js/script.js                   validación de formulario + envío AJAX
netlify.toml                   configuración de despliegue
netlify/functions/subscribe.js función serverless que da de alta en MailerLite
images/                        carpeta para la imagen del hero (ver abajo)
```

## Pendientes a rellenar

### 1. Imagen del hero
Coloca el archivo de la foto (las chicas estilo directoras de casting de cine) en:

```
images/hero.jpg
```

No hay que tocar nada más — el CSS ya referencia esa ruta (`css/style.css`, clase `.hero-media`). Mientras el archivo no exista, la sección se ve bien igualmente con el fondo oscuro de marca.

Recomendado: imagen apaisada, buena resolución (mínimo 1600px de ancho), peso optimizado (idealmente por debajo de 400 KB) para que cargue rápido en móvil.

Forma más rápida de subirla sin herramientas extra: en GitHub, entra al repo → carpeta `images/` → "Add file" → "Upload files" → sube el archivo con el nombre exacto `hero.jpg`. En cuanto esté en esa ruta, la web la recoge sola.

### 2. Enlace al Portfolio
Ya apunta a `https://portafolio.laschicasdeisart.com/` (sección `intro` en `index.html`). Si cambia la URL en el futuro, se edita ahí directamente.

## Formulario y captura de datos

Cada envío se guarda en **dos sitios a la vez**:

1. **Netlify Forms** — respaldo automático, sin configuración. Netlify detecta el `<form name="casting-form" data-netlify="true">` en el HTML y guarda cada envío en Site → Forms (exportable a CSV). Sirve de red de seguridad si algo falla en el paso 2.
2. **MailerLite** — alta automática de la suscriptora en tu cuenta, en tiempo real, vía una función serverless (`netlify/functions/subscribe.js`) que llama a la API de MailerLite desde el servidor (así la API key nunca queda expuesta en el navegador). Esto es lo que evita tener que exportar manualmente de Netlify a MailerLite.

El envío se hace por AJAX (fetch a ambos destinos en paralelo), así que la usuaria ve la confirmación en la misma página sin recargar ni redirigir. Incluye un campo honeypot (`bot-field`) oculto para filtrar spam.

### Configurar MailerLite (una sola vez)

1. **Crea los campos personalizados** en MailerLite (Subscribers → Fields → Create field, tipo texto):
   - Un campo llamado `Instagram` (la key resultante debe ser `instagram`).
   - Un campo llamado `Pitch` (la key resultante debe ser `pitch`).
   Si le pones otro nombre y la key sale distinta, avísame para ajustar `netlify/functions/subscribe.js` a esa key exacta.

2. **Crea (o elige) el grupo** donde quieres que caigan las audiciones, por ejemplo "Audiciones de las Chicas". Abre el grupo en MailerLite y copia su **Group ID** (aparece en la URL al entrar al grupo, o en Settings del grupo).

3. **Genera una API key**: MailerLite → Integrations → Developer API → Generate new token.

4. **Añade dos variables de entorno en Netlify** (Site settings → Environment variables) — nunca las pegues en el código ni me las compartas por chat:
   - `MAILERLITE_API_KEY` = el token del paso 3.
   - `MAILERLITE_GROUP_ID` = el ID del paso 2.

5. Vuelve a desplegar el sitio (o simplemente el primer deploy si aún no lo has hecho) para que la función recoja las variables.

Si en algún momento la llamada a MailerLite falla (API caída, variables mal puestas, etc.), la ficha sigue quedando guardada en Netlify Forms igualmente — no se pierde ningún envío, solo no se auto-sincroniza ese caso puntual con MailerLite hasta que lo revises.

## Despliegue en Netlify

1. Conecta este repositorio en Netlify (New site from Git).
2. Build command: (vacío / ninguno).
3. Publish directory: `.`
4. Netlify detecta `netlify/functions` automáticamente (ya está declarado en `netlify.toml`).
5. Añade las variables de entorno de MailerLite (ver arriba) antes o después del primer deploy.
6. Deploy.

## Notas de marca

- Sin esquinas redondeadas en ningún elemento (`border-radius: 0`), según guía de marca.
- Tipografías: Bodoni Moda (titulares, estilo editorial/cinematográfico) + Inter (texto e interfaz).
- Paleta: fondo `#080c0b`, verde azulado `#1b9986`, mostaza `#c8922a`, naranja quemado `#d4622a`.
- Sin emojis en copy ni en iconografía.
