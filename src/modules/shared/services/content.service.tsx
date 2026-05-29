import api, { formatParams } from '../../shared/services/api.service';
import sanitize from '../../shared/services/sanitizeCompat.service';
import getContentUrl, { getWidgetId } from './contentUrl.service';
import { debugLog, getIframeDebugInfo } from './debug.service';

const config = require('../../../config/config.json');

export function fetchContent() {
    return api
        .get(getContentUrl())
        .then((resp) => {
            const body = resp?.body || '';
            debugLog('fetchContent.rawFromDataStore', {
                contentLength: body.length,
                iframeInfo: getIframeDebugInfo(body),
            });
            return body;
        })
        .then((rawBody) =>
            sanitize(rawBody).then((sanitizedBody) => {
                debugLog('fetchContent.afterSanitizeCompat', {
                    contentLength: (sanitizedBody || '').length,
                    iframeInfo: getIframeDebugInfo(sanitizedBody),
                });
                return sanitizedBody;
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

export function saveContent(content) {
    debugLog('saveContent.beforeRequest', {
        contentLength: (content || '').length,
        iframeInfo: getIframeDebugInfo(content),
    });
    return api.put(getContentUrl(), { body: content }).catch(async (resp) => {
        await api.post(getContentUrl(), { body: content });
        let widgetId = getWidgetId();
        let widgetUid = await getKeyUid(widgetId);
        debugLog('saveContent.sharedFallback', {
            widgetId,
            widgetUid,
        });
        return shareKey(widgetUid, 'r-------');
    });
}
