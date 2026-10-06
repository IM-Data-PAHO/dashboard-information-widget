
# DHIS2 Rich Text and Video Dashboard Widget

**Author:** PAHO/CIM

**Version:** 2.1.1.3


## Overview

The DHIS2 Rich Text and Video Dashboard Widget is a WYSIWYG editor for creating rich content in DHIS2 dashboards. Internally, the widget is called `Information`.


### What's New in 2.1.1.3

- Support for configurable iframe domains through the DataStore (`allowedIframeDomains`).
- User-friendly error message when an iframe from a non-allowed domain is displayed.
- Compatibility with DHIS2 v42+ and modern URLs.
- Sanitization bug fixes and improved handling of images and videos.
- Author updated to PAHO/CIM.

<img width="900" alt="DHIS2 DHIS2 Rich Text and Video Dashboard Widget example" src="https://user-images.githubusercontent.com/852673/107974482-a801f980-6f84-11eb-8e04-1b9189c70073.png">

## Installation on DHIS2

1. Install the app via the [App Hub](https://apps.dhis2.org/) or by uploading the zip from `npm run build` into the DHIS2 App Management app.
2. Be sure to grant access to the app to all users, or they will not see the content. To do this, go to DHIS2 Users > User role > [role] > Apps > select `Information app`. Make sure to do this on enough roles to give all users access. (For example, if all users on your system have a Guest or Read Only role, giving the permission to that role is sufficient.)
3. From the Dashboards page of your DHIS2 installation, edit a dashboard. (If you do not have any dashboards, you will need to add a new dashboard.)
4. Click `Search for items to add to this dashboard`, and select `Information` under `Apps`.
5. Click the Edit button on the Information widget to create content.
6. If you would like to restrict the creation and editing of Information content to superusers, go to the Datastore Manager, select the `dashboard-information` namespace, then the `configuration` key, and check the `Only open to superusers` box. (This namespace and key will only be present after you have created an Information widget.)
7. If the widget shows the message `Refused to connect` after you add it to the dashboard, [follow these instructions to fix](https://github.com/pepfar-datim/dashboard-information-widget/blob/main/docs/RefusedToConnect.md).

## Local Build and Development

1. Install all dependencies: `npm i`.
2. Set up your server URLs in `serverConfig.dev.json` and `serverConfig.prod.json`.
3. Edit `manifest.webapp` to specify the app name for your DHIS2 instance.
4. Run locally with `npm start`.
5. Build for production locally with `npm run build`.

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

## Multilanguage translations in DHIS2

This widget now supports two translation layers:

1. Interface translations (buttons, messages, alerts)
2. Dashboard content translations (rich text/video body per language)

### How locale is resolved

The widget resolves active locale in this order:

1. URL override (`?lang=es` or `?locale=fr`) when `Allow locale override` is enabled
2. DHIS2 user locale (`/me` profile settings)
3. Widget default locale from DataStore configuration
4. `en`

### DataStore configuration keys

In namespace `dashboard-information`, key `configuration`, the app reads:

- `Only open to superusers` (existing behavior)
- `Default locale` (example: `en`)
- `Supported locales` (example: `['en', 'es', 'fr', 'pt']`)
- `Allow locale override` (boolean)

If these keys do not exist, the app initializes defaults automatically.

### Localized content model

Each widget item now supports:

```json
{
	"body": "<p>Latest saved content</p>",
	"defaultLocale": "en",
	"bodyByLocale": {
		"en": "<p>English content</p>",
		"es": "<p>Contenido en espanol</p>",
		"fr": "<p>Contenu en francais</p>",
		"pt": "<p>Conteudo em portugues</p>"
	}
}
```

Backwards compatibility is preserved:

- If `bodyByLocale` is missing, the widget still renders legacy `body`.
- Saving from the editor writes locale-aware structure automatically.

### Editing content in multiple languages

1. Open widget edit mode.
2. Use the Language selector above the editor.
3. Update content for the selected locale.
4. Save.

The render view will show the best available fallback if current locale content is not present.

### Extending UI translations

UI strings are managed in:

- `src/modules/shared/services/i18n.service.ts`

To add a language (example `pt`):

1. Add `pt` under each translation key in `dictionary`.
2. Add `pt` to `Supported locales` in DataStore configuration.
3. Optionally set `Default locale` to `pt`.

### Testing locale behavior quickly

- Add `?lang=es` or `?lang=fr` to widget URL.
- Or disable override and test with users that have different DHIS2 locale preferences.

## Issues, Features, etc.

Please create [an issue](https://github.com/pepfar-datim/dashboard-information-widget/issues) or [a pull request](https://github.com/pepfar-datim/dashboard-information-widget/pulls).

## Original Credits

Originally developed by [@jakub-bao](https://github.com/jakub-bao) and [@plinnegan](https://github.com/plinnegan).
Updated and maintained by PAHO/CIM.
