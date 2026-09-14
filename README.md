# Batuecas Real Estate — rediseño

Propuesta de rediseño para batuecas.es: inmobiliaria y gestión de pisos turísticos en Madrid.

Sitio estático (HTML/CSS/JS), sin build step. Animación de scroll en la portada construida con GSAP + ScrollTrigger + Lenis.

## Estructura

- `index.html` — portada, con la secuencia fotográfica de scroll
- `pisos-turisticos.html`, `propiedad.html` — renta corta
- `inmobiliaria.html`, `valor-de-mi-vivienda.html` — compraventa
- `reformas.html` — proyectos de reforma
- `servicios-tarifas.html`, `contacto.html`, `blog.html`, `blog-articulo.html`
- `styles.css`, `script.js` — sistema de diseño y animaciones compartidos
- `assets/` — imágenes

## Desarrollo local

Cualquier servidor estático sirve, por ejemplo:

```
npx serve .
```
