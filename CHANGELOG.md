# Changelog

## 3.1.0 (2026-10-15)

- Two builds are now produced: `dashboard-information-widget-v40.zip` (legacy widget, DHIS2 ≤ 40) and `dashboard-information-widget-v42.zip` (DHIS2 App Platform dashboard plugin built with `@dhis2/app-runtime` + `@dhis2/ui`, in `platform/`).
- Shared code now has a pluggable API transport, host context (widget id / edit mode) and overridable UI primitives, so both builds reuse the same modules.
- The v42 plugin keeps the legacy app key (`Information`) and data store namespace, so existing dashboard items and saved content continue to work after upgrading.
- New scripts: `build:v40`, `build:v42`, `install:platform`; `build` runs both.

## 3.0.0 (2026-10-14)

- Version bumped to 3.0.0 in `manifest.webapp`, `package.json`, `package-lock.json`, and the README.
- Opening the widget directly from the app menu now shows a short, translated (EN/ES/FR/PT) notice explaining how to add it to a dashboard, instead of a network or "unable to find an app" error.
- README: expanded `Refused to connect` troubleshooting (X-Frame-Options, CSP `frame-ancestors`, CORS whitelist), bundled the example screenshot locally, and updated author/maintainer credits.
- Repository links in the docs and manifest now point to `IM-Data-PAHO/dashboard-information-widget`.
- LICENSE: added a separate 2026 PAHO/CIM copyright notice, keeping the original BAO Systems notice.
- Translated the previous changelog entries to English; `/scripts/*` is now git-ignored.

## 2.1.1.3 (2026-05-29)

- Interface internationalization (EN/ES/FR) for widget buttons, messages, and errors.
- Language-specific content support in DataStore using `bodyByLocale` and locale fallback.
- Language selector in the editor to create/update content in multiple languages.
- Active locale resolution with priority: URL override, DHIS2 user preference, and default locale.
- Translation configuration in `dashboard-information/configuration` with keys for supported locales and default locale.
- Backward compatibility with legacy content stored only in `body`.

## 2.1.1.2 (2026-05-28)

- Support for iframe domains configurable via DataStore (`allowedIframeDomains`).
- Friendly error message when attempting to display an iframe from a non-allowed domain.
- Compatibility with DHIS2 v42+ and modern URLs.
- Bug fixes for sanitization and improved robustness in images and video.
- Author changed to PAHO/CIM.
