import React, { useMemo } from 'react';
import { useDataEngine } from '@dhis2/app-runtime';
import { setApiTransport } from './shared/modules/shared/services/api.service';
import { setHostContext } from './shared/modules/shared/services/hostContext.service';
import { createEngineTransport } from './engineTransport';
import PluginRoot from './PluginRoot';
import './shared/index.css';

type PluginProps = {
    dashboardItemId?: string;
    dashboardMode?: 'view' | 'edit' | 'print';
};

// Entry point rendered by the DHIS2 Dashboard app for each "Information" item.
export default function Plugin({ dashboardItemId, dashboardMode }: PluginProps) {
    const engine = useDataEngine();

    useMemo(() => setApiTransport(createEngineTransport(engine)), [engine]);
    setHostContext({ widgetId: dashboardItemId ?? null, editMode: dashboardMode === 'edit' });

    return <PluginRoot key={dashboardItemId} />;
}
