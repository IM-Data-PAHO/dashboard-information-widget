// Values supplied by the host (e.g. the DHIS2 dashboard plugin props).
// When unset, the legacy widget falls back to reading the parent window URL.
type HostContext = {
    widgetId?: string | null;
    editMode?: boolean;
};

let hostContext: HostContext = {};

export function setHostContext(next: HostContext) {
    hostContext = { ...hostContext, ...next };
}

export function getHostContext(): HostContext {
    return hostContext;
}
