import { getLanguagePart, normalizeLocale, resolveCurrentLocale } from './locale.service';

type TranslationDictionary = {
    [key: string]: {
        [locale: string]: string;
    };
};

const dictionary: TranslationDictionary = {
    edit: {
        en: 'Edit',
        es: 'Editar',
        fr: 'Modifier',
    },
    save: {
        en: 'Save',
        es: 'Guardar',
        fr: 'Enregistrer',
    },
    cancel: {
        en: 'Cancel',
        es: 'Cancelar',
        fr: 'Annuler',
    },
    content_saved: {
        en: 'Content saved',
        es: 'Contenido guardado',
        fr: 'Contenu enregistre',
    },
    cannot_save: {
        en: 'Error: Cannot save',
        es: 'Error: No se puede guardar',
        fr: 'Erreur: impossible d\'enregistrer',
    },
    documentation_link_text: {
        en: 'Documentation for the Dashboard Information widget can be found here.',
        es: 'La documentacion del widget Dashboard Information se encuentra aqui.',
        fr: 'La documentation du widget Dashboard Information est disponible ici.',
    },
    no_content_placeholder: {
        en: 'New Dashboard Information widget',
        es: 'Nuevo widget Dashboard Information',
        fr: 'Nouveau widget Dashboard Information',
    },
    iframe_domain_blocked_title: {
        en: 'The content tried to display a video or resource from a non-allowed domain:',
        es: 'El contenido intento mostrar un video o recurso de un dominio no permitido:',
        fr: 'Le contenu a tente d\'afficher une video ou une ressource provenant d\'un domaine non autorise :',
    },
    iframe_domain_blocked_help: {
        en: 'Ask an administrator to add it to the allowed domains list.',
        es: 'Pide a un administrador que lo agregue a la lista de dominios permitidos.',
        fr: 'Demandez a un administrateur de l\'ajouter a la liste des domaines autorises.',
    },
    network_error_title: {
        en: 'Network Error',
        es: 'Error de red',
        fr: 'Erreur reseau',
    },
    network_error_body: {
        en: 'Please check your internet connection',
        es: 'Por favor revisa tu conexion a internet',
        fr: 'Veuillez verifier votre connexion internet',
    },
    version_error_title: {
        en: 'Version Error',
        es: 'Error de version',
        fr: 'Erreur de version',
    },
    version_error_body: {
        en: 'This dashboard widget can only be run on dhis2 versions 2.31 and up',
        es: 'Este widget de dashboard solo funciona en versiones de dhis2 2.31 o superiores',
        fr: 'Ce widget de tableau de bord fonctionne uniquement sur dhis2 2.31 et versions superieures',
    },
    version_error_current: {
        en: 'Current version:',
        es: 'Version actual:',
        fr: 'Version actuelle :',
    },
    close: {
        en: 'Close',
        es: 'Cerrar',
        fr: 'Fermer',
    },
    language_label: {
        en: 'Language',
        es: 'Idioma',
        fr: 'Langue',
    },
    fallback_notice: {
        en: 'Showing fallback content in {locale}.',
        es: 'Mostrando contenido de respaldo en {locale}.',
        fr: 'Affichage du contenu de secours en {locale}.',
    },
};

let currentLocale = 'en';

function interpolate(template: string, params?: Record<string, string | number>): string {
    if (!params) return template;
    return Object.keys(params).reduce((acc, key) => {
        const value = String(params[key]);
        return acc.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    }, template);
}

export async function initI18nLocale() {
    currentLocale = normalizeLocale(await resolveCurrentLocale()) || 'en';
    return currentLocale;
}

export function setCurrentLocale(locale: string) {
    currentLocale = normalizeLocale(locale) || 'en';
}

export function getCurrentLocale() {
    return currentLocale;
}

export function t(key: string, fallback?: string, params?: Record<string, string | number>) {
    const entry = dictionary[key] || {};
    const locale = normalizeLocale(currentLocale) || 'en';
    const languagePart = getLanguagePart(locale);

    const value =
        entry[locale] ||
        (languagePart ? entry[languagePart] : null) ||
        entry.en ||
        fallback ||
        key;

    return interpolate(value, params);
}
