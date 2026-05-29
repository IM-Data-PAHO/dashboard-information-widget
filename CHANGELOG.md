# Changelog

## 2.1.1.3 (2026-05-29)

- Internacionalizacion de interfaz (EN/ES/FR) para botones, mensajes y errores del widget.
- Soporte de contenido por idioma en DataStore con `bodyByLocale` y fallback por locale.
- Selector de idioma en el editor para crear/actualizar contenido en multiples idiomas.
- Resolucion de locale activa con prioridad: override por URL, preferencia de usuario DHIS2 y locale por defecto.
- Configuracion de traducciones en `dashboard-information/configuration` con claves para locales soportados y locale por defecto.
- Compatibilidad retroactiva con contenido legacy almacenado solo en `body`.

## 2.1.1.2 (2026-05-28)

- Soporte para dominios de iframe configurables desde DataStore (`allowedIframeDomains`).
- Mensaje de error amigable si se intenta mostrar un iframe de un dominio no permitido.
- Compatibilidad con DHIS2 v42+ y URLs modernas.
- Corrección de bugs de sanitización y robustez en imágenes y video.
- Cambio de autor a PAHO/CIM.
