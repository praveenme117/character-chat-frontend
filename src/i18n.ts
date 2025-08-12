import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const validLocale = locale || 'en';

  try {
    return {
      locale: validLocale,
      messages: (await import(`./app/messages/${validLocale}.json`)).default,
    };
  } catch (error) {
    console.error(`Failed to load messages for locale "${validLocale}":`, error);
    return {
      locale: 'en',
      messages: (await import(`./app/messages/en.json`)).default,
    };
  }
});
