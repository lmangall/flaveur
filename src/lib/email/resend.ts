import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://oumamie.xyz';

export async function sendConfirmationEmail(email: string, token: string, locale: string) {
  const confirmUrl = `${BASE_URL}/${locale}/newsletter/confirm?token=${token}`;

  const subject = locale === 'fr'
    ? 'Confirmez votre inscription à la newsletter Oumamie'
    : 'Confirm your Oumamie newsletter subscription';

  const html = locale === 'fr'
    ? getConfirmationEmailFr(confirmUrl)
    : getConfirmationEmailEn(confirmUrl);

  await resend.emails.send({
    from: 'Oumamie <newsletter@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

export async function sendWelcomeEmail(email: string, locale: string) {
  const subject = locale === 'fr'
    ? 'Bienvenue dans la newsletter Oumamie!'
    : 'Welcome to the Oumamie newsletter!';

  const html = locale === 'fr'
    ? getWelcomeEmailFr()
    : getWelcomeEmailEn();

  await resend.emails.send({
    from: 'Oumamie <newsletter@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

export async function sendUnsubscribeConfirmationEmail(email: string, locale: string) {
  const subject = locale === 'fr'
    ? 'Vous êtes désinscrit de la newsletter Oumamie'
    : 'You have been unsubscribed from Oumamie newsletter';

  const html = locale === 'fr'
    ? getUnsubscribeEmailFr()
    : getUnsubscribeEmailEn();

  await resend.emails.send({
    from: 'Oumamie <newsletter@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

// Email Templates

function getConfirmationEmailFr(confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmez votre inscription</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Confirmez votre inscription</h2>
    <p style="margin-bottom: 20px;">Merci de vous être inscrit à notre newsletter! Pour finaliser votre inscription, cliquez sur le bouton ci-dessous:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Confirmer mon inscription</a>
    </div>

    <p style="color: #666; font-size: 13px;">Si vous n'avez pas demandé cette inscription, vous pouvez ignorer cet email.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
    <p>Si le bouton ne fonctionne pas, copiez ce lien: ${confirmUrl}</p>
  </div>
</body>
</html>
  `;
}

function getConfirmationEmailEn(confirmUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your subscription</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Confirm your subscription</h2>
    <p style="margin-bottom: 20px;">Thank you for subscribing to our newsletter! To complete your subscription, click the button below:</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${confirmUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Confirm Subscription</a>
    </div>

    <p style="color: #666; font-size: 13px;">If you didn't request this subscription, you can safely ignore this email.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
    <p>If the button doesn't work, copy this link: ${confirmUrl}</p>
  </div>
</body>
</html>
  `;
}

function getWelcomeEmailFr(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bienvenue!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Bienvenue dans la communauté Oumamie!</h2>
    <p style="margin-bottom: 15px;">Votre inscription à notre newsletter est maintenant confirmée.</p>
    <p style="margin-bottom: 15px;">Vous recevrez désormais nos dernières actualités, conseils et opportunités dans le monde de la création d'arômes.</p>

    <div style="background: #fff; border-left: 4px solid #111; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 500;">Ce que vous recevrez:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>Nouvelles fonctionnalités de la plateforme</li>
        <li>Offres d'emploi dans l'industrie</li>
        <li>Conseils pour votre portfolio</li>
        <li>Actualités du monde des arômes</li>
      </ul>
    </div>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
  </div>
</body>
</html>
  `;
}

function getWelcomeEmailEn(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome!</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Welcome to the Oumamie community!</h2>
    <p style="margin-bottom: 15px;">Your newsletter subscription is now confirmed.</p>
    <p style="margin-bottom: 15px;">You will now receive our latest news, tips, and opportunities in the world of flavor creation.</p>

    <div style="background: #fff; border-left: 4px solid #111; padding: 15px; margin: 20px 0;">
      <p style="margin: 0; font-weight: 500;">What you'll receive:</p>
      <ul style="margin: 10px 0; padding-left: 20px;">
        <li>New platform features</li>
        <li>Industry job opportunities</li>
        <li>Portfolio tips</li>
        <li>Flavor industry news</li>
      </ul>
    </div>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
  </div>
</body>
</html>
  `;
}

function getUnsubscribeEmailFr(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Désinscription confirmée</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Désinscription confirmée</h2>
    <p style="margin-bottom: 15px;">Vous avez été désinscrit de notre newsletter avec succès.</p>
    <p style="margin-bottom: 15px;">Nous sommes désolés de vous voir partir. Si vous changez d'avis, vous pouvez toujours vous réinscrire sur notre site.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
  </div>
</body>
</html>
  `;
}

function getUnsubscribeEmailEn(): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unsubscribe confirmed</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="color: #111; font-size: 24px; margin-bottom: 10px;">Oumamie</h1>
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Unsubscribe confirmed</h2>
    <p style="margin-bottom: 15px;">You have been successfully unsubscribed from our newsletter.</p>
    <p style="margin-bottom: 15px;">We're sorry to see you go. If you change your mind, you can always resubscribe on our website.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
  </div>
</body>
</html>
  `;
}
