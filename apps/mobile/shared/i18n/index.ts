import { I18n } from 'i18n-js';
import tr from './tr.json';
import en from './en.json';

const i18n = new I18n({
  tr,
  en,
});

i18n.defaultLocale = 'tr';
i18n.enableFallback = true;

export default i18n;
