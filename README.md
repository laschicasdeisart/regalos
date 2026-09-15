# Audiciones de las Chicas

Landing page de la convocatoria mensual "Audiciones de las Chicas" (Las Chicas de IsArt). Sitio estático, sin build — listo para desplegar en Netlify.

## Estructura

```
index.html      página completa
css/style.css   estilos
js/script.js    validación de formulario + envío AJAX
netlify.toml    configuración de despliegue
images/         carpeta para la imagen del hero (ver abajo)
```

## Pendientes a rellenar

### 1. Imagen del hero
Coloca el archivo de la foto ("las chicas estilo directoras de casting de cine") en:

```
images/hero.jpg
```

No hay que tocar nada más — el CSS ya referencia esa ruta (`css/style.css`, clase `.hero-media`). Mientras el archivo no exista, la sección se ve bien igualmente con el fondo oscuro de marca (degradados sutiles en verde azulado y naranja quemado).

Recomendado: imagen apaisada, buena resolución (mínimo 1600px de ancho), peso optimizado (idealmente por debajo de 400 KB) para que cargue rápido en móvil.

### 2. Enlace al Portfolio
En `index.html`, busca el comentario `PLACEHOLDER ENLACE` (dentro de la sección `intro`) y sustituye el `href="#"` del enlace "Portfolio" por la URL real:

```html
<a href="#" class="link-accent portfolio-placeholder-link" data-placeholder="true">Portfolio</a>
```

## Formulario y captura de datos

El formulario usa **Netlify Forms** (sin backend propio). Al desplegar en Netlify:

- Netlify detecta automáticamente el `<form name="casting-form" data-netlify="true">` en el HTML.
- Cada envío queda guardado en **Site → Forms** dentro del panel de Netlify, exportable a CSV.
- Puedes activar notificaciones por email en Netlify (Site settings → Forms → Form notifications) para recibir un aviso cada vez que alguien audiciona.
- Incluye un campo honeypot (`bot-field`) oculto para filtrar spam automático.
- El envío se hace por AJAX (fetch), así que la usuaria ve la confirmación en la misma página sin recargar ni redirigir.

No se necesita ninguna otra integración (Google Sheets, email propio, etc.) — Netlify Forms cubre el requisito de "guardar cada envío en algún sitio accesible".

## Despliegue en Netlify

1. Conecta este repositorio en Netlify (New site from Git).
2. Build command: (vacío / ninguno).
3. Publish directory: `.`
4. Deploy.

Tras el primer deploy con el formulario ya presente en el HTML, Netlify empieza a registrar envíos automáticamente.

## Notas de marca

- Sin esquinas redondeadas en ningún elemento (`border-radius: 0`), según guía de marca.
- Tipografías: Bodoni Moda (titulares, estilo editorial/cinematográfico) + Inter (texto e interfaz).
- Paleta: fondo `#080c0b`, verde azulado `#1b9986`, mostaza `#c8922a`, naranja quemado `#d4622a`.
- Sin emojis en copy ni en iconografía.
