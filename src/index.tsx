import React from 'react';
import { render } from 'react-dom';
import ThemeWrapper from './modules/main/components/themeWrapper.component';
import { baseUrl } from './modules/shared/services/apiUrl.service';
import { init, config } from 'd2';
import './index.css';
import NetworkError from './modules/main/components/networkError.component';
import { initI18nLocale } from './modules/shared/services/i18n.service';

function Dhis2Wrapper(props: any) {
    if (!props.d2) return null;
    return (
        <React.Fragment>
            <ThemeWrapper />
        </React.Fragment>
    );
}

config.baseUrl = baseUrl;

config.i18n.sources.add('i18n.txt');

init()
    .then(async (d2) => {
        await initI18nLocale();
        render(
            <Dhis2Wrapper appName={'Dashboard Information'} d2={d2} />,
            document.getElementById('root')
        );
    })
    .catch((e) => {
        render(<NetworkError />, document.getElementById('root'));
    });
