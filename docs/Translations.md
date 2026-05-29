# Translations Guide

This document explains how to configure and use multilingual behavior in the Dashboard Information widget.

## Scope

The widget supports:

1. Localized UI labels and messages (EN/ES/FR by default)
2. Localized dashboard content stored by locale in DataStore

## Configuration in DataStore

Namespace: `dashboard-information`
Key: `configuration`

Expected keys:

- `Only open to superusers`: `boolean`
- `Default locale`: `string` (for example: `en`)
- `Supported locales`: `string[]` (for example: `['en', 'es', 'fr']`)
- `Allow locale override`: `boolean`

If any key is missing, the app backfills defaults during setup.

## Locale resolution order

The active locale is selected in this order:

1. Query override (`?lang=<locale>` or `?locale=<locale>`) when override is enabled
2. DHIS2 user locale from `/me`
3. `Default locale` from configuration
4. `en`

## Content storage format

For each widget key in DataStore, localized content uses this shape:

```json
{
  "body": "<p>Latest saved content</p>",
  "defaultLocale": "en",
  "bodyByLocale": {
    "en": "<p>English content</p>",
    "es": "<p>Contenido en espanol</p>",
    "fr": "<p>Contenu en francais</p>"
  }
}
```

Notes:

- `body` is kept for compatibility with older versions.
- Rendering tries exact locale, language fallback, default locale, then first available locale.

## Author workflow

1. Open widget in edit mode.
2. Choose target language in the Language selector.
3. Write or update content.
4. Save.
5. Repeat for other languages.

## UI translation dictionary

File:

- `src/modules/shared/services/i18n.service.ts`

To add a new language (for example `pt`):

1. Add `pt` translations for each key in `dictionary`.
2. Add `pt` to `Supported locales` in DataStore config.
3. Optionally change `Default locale`.

## Troubleshooting

- UI is not translated:
  - Confirm `i18n.service.ts` contains strings for the active locale.
  - Confirm active locale is in `Supported locales`.
- Content appears in the wrong language:
  - Verify that locale has content in `bodyByLocale`.
  - Check fallback message shown in render mode.
- URL locale override does not work:
  - Confirm `Allow locale override` is `true`.
  - Use `?lang=es` or `?locale=fr` in URL.
