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

  try {
    const messages = await getMessages();

    return (
      <html lang={locale || 'en'}>
        <head>
          <link rel="icon" href="/favicon.ico" />
        </head>
        <body>
          <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
        </body>
      </html>
    );
  } catch (error) {
    console.error('Failed to load messages:', error);
    return (
      <html lang={locale || 'en'}>
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
