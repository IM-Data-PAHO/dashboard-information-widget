import React from 'react';
import StandaloneNotice from './shared/modules/main/components/standaloneNotice.component';
import { setCurrentLocale } from './shared/modules/shared/services/i18n.service';

// Shown when the app is opened from the DHIS2 app menu instead of a dashboard.
export default function App() {
    setCurrentLocale(navigator.language);
    return <StandaloneNotice />;
}
