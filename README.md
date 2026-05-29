
# DHIS2 Rich Text and Video Dashboard Widget

**Autor:** PAHO/CIM

**Versión:** 2.1.1.2


## Overview

El widget DHIS2 Rich Text and Video Dashboard Widget es un editor WYSIWYG que permite crear contenido enriquecido en los dashboards de DHIS2. Internamente, el widget se llama `Information`.


### Novedades en 2.1.1.2

- Soporte para dominios de iframe configurables desde DataStore (`allowedIframeDomains`).
- Mensaje de error amigable si se intenta mostrar un iframe de un dominio no permitido.
- Compatibilidad con DHIS2 v42+ y URLs modernas.
- Corrección de bugs de sanitización y robustez en imágenes y video.
- Autor actualizado a PAHO/CIM.

<img width="900" alt="DHIS2 DHIS2 Rich Text and Video Dashboard Widget example" src="https://user-images.githubusercontent.com/852673/107974482-a801f980-6f84-11eb-8e04-1b9189c70073.png">

## Installation on DHIS2

1. Install the app via the [App Hub](https://apps.dhis2.org/) or by uploading the zip from `npm run build` into the DHIS2 App Management app
2. Be sure to grant access to the app to all users, or they will not see the content. To do this, go to DHIS2 Users > User role > [role] > Apps > select `Information app`. Make sure to do this on enough roles to give all users access. (For example, if all users on your system have a Guest or Read Only role, giving the permission to that role is sufficient.)
3. From the Dashboards page of your DHIS2 installation, edit a dashboard. (If you do not have any dashboards, you will need to add a new dashboard.)
4. Click `Search for items to add to this dashboard`, and select `Information` under `Apps`.
5. Click the Edit button on the Information widget to create content.
6. If you would like to restrict the creation and editing of Information content to superusers, go to the Datastore Manager, select the `dashboard-information` namespace, then the `configuration` key and check the `Only open to superusers` box. (This namespace and key will only be present after you have created an  Information widget.)
7. If the widget shows the message `Refused to connect` after you add it to the dashboard, [follow these instructions to fix](https://github.com/pepfar-datim/dashboard-information-widget/blob/main/docs/RefusedToConnect.md).

## Local Build and Development

1. Install all dependencies: `npm i`
2. Setup your servers URLs in `serverConfig.dev.json` and `serverConfig.prod.json`
3. Edit `manifest.webapp` to specify name of the app for your DHIS2 instance
4. Run locally as `npm start`
5. Build for production locally as `npm run build`

### Embedding videos

- In the editor, use the video/embed option and paste an iframe embed URL.
- Recommended YouTube format:
	`https://www.youtube.com/embed/<VIDEO_ID>`
- The sanitizer strips unsafe scripts and keeps only allowed hosts/attributes.

### Debug mode for iframe/video issues

If videos appear while editing but later become placeholders, enable debug mode and inspect the full content pipeline.

- Enable with URL flag: add `widgetDebug=1` in query or hash.
	- Example: `.../api/apps/dashboard-information/index.html#/edit?widgetDebug=1`
- Or enable from browser console:
	- `localStorage.setItem('dashboard-information-debug', '1')`
	- Reload the app.
- Disable from browser console:
	- `localStorage.removeItem('dashboard-information-debug')`

When enabled, console lines prefixed with `[DIW DEBUG]` will show a visible summary for every event:

- Raw content fetched from DataStore
- Content after sanitization
- Content before and after `contentHook` cleanup
- Content before save request
- Final content rendered

Each event includes iframe diagnostics (`iframeCount`, `iframeWithoutSrcCount`, `iframeSrcs`, and Jodit wrapper detection) to identify the exact stage where `src` is lost.

Extra console helpers:

- `window.__diwDebugDump()` prints a table with all events.
- `window.__diwDebugLast()` returns the latest raw debug event object.

## Issues, Features, etc.

Please create [an issue](https://github.com/pepfar-datim/dashboard-information-widget/issues) or [a pull request](https://github.com/pepfar-datim/dashboard-information-widget/pulls).

## Créditos originales

Desarrollado originalmente por [@jakub-bao](https://github.com/jakub-bao) y [@plinnegan](https://github.com/plinnegan).
Actualizado y mantenido por PAHO/CIM.
