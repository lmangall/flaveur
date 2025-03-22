import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async ({ locale }) => {
  // Ensure locale is always a string
  const validLocale = locale || "fr"; // Default to 'en' if undefined

  return {
    locale: validLocale,
    messages: (await import(`../locales/${validLocale}/common.json`)).default,
  };
});
