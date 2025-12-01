import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  
  // Ensure we have a valid locale
  if (!locale || !['en', 'es'].includes(locale)) {
    locale = 'es';
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});
