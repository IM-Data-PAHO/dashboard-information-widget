import React from 'react';
import { fetchContentDetails, saveContent } from '../shared/services/content.service';
import { Button } from '@material-ui/core';
import { Link, withRouter } from 'react-router-dom';
import Editor from './editor.component';
import contentHook from '../shared/services/contentHook.service';
import { debugLog, getIframeDebugInfo } from '../shared/services/debug.service';
import { getCurrentLocale, t } from '../shared/services/i18n.service';
import { getLocaleSettings, normalizeLocale } from '../shared/services/locale.service';

const styles = {
    link: {
        float: 'right',
    },
    clear: {
        clear: 'both',
        height: 20,
    },
    readmeLink: {
        float: 'left',
        fontFamily: 'Roboto',
        fontSize: '0.9rem',
        paddingLeft: '5px',
    },
};

class Edit extends React.Component<
    { postMessage: any; history: any },
    {
        originalContent?: string;
        editedContent?: string;
        selectedLocale: string;
        defaultLocale: string;
        availableLocales: string[];
        supportedLocales: string[];
    }
> {
    constructor(props) {
        super(props);
        const initialLocale = normalizeLocale(getCurrentLocale()) || 'en';
        this.state = {
            selectedLocale: initialLocale,
            defaultLocale: 'en',
            availableLocales: [initialLocale],
            supportedLocales: [initialLocale],
        };

        this.loadSettingsAndContent(initialLocale);
    }

    loadSettingsAndContent = async (preferredLocale: string) => {
        const localeSettings = await getLocaleSettings();
        const selectedLocale = normalizeLocale(preferredLocale) || localeSettings.defaultLocale;

        const result = await fetchContentDetails(selectedLocale, localeSettings.defaultLocale);

        const availableLocales = Array.from(
            new Set([
                ...localeSettings.supportedLocales,
                ...result.availableLocales,
            ])
        );

        this.setState({
            selectedLocale,
            defaultLocale: localeSettings.defaultLocale,
            supportedLocales: localeSettings.supportedLocales,
            availableLocales,
            editedContent: result.body,
        });

        debugLog('edit.loadContent', {
            contentLength: (result.body || '').length,
            requestedLocale: result.requestedLocale,
            selectedLocale: result.selectedLocale,
            fallbackUsed: result.fallbackUsed,
            availableLocales: result.availableLocales,
            iframeInfo: getIframeDebugInfo(result.body),
        });
    };

    loadContentForLocale = async (locale: string) => {
        const selectedLocale = normalizeLocale(locale) || this.state.defaultLocale;
        const result = await fetchContentDetails(selectedLocale, this.state.defaultLocale);

        this.setState((prevState) => ({
            selectedLocale,
            editedContent: result.body,
            availableLocales: Array.from(
                new Set([...prevState.availableLocales, ...result.availableLocales, selectedLocale])
            ),
        }));

        debugLog('edit.loadContentForLocale', {
            contentLength: (result.body || '').length,
            requestedLocale: result.requestedLocale,
            selectedLocale: result.selectedLocale,
            fallbackUsed: result.fallbackUsed,
            availableLocales: result.availableLocales,
            iframeInfo: getIframeDebugInfo(result.body),
        });
    };

    onChange = (newContent) => {
        debugLog('edit.onChange', {
            contentLength: (newContent || '').length,
            locale: this.state.selectedLocale,
            iframeInfo: getIframeDebugInfo(newContent),
        });
        this.setState({ editedContent: newContent });
    };

    saveChanges = () => {
        const hookedContent = contentHook(this.state.editedContent);
        debugLog('edit.beforeSave', {
            contentLength: (hookedContent || '').length,
            locale: this.state.selectedLocale,
            iframeInfo: getIframeDebugInfo(hookedContent),
        });

        saveContent(hookedContent, this.state.selectedLocale, this.state.defaultLocale)
            .then((resp) => {
                this.props.postMessage(t('content_saved', 'Content saved'));
                this.props.history.push('/');
            })
            .catch((e) => {
                this.props.postMessage(t('cannot_save', 'Error: Cannot save'));
            });
    };

    onLocaleChange = (event) => {
        this.loadContentForLocale(event.target.value);
    };

    render() {
        const localeOptions = Array.from(
            new Set([...this.state.supportedLocales, ...this.state.availableLocales])
        ).sort();

        return (
            <React.Fragment>
                <p style={styles.readmeLink as any}>
                    <i>
                        <a
                            href="https://github.com/pepfar-datim/dashboard-information-widget/blob/main/README.md"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {t('documentation_link_text', 'Documentation for the Dashboard Information widget can be found here.')}
                        </a>
                    </i>
                </p>
                <Link to={`/`} style={styles.link}>
                    <Button>{t('cancel', 'Cancel')}</Button>
                </Link>
                <Button onClick={this.saveChanges} variant="contained" color="secondary" style={styles.link as any}>
                    {t('save', 'Save')}
                </Button>
                <div style={styles.clear as any} />
                <p>
                    <label htmlFor="widget-locale-selector">{t('language_label', 'Language')}: </label>
                    <select
                        id="widget-locale-selector"
                        value={this.state.selectedLocale}
                        onChange={this.onLocaleChange}
                    >
                        {localeOptions.map((locale) => (
                            <option key={locale} value={locale}>
                                {locale}
                            </option>
                        ))}
                    </select>
                </p>
                <Editor content={this.state.editedContent} onChange={this.onChange} />
            </React.Fragment>
        );
    }
}

export default withRouter(Edit);
