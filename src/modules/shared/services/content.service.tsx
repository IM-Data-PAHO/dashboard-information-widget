import api, { formatParams } from '../../shared/services/api.service';
import sanitize from '../../shared/services/sanitizeCompat.service';
import getContentUrl, { getWidgetId } from './contentUrl.service';
import { debugLog, getIframeDebugInfo } from './debug.service';
import { getLanguagePart, normalizeLocale } from './locale.service';

const config = require('../../../config/config.json');

type LocalizedDataStoreBody = {
    body?: string;
    bodyByLocale?: Record<string, string>;
    defaultLocale?: string;
};

export type LocalizedContentResult = {
    body: string;
    selectedLocale: string | null;
    requestedLocale: string | null;
    fallbackUsed: boolean;
    availableLocales: string[];
    defaultLocale: string;
};

function normalizeLocaleRecord(record: Record<string, string> | undefined): Record<string, string> {
    if (!record || typeof record !== 'object') return {};

    const result: Record<string, string> = {};
    Object.keys(record).forEach((key) => {
        const normalized = normalizeLocale(key);
        if (!normalized) return;
        result[normalized] = record[key] || '';
    });

    return result;
}

function resolveLocalizedBody(payload: LocalizedDataStoreBody, locale: string | null, defaultLocale: string): LocalizedContentResult {
    const bodyByLocale = normalizeLocaleRecord(payload?.bodyByLocale);
    const availableLocales = Object.keys(bodyByLocale);
    const normalizedRequested = normalizeLocale(locale);
    const requestedLanguage = getLanguagePart(normalizedRequested);
    const normalizedDefault = normalizeLocale(payload?.defaultLocale) || normalizeLocale(defaultLocale) || 'en';

    const candidates = [
        normalizedRequested,
        requestedLanguage,
        normalizedDefault,
        getLanguagePart(normalizedDefault),
        availableLocales[0] || null,
    ];

    let selectedLocale: string | null = null;
    let body = '';
    for (const candidate of candidates) {
        if (!candidate) continue;
        if (bodyByLocale[candidate] !== undefined) {
            selectedLocale = candidate;
            body = bodyByLocale[candidate] || '';
            break;
        }
    }

    if (!selectedLocale) {
        body = payload?.body || '';
    }

    return {
        body,
        selectedLocale,
        requestedLocale: normalizedRequested,
        fallbackUsed: Boolean(normalizedRequested && selectedLocale && selectedLocale !== normalizedRequested),
        availableLocales,
        defaultLocale: normalizedDefault,
    };
}

export function fetchContent(locale?: string, defaultLocale = 'en') {
    return fetchContentDetails(locale, defaultLocale).then((result) => result.body);
}

export function fetchContentDetails(locale?: string, defaultLocale = 'en') {
    return api
        .get(getContentUrl())
        .then((resp: LocalizedDataStoreBody) => {
            const resolved = resolveLocalizedBody(resp || {}, locale || null, defaultLocale);
            debugLog('fetchContent.rawFromDataStore', {
                contentLength: resolved.body.length,
                requestedLocale: resolved.requestedLocale,
                selectedLocale: resolved.selectedLocale,
                availableLocales: resolved.availableLocales,
                fallbackUsed: resolved.fallbackUsed,
                iframeInfo: getIframeDebugInfo(resolved.body),
            });
            return resolved;
        })
        .then((resolved) =>
            sanitize(resolved.body).then((sanitizedBody) => {
                debugLog('fetchContent.afterSanitizeCompat', {
                    contentLength: (sanitizedBody || '').length,
                    requestedLocale: resolved.requestedLocale,
                    selectedLocale: resolved.selectedLocale,
                    fallbackUsed: resolved.fallbackUsed,
                    iframeInfo: getIframeDebugInfo(sanitizedBody),
                });
                return {
                    ...resolved,
                    body: sanitizedBody,
                };
            })
        );
}


export async function getKeyUid(namespaceKey) {
    const { datastoreNamespace } = config;
    const namespaceKeyMeta = await api.get(`/dataStore/${datastoreNamespace}/${namespaceKey}/metaData`);
    return namespaceKeyMeta.id;
}

export async function shareKey(keyUid, publicAccess) {
    const params = { type: 'dataStore', id: keyUid };
    const currentSharingReq = await api.get(`/sharing?${formatParams(params)}`);
    const currPublicAccess = currentSharingReq.object.publicAccess;
    if (currPublicAccess !== publicAccess) {
        return api.post(`/sharing?${formatParams(params)}`, {
            object: {
                id: keyUid,
                publicAccess: publicAccess,
            },
        });
    }
}

export async function saveContent(content, locale = 'en', defaultLocale = 'en') {
    const normalizedLocale = normalizeLocale(locale) || 'en';
    const normalizedDefault = normalizeLocale(defaultLocale) || 'en';

    let existingPayload: LocalizedDataStoreBody = {};
    try {
        existingPayload = await api.get(getContentUrl());
    } catch (e) {
        existingPayload = {};
    }

    const bodyByLocale = normalizeLocaleRecord(existingPayload.bodyByLocale);
    bodyByLocale[normalizedLocale] = content || '';

    const payload: LocalizedDataStoreBody = {
        ...existingPayload,
        body: content || '',
        bodyByLocale,
        defaultLocale: normalizeLocale(existingPayload.defaultLocale) || normalizedDefault,
    };

    debugLog('saveContent.beforeRequest', {
        contentLength: (content || '').length,
        locale: normalizedLocale,
        availableLocales: Object.keys(bodyByLocale),
        iframeInfo: getIframeDebugInfo(content),
    });

    return api.put(getContentUrl(), payload).catch(async (resp) => {
        await api.post(getContentUrl(), payload);
        let widgetId = getWidgetId();
        let widgetUid = await getKeyUid(widgetId);
        debugLog('saveContent.sharedFallback', {
            widgetId,
            widgetUid,
        });
        return shareKey(widgetUid, 'r-------');
    });
}
