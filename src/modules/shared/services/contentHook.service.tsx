import { debugLog, getIframeDebugInfo } from './debug.service';

export default function contentHook(content) {
    if (!content) return content;

    debugLog('contentHook.input', {
        contentLength: content.length,
        iframeInfo: getIframeDebugInfo(content),
    });

    let cleaned = content;

    // Unwrap temporary Jodit wrappers around iframes.
    cleaned = cleaned.replace(
        /<jodit[^>]*data-jodit_iframe_wrapper[^>]*>([\s\S]*?<iframe[\s\S]*?<\/iframe>[\s\S]*?)<\/jodit>/gi,
        '$1'
    );

    // Drop broken iframe placeholders that have no src.
    cleaned = cleaned.replace(/<iframe(?![^>]*\ssrc=)[^>]*>[\s\S]*?<\/iframe>/gi, '');

    const normalized = cleaned.replace(/<a /g, '<a target="_blank" ');

    debugLog('contentHook.output', {
        contentLength: normalized.length,
        iframeInfo: getIframeDebugInfo(normalized),
    });

    return normalized;
}
