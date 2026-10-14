import React from 'react';
import { render } from 'react-dom';
import ThemeWrapper from './modules/main/components/themeWrapper.component';
import { baseUrl } from './modules/shared/services/apiUrl.service';
import { init, config } from 'd2';
import './index.css';
import NetworkError from './modules/main/components/networkError.component';
import StandaloneNotice from './modules/main/components/standaloneNotice.component';
import { initI18nLocale, setCurrentLocale } from './modules/shared/services/i18n.service';

function Dhis2Wrapper(props: any) {
    if (!props.d2) return null;
    return (
        <React.Fragment>
            <ThemeWrapper />
        </React.Fragment>
    );
}

function isEmbedded() {
    try {
        return window.self !== window.top;
    } catch (e) {
        return true;
    }
}

config.baseUrl = baseUrl;

config.i18n.sources.add('i18n.txt');

if (process.env.NODE_ENV === 'production' && !isEmbedded()) {
    setCurrentLocale(navigator.language);
    render(<StandaloneNotice />, document.getElementById('root'));
} else {
    init()
        .then(async (d2) => {
            await initI18nLocale();
            render(<Dhis2Wrapper appName={'Dashboard Information'} d2={d2} />, document.getElementById('root'));
        })
        .catch((e) => {
            render(<NetworkError />, document.getElementById('root'));
        });
}
