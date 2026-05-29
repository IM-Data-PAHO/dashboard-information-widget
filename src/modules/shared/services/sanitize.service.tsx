import sanitizeHtml from 'sanitize-html';
import { getAllowedIframeDomains } from './iframeDomains.service';
import { debugLog, getIframeDebugInfo } from './debug.service';

function expandAllowedIframeHostnames(hostnames: string[]): string[] {
    const expanded = new Set<string>();

    hostnames.forEach((hostname) => {
        const h = (hostname || '').trim().toLowerCase();
        if (!h) return;

        expanded.add(h);
        if (h.startsWith('www.')) {
            expanded.add(h.replace(/^www\./, ''));
        } else {
            expanded.add(`www.${h}`);
        }
    });

    return Array.from(expanded);
}

// settings base, pero allowedIframeHostnames se inyecta dinámicamente
const baseSettings = {
    allowedTags: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'blockquote',
        'p',
        'a',
        'ul',
        'ol',
        'img',
        'nl',
        'li',
        'b',
        'i',
        'strong',
        'em',
        'strike',
        'code',
        'hr',
        'br',
        'div',
        'u',
        'table',
        'thead',
        'caption',
        'tbody',
        'tr',
        'th',
        'td',
        'pre',
        'iframe',
        'span',
    ],
    allowedAttributes: {
        a: ['href', 'name', 'target'],
        img: ['src', 'alt', 'style'],
        iframe: ['src', 'height', 'width', 'frameborder', 'allow', 'allowfullscreen', 'title', 'loading', 'referrerpolicy'],
        td: ['colspan', 'rowspan'],
        th: ['colspan', 'rowspan'],
    },
    selfClosing: ['img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta'],
    allowedSchemes: ['http', 'https', 'ftp', 'mailto', 'data'],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: ['href', 'src', 'cite'],
    allowProtocolRelative: true,
    allowedIframeHostnames: [], // se setea dinámicamente
    transformTags: {
        a: (tagName, attribs) => ({
            tagName,
            attribs: {
                ...attribs,
                rel: attribs.rel || 'noopener noreferrer',
            },
        }),
    },
};

// Add style as an allowed attribute on all allowed tags, otherwise styles will be removed on save
for (const allowedTag of baseSettings.allowedTags) {
    if (allowedTag in baseSettings.allowedAttributes) {
        if (!baseSettings.allowedAttributes[allowedTag].includes('style')) {
            baseSettings.allowedAttributes[allowedTag].push('style');
        }
    } else {
        baseSettings.allowedAttributes[allowedTag] = ['style'];
    }
}


// Sanitiza el contenido y retorna { html, iframeError }
export async function sanitize(content: string): Promise<{ html: string, iframeError: string | null }> {
    if (!content) return { html: '', iframeError: null };
    const rawAllowedIframeHostnames = await getAllowedIframeDomains();
    const allowedIframeHostnames = expandAllowedIframeHostnames(rawAllowedIframeHostnames);
    const settings = { ...baseSettings, allowedIframeHostnames };

    debugLog('sanitize.input', {
        contentLength: content.length,
        allowedIframeHostnames,
        iframeInfo: getIframeDebugInfo(content),
    });

    let iframeError: string | null = null;
    // Hook para detectar iframes no permitidos
    (settings as any).exclusiveFilter = (frame) => {
        if (frame.tag === 'iframe' && frame.attribs && frame.attribs.src) {
            try {
                const url = new URL(frame.attribs.src, window.location.origin);
                const hostname = url.hostname.replace(/^www\./, '');
                const allowed = allowedIframeHostnames.some((h) => hostname.endsWith(h.replace(/^www\./, '')));
                if (!allowed) {
                    iframeError = hostname;
                    return true; // elimina el iframe
                }
            } catch (e) {
                iframeError = frame.attribs.src;
                return true;
            }
        }
        return false;
    };
    const html = sanitizeHtml(content, settings);

    debugLog('sanitize.output', {
        contentLength: html.length,
        iframeError,
        iframeInfo: getIframeDebugInfo(html),
    });

    return { html, iframeError };
}
