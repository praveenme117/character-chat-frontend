import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  console.log('🔍 LocaleLayout: Locale resolved:', locale);

  try {
    console.log('🔍 LocaleLayout: About to call getMessages()...');
    const messages = await getMessages();
    console.log('🔍 LocaleLayout: getMessages() succeeded, messages keys:', Object.keys(messages));

    return (
      <html lang={locale}>
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('🔍 LocaleLayout: Failed to load messages:', error);
    return (
      <html lang={locale}>
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <div>Error loading translations. Please try again.</div>
          {children}
        </body>
      </html>
    );
  }
}
