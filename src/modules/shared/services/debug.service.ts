type IframeDebugInfo = {
    iframeCount: number;
    iframeWithoutSrcCount: number;
    iframeSrcs: string[];
    hasJoditIframeWrapper: boolean;
};

function readParentLocationPart(part: 'search' | 'hash'): string {
    try {
        return window.parent?.location?.[part] || '';
    } catch (_e) {
        return '';
    }
}

export function isWidgetDebugEnabled(): boolean {
    try {
        const localDebug = window.localStorage.getItem('dashboard-information-debug');
        if (localDebug === '1' || localDebug === 'true') {
            return true;
        }
    } catch (_e) {
        // Ignore localStorage errors.
    }

    const search = `${window.location.search || ''}${readParentLocationPart('search')}`.toLowerCase();
    const hash = `${window.location.hash || ''}${readParentLocationPart('hash')}`.toLowerCase();

    return (
        search.includes('widgetdebug=1') ||
        search.includes('widgetdebug=true') ||
        hash.includes('widgetdebug=1') ||
        hash.includes('widgetdebug=true')
    );
}

export function getIframeDebugInfo(content: string | null | undefined): IframeDebugInfo {
    const html = content || '';
    const iframeTags = html.match(/<iframe\b[^>]*>/gi) || [];
    const iframeWithoutSrc = iframeTags.filter((tag) => !/\ssrc\s*=\s*['"][^'"]+['"]/i.test(tag));
    const iframeSrcs = iframeTags
        .map((tag) => {
            const srcMatch = tag.match(/\ssrc\s*=\s*['"]([^'"]+)['"]/i);
            return srcMatch ? srcMatch[1] : '';
        })
        .filter(Boolean);

    return {
        iframeCount: iframeTags.length,
        iframeWithoutSrcCount: iframeWithoutSrc.length,
        iframeSrcs,
        hasJoditIframeWrapper: /data-jodit_iframe_wrapper/i.test(html),
    };
}

export function debugLog(scope: string, payload: Record<string, unknown>) {
    if (!isWidgetDebugEnabled()) return;

    const stamp = new Date().toISOString();
    const entry = {
        stamp,
        scope,
        ...payload,
    };

    const w = window as any;
    w.__diwDebugEvents = w.__diwDebugEvents || [];
    w.__diwDebugEvents.push(entry);

    if (!w.__diwDebugHelpersInstalled) {
        w.__diwDebugHelpersInstalled = true;
        w.__diwDebugDump = () => {
            const events = w.__diwDebugEvents || [];
            const rows = events.map((ev: any, index: number) => ({
                index,
                stamp: ev.stamp,
                scope: ev.scope,
                contentLength: ev.contentLength,
                iframeCount: ev.iframeInfo?.iframeCount,
                iframeWithoutSrcCount: ev.iframeInfo?.iframeWithoutSrcCount,
                hasJoditIframeWrapper: ev.iframeInfo?.hasJoditIframeWrapper,
                iframeError: ev.iframeError || null,
            }));
            console.table(rows);
            return events;
        };
        w.__diwDebugLast = () => {
            const events = w.__diwDebugEvents || [];
            return events.length ? events[events.length - 1] : null;
        };
    }

    const iframeInfo = (payload as any).iframeInfo;
    const summaryParts = [
        `len=${(payload as any).contentLength ?? 'n/a'}`,
        iframeInfo
            ? `iframes=${iframeInfo.iframeCount},missingSrc=${iframeInfo.iframeWithoutSrcCount},wrapper=${iframeInfo.hasJoditIframeWrapper}`
            : 'iframes=n/a',
    ];

    // Always print one visible summary line plus one detailed object.
    console.info(`[DIW DEBUG] ${scope} @ ${stamp} | ${summaryParts.join(' | ')}`);
    console.log('[DIW DEBUG DETAIL]', entry);
}
