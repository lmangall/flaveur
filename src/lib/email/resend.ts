import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY environment variable is not set');
}

export const resend = new Resend(process.env.RESEND_API_KEY);

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://www.oumamie.xyz';
const LOGO_URL = `${BASE_URL}/logo_transparent_bg.png`;

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

const DEV_EMAIL = 'l.mangallon@gmail.com';

export async function sendNewSubscriberNotification(subscriberEmail: string, source: string, locale: string) {
  await resend.emails.send({
    from: 'Oumamie <newsletter@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `New newsletter subscriber: ${subscriberEmail}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>New Newsletter Subscriber</h2>
  <p><strong>Email:</strong> ${subscriberEmail}</p>
  <p><strong>Source:</strong> ${source}</p>
  <p><strong>Locale:</strong> ${locale}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
</body>
</html>
    `,
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
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

// ============================================
// FORMULA SHARING EMAILS
// ============================================

/**
 * Send invitation email to non-users
 */
export async function sendFormulaInviteEmail(
  email: string,
  inviterName: string,
  formulaName: string,
  inviteToken: string,
  locale: string
) {
  const inviteUrl = `${BASE_URL}/${locale}/invite?token=${inviteToken}`;

  const subject = locale === 'en'
    ? `${inviterName} invited you to view a formula on Oumamie`
    : `${inviterName} vous invite à découvrir une formule sur Oumamie`;

  const html = locale === 'en'
    ? getFormulaInviteEmailEn(inviterName, formulaName, inviteUrl)
    : getFormulaInviteEmailFr(inviterName, formulaName, inviteUrl);

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

/**
 * Send notification email to existing users when a formula is shared with them
 */
export async function sendFormulaShareNotification(
  email: string,
  inviterName: string,
  formulaName: string,
  formulaId: number,
  locale: string
) {
  const formulaUrl = `${BASE_URL}/${locale}/formulas/${formulaId}`;

  const subject = locale === 'en'
    ? `${inviterName} shared a formula with you`
    : `${inviterName} a partagé une formule avec vous`;

  const html = locale === 'en'
    ? getFormulaShareNotificationEn(inviterName, formulaName, formulaUrl)
    : getFormulaShareNotificationFr(inviterName, formulaName, formulaUrl);

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

function getFormulaInviteEmailFr(inviterName: string, formulaName: string, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à découvrir un arôme</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Vous êtes invité(e) !</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> vous invite à découvrir la formule <strong>"${formulaName}"</strong> sur Oumamie.</p>

    <p style="margin-bottom: 20px;">Vous pourrez consulter la composition complète de cet arôme et le dupliquer dans votre espace personnel si vous souhaitez le modifier.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Voir l'arôme</a>
    </div>

    <p style="color: #666; font-size: 13px;">En cliquant sur le bouton, vous serez invité(e) à créer un compte gratuit pour accéder à l'arôme partagé.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
    <p>Si le bouton ne fonctionne pas, copiez ce lien: ${inviteUrl}</p>
  </div>
</body>
</html>
  `;
}

function getFormulaInviteEmailEn(inviterName: string, formulaName: string, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to view a formula</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">You're invited!</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> invited you to view the formula <strong>"${formulaName}"</strong> on Oumamie.</p>

    <p style="margin-bottom: 20px;">You'll be able to view the full composition and duplicate it to your personal space if you want to modify it.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Formula</a>
    </div>

    <p style="color: #666; font-size: 13px;">By clicking the button, you'll be prompted to create a free account to access the shared formula.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
    <p>If the button doesn't work, copy this link: ${inviteUrl}</p>
  </div>
</body>
</html>
  `;
}

function getFormulaShareNotificationFr(inviterName: string, formulaName: string, formulaUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formule partagée avec vous</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Nouvelle formule partagée</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> a partagé la formule <strong>"${formulaName}"</strong> avec vous.</p>
    <p style="margin-bottom: 20px; color: #666; font-size: 14px;">Vous pouvez consulter sa composition et la dupliquer dans votre espace si vous souhaitez la modifier.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${formulaUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Voir la formule</a>
    </div>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
  </div>
</body>
</html>
  `;
}

function getFormulaShareNotificationEn(inviterName: string, formulaName: string, formulaUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Formula shared with you</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">New formula shared</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> shared the formula <strong>"${formulaName}"</strong> with you.</p>
    <p style="margin-bottom: 20px; color: #666; font-size: 14px;">You can view its composition and duplicate it to your space if you want to modify it.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${formulaUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">View Formula</a>
    </div>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
  </div>
</body>
</html>
  `;
}

// Job Alert Email Types
export interface JobAlertJob {
  id: number;
  title: string;
  company: string;
  location: string;
  employmentType: string;
  url: string;
}

export async function sendJobAlertEmail(
  email: string,
  jobs: JobAlertJob[],
  locale: string,
  unsubscribeUrl: string
) {
  const subject = locale === 'fr'
    ? `${jobs.length} nouvelle${jobs.length > 1 ? 's' : ''} offre${jobs.length > 1 ? 's' : ''} d'emploi correspond${jobs.length > 1 ? 'ent' : ''} à vos critères`
    : `${jobs.length} new job${jobs.length > 1 ? 's' : ''} match${jobs.length === 1 ? 'es' : ''} your criteria`;

  const html = locale === 'fr'
    ? getJobAlertEmailFr(jobs, unsubscribeUrl)
    : getJobAlertEmailEn(jobs, unsubscribeUrl);

  await resend.emails.send({
    from: 'Oumamie <jobs@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

function getJobAlertEmailFr(jobs: JobAlertJob[], unsubscribeUrl: string): string {
  const jobsHtml = jobs.map(job => `
    <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
      <h3 style="color: #111; font-size: 18px; margin: 0 0 10px 0;">${job.title}</h3>
      <p style="color: #666; margin: 0 0 5px 0;"><strong>${job.company}</strong></p>
      <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">${job.location} • ${job.employmentType}</p>
      <a href="${job.url}" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">Voir l'offre</a>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nouvelles offres d'emploi</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 20px;">🎯 Nouvelles offres correspondant à vos critères</h2>
    ${jobsHtml}
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
    <p><a href="${unsubscribeUrl}" style="color: #999;">Gérer mes alertes emploi</a></p>
  </div>
</body>
</html>
  `;
}

// ============================================
// ADMIN NOTIFICATIONS
// ============================================

/**
 * Notify admin when a formula is shared (for user acquisition tracking)
 */
export async function sendShareAdminNotification(data: {
  sharerEmail: string;
  sharerName: string;
  recipientEmail: string;
  formulaName: string;
  isNewUser: boolean; // true = invite sent, false = shared with existing user
}) {
  const { sharerEmail, sharerName, recipientEmail, formulaName, isNewUser } = data;
  const type = isNewUser ? 'INVITE (new user)' : 'SHARE (existing user)';

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Oumamie] Formula shared: ${formulaName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>Formula Sharing Activity</h2>
  <p><strong>Type:</strong> ${type}</p>
  <p><strong>Sharer:</strong> ${sharerName} (${sharerEmail})</p>
  <p><strong>Recipient:</strong> ${recipientEmail}</p>
  <p><strong>Formula:</strong> ${formulaName}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  ${isNewUser ? '<p style="color: green; font-weight: bold;">🎯 Potential new user acquisition!</p>' : ''}
</body>
</html>
    `,
  });
}

/**
 * Notify admin when a new user signs up
 */
export async function sendNewUserNotification(data: {
  userId: string;
  email: string;
  name: string;
  signupMethod: "email" | "google";
  referrerName: string | null;
  referrerEmail: string | null;
  referralCode: string | null;
}) {
  const { userId, email, name, signupMethod, referrerName, referrerEmail, referralCode } = data;
  const methodLabel = signupMethod === 'google' ? 'Google OAuth' : 'Email/Password';
  const adminUrl = `${BASE_URL}/en/admin`;

  const referralSection = referrerName
    ? `
  <div style="background: #e8f5e9; border-left: 4px solid #4caf50; padding: 15px; margin-top: 15px;">
    <p style="margin: 0; color: #2e7d32; font-weight: bold;">Referred by:</p>
    <p style="margin: 5px 0 0 0;">${referrerName} (${referrerEmail})</p>
    <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">Code: ${referralCode}</p>
  </div>
    `
    : '';

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Oumamie] New user signup: ${email}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>New User Registration</h2>
  <p><strong>Name:</strong> ${name}</p>
  <p><strong>Email:</strong> ${email}</p>
  <p><strong>User ID:</strong> ${userId}</p>
  <p><strong>Method:</strong> ${methodLabel}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  ${referralSection}
  <p style="margin-top: 20px;">
    <a href="${adminUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Admin Dashboard</a>
  </p>
</body>
</html>
    `,
  });
}

function getJobAlertEmailEn(jobs: JobAlertJob[], unsubscribeUrl: string): string {
  const jobsHtml = jobs.map(job => `
    <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 20px; margin-bottom: 15px;">
      <h3 style="color: #111; font-size: 18px; margin: 0 0 10px 0;">${job.title}</h3>
      <p style="color: #666; margin: 0 0 5px 0;"><strong>${job.company}</strong></p>
      <p style="color: #888; font-size: 14px; margin: 0 0 15px 0;">${job.location} • ${job.employmentType}</p>
      <a href="${job.url}" style="display: inline-block; background: #111; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">View Job</a>
    </div>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New job opportunities</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 20px;">🎯 New jobs matching your criteria</h2>
    ${jobsHtml}
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
    <p><a href="${unsubscribeUrl}" style="color: #999;">Manage my job alerts</a></p>
  </div>
</body>
</html>
  `;
}

// ============================================
// CONTRIBUTION NOTIFICATIONS (Admin)
// ============================================

/**
 * Notify admin when a user submits a new substance
 */
export async function sendNewSubmissionNotification(data: {
  substanceId: number;
  substanceName: string;
  submittedByUserId: string;
}) {
  const { substanceId, substanceName, submittedByUserId } = data;
  const reviewUrl = `${BASE_URL}/en/admin/contributions/submissions/${substanceId}`;

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Oumamie] New substance submission: ${substanceName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>New Substance Submission</h2>
  <p><strong>Substance:</strong> ${substanceName}</p>
  <p><strong>Substance ID:</strong> ${substanceId}</p>
  <p><strong>Submitted by:</strong> ${submittedByUserId}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  <p style="margin-top: 20px;">
    <a href="${reviewUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Submission</a>
  </p>
</body>
</html>
    `,
  });
}

/**
 * Notify admin when a user submits feedback on a substance
 */
export async function sendNewFeedbackNotification(data: {
  feedbackId: number;
  substanceId: number;
  substanceName: string;
  feedbackType: string;
  submittedByUserId: string;
}) {
  const { feedbackId, substanceId, substanceName, feedbackType, submittedByUserId } = data;
  const reviewUrl = `${BASE_URL}/en/admin/contributions/feedback/${feedbackId}`;

  const typeLabel = {
    error_report: 'Error Report',
    change_request: 'Change Request',
    data_enhancement: 'Data Enhancement',
    general: 'General Feedback',
  }[feedbackType] || feedbackType;

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Oumamie] ${typeLabel} on: ${substanceName}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: sans-serif; padding: 20px;">
  <h2>New Substance Feedback</h2>
  <p><strong>Type:</strong> ${typeLabel}</p>
  <p><strong>Substance:</strong> ${substanceName} (ID: ${substanceId})</p>
  <p><strong>Feedback ID:</strong> ${feedbackId}</p>
  <p><strong>Submitted by:</strong> ${submittedByUserId}</p>
  <p><strong>Time:</strong> ${new Date().toISOString()}</p>
  <p style="margin-top: 20px;">
    <a href="${reviewUrl}" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Review Feedback</a>
  </p>
</body>
</html>
    `,
  });
}

// Job URL checker report to admin
export async function sendJobCheckReport(data: {
  checked: number;
  deactivated: number;
  active: number;
  errors: number;
  deadJobs: Array<{ title: string; company: string | null; source_url: string; reason?: string }>;
}) {
  const { checked, deactivated, active, errors, deadJobs } = data;

  const deadJobsHtml = deadJobs.map(job => `
    <div style="background: #fff3f3; border-left: 4px solid #e53e3e; padding: 12px 15px; margin-bottom: 10px; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #111;">${job.title}</p>
      <p style="margin: 0 0 4px 0; color: #666; font-size: 13px;">${job.company ?? "Unknown company"}</p>
      <p style="margin: 0 0 4px 0; color: #e53e3e; font-size: 13px; font-weight: 500;">Reason: ${job.reason ?? "Unknown"}</p>
      <p style="margin: 0;"><a href="${job.source_url}" style="color: #888; font-size: 12px; word-break: break-all;">${job.source_url}</a></p>
    </div>
  `).join('');

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Oumamie] Job URL check: ${deactivated} deactivated`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 40px; width: auto;" />
  </div>

  <h2 style="color: #111; margin-bottom: 20px;">Job URL Check Report</h2>

  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>Checked:</strong> ${checked} jobs</p>
    <p style="margin: 0 0 8px 0;"><strong>Still active:</strong> ${active}</p>
    <p style="margin: 0 0 8px 0; color: #e53e3e; font-weight: 600;"><strong>Deactivated:</strong> ${deactivated}</p>
    ${errors > 0 ? `<p style="margin: 0; color: #d69e2e;"><strong>Errors:</strong> ${errors}</p>` : ''}
    <p style="margin: 8px 0 0 0; color: #888; font-size: 12px;">${new Date().toISOString()}</p>
  </div>

  ${deadJobs.length > 0 ? `
  <h3 style="color: #e53e3e; margin-bottom: 15px;">Deactivated Jobs</h3>
  ${deadJobsHtml}
  ` : ''}

  <div style="text-align: center; margin-top: 25px;">
    <a href="${BASE_URL}/en/admin/jobs" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View Admin Jobs</a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
    Oumamie - Automated Job URL Checker
  </p>
</body>
</html>
    `,
  });
}

// Job search monitor report to admin
export async function sendMonitorSearchReport(data: {
  totalMonitors: number;
  newListings: Array<{
    title: string;
    company: string | null;
    location: string | null;
    employmentType: string | null;
    url: string;
    monitorLabel: string;
  }>;
}) {
  const { totalMonitors, newListings } = data;

  const listingsHtml = newListings
    .map(
      (listing) => `
    <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 12px 15px; margin-bottom: 10px; border-radius: 0 6px 6px 0;">
      <p style="margin: 0 0 4px 0; font-weight: 600; color: #111;">${listing.title}</p>
      <p style="margin: 0 0 4px 0; color: #666; font-size: 13px;">${listing.company ?? "Unknown company"} ${listing.location ? `· ${listing.location}` : ""} ${listing.employmentType ? `· ${listing.employmentType}` : ""}</p>
      <p style="margin: 0 0 4px 0; color: #888; font-size: 12px;">Source: ${listing.monitorLabel}</p>
      <p style="margin: 0;"><a href="${listing.url}" style="color: #2563eb; font-size: 13px;">View listing</a></p>
    </div>
  `
    )
    .join("");

  await resend.emails.send({
    from: "Oumamie <hello@oumamie.xyz>",
    to: DEV_EMAIL,
    subject: `[Oumamie] ${newListings.length} new job listing${newListings.length > 1 ? "s" : ""} found`,
    html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 40px; width: auto;" />
  </div>

  <h2 style="color: #111; margin-bottom: 20px;">New Job Listings Detected</h2>

  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>Monitors checked:</strong> ${totalMonitors}</p>
    <p style="margin: 0 0 8px 0; color: #22c55e; font-weight: 600;"><strong>New listings:</strong> ${newListings.length}</p>
    <p style="margin: 8px 0 0 0; color: #888; font-size: 12px;">${new Date().toISOString()}</p>
  </div>

  <h3 style="color: #22c55e; margin-bottom: 15px;">New Listings</h3>
  ${listingsHtml}

  <div style="text-align: center; margin-top: 25px;">
    <a href="${BASE_URL}/en/admin/job-monitors" style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View in Admin</a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
    Oumamie - Job Search Monitor
  </p>
</body>
</html>
    `,
  });
}

// Support chat notification to admin
export async function sendSupportNotification(data: {
  conversationId: number;
  senderInfo: string;
  messageContent: string;
  isGuest: boolean;
}) {
  const { conversationId, senderInfo, messageContent, isGuest } = data;
  const adminUrl = `${BASE_URL}/en/admin/support/${conversationId}`;
  const userType = isGuest ? 'Guest' : 'User';

  await resend.emails.send({
    from: 'Oumamie Support <support@oumamie.xyz>',
    to: DEV_EMAIL,
    subject: `[Support] New message from ${senderInfo}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 40px; width: auto;" />
  </div>

  <h2 style="color: #111; margin-bottom: 20px;">New Support Message</h2>

  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${senderInfo}</p>
    <p style="margin: 0 0 10px 0;"><strong>Type:</strong> ${userType}</p>
    <p style="margin: 0 0 10px 0;"><strong>Conversation ID:</strong> ${conversationId}</p>
    <p style="margin: 0;"><strong>Time:</strong> ${new Date().toISOString()}</p>
  </div>

  <div style="background: #fff; border: 1px solid #e5e5e5; border-radius: 8px; padding: 15px; margin-bottom: 20px;">
    <p style="margin: 0; white-space: pre-wrap; color: #333;">${messageContent}</p>
  </div>

  <div style="text-align: center;">
    <a href="${adminUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: 500;">View & Reply</a>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
    Oumamie Support System
  </p>
</body>
</html>
    `,
  });
}

// ============================================
// WORKSPACE INVITE EMAILS
// ============================================

/**
 * Send workspace invite email to non-users
 */
export async function sendWorkspaceInviteEmail(
  email: string,
  inviterName: string,
  workspaceName: string,
  role: string,
  inviteToken: string,
  locale: string
) {
  const inviteUrl = `${BASE_URL}/${locale}/invite/workspace?token=${inviteToken}`;

  const roleLabel = locale === 'fr'
    ? (role === 'editor' ? 'éditeur' : 'observateur')
    : role;

  const subject = locale === 'en'
    ? `${inviterName} invited you to join a workspace on Oumamie`
    : `${inviterName} vous invite à rejoindre un espace de travail sur Oumamie`;

  const html = locale === 'en'
    ? getWorkspaceInviteEmailEn(inviterName, workspaceName, roleLabel, inviteUrl)
    : getWorkspaceInviteEmailFr(inviterName, workspaceName, roleLabel, inviteUrl);

  await resend.emails.send({
    from: 'Oumamie <hello@oumamie.xyz>',
    to: email,
    subject,
    html,
  });
}

function getWorkspaceInviteEmailFr(inviterName: string, workspaceName: string, role: string, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation à rejoindre un espace de travail</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">La plateforme des futurs aromaticiens</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">Vous êtes invité(e) !</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> vous invite à rejoindre l'espace de travail <strong>"${workspaceName}"</strong> en tant que <strong>${role}</strong>.</p>

    <p style="margin-bottom: 20px;">Dans cet espace, vous pourrez collaborer sur des formules et partager des documents avec les autres membres de l'équipe.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Rejoindre l'espace</a>
    </div>

    <p style="color: #666; font-size: 13px;">En cliquant sur le bouton, vous serez invité(e) à créer un compte gratuit si vous n'en avez pas encore.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - La plateforme des aromaticiens</p>
    <p>Si le bouton ne fonctionne pas, copiez ce lien: ${inviteUrl}</p>
  </div>
</body>
</html>
  `;
}

function getWorkspaceInviteEmailEn(inviterName: string, workspaceName: string, role: string, inviteUrl: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitation to join a workspace</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="text-align: center; margin-bottom: 30px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 50px; width: auto; margin-bottom: 10px;" />
    <p style="color: #666; font-size: 14px;">The platform for aspiring flavorists</p>
  </div>

  <div style="background: #f9f9f9; border-radius: 8px; padding: 30px; margin-bottom: 20px;">
    <h2 style="color: #111; font-size: 20px; margin-bottom: 15px;">You're invited!</h2>
    <p style="margin-bottom: 20px;"><strong>${inviterName}</strong> invited you to join the workspace <strong>"${workspaceName}"</strong> as a <strong>${role}</strong>.</p>

    <p style="margin-bottom: 20px;">In this workspace, you can collaborate on formulas and share documents with other team members.</p>

    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteUrl}" style="display: inline-block; background: #111; color: #fff; padding: 14px 30px; text-decoration: none; border-radius: 6px; font-weight: 500;">Join Workspace</a>
    </div>

    <p style="color: #666; font-size: 13px;">By clicking the button, you'll be prompted to create a free account if you don't have one yet.</p>
  </div>

  <div style="text-align: center; color: #999; font-size: 12px;">
    <p>Oumamie - The flavorist platform</p>
    <p>If the button doesn't work, copy this link: ${inviteUrl}</p>
  </div>
</body>
</html>
  `;
}

// Cron job failure notification to admin
export async function sendCronErrorNotification(data: {
  cronRoute: string;
  errorMessage: string;
  timestamp: string;
  context?: string;
}) {
  const { cronRoute, errorMessage, timestamp, context } = data;

  await resend.emails.send({
    from: "Oumamie <hello@oumamie.xyz>",
    to: DEV_EMAIL,
    subject: `[Oumamie] CRON FAILURE: ${cronRoute}`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;">
  <div style="text-align: center; margin-bottom: 20px;">
    <img src="${LOGO_URL}" alt="Oumamie" style="height: 40px; width: auto;" />
  </div>

  <h2 style="color: #e53e3e; margin-bottom: 20px;">Cron Job Failure</h2>

  <div style="background: #fff5f5; border-left: 4px solid #e53e3e; padding: 15px; border-radius: 0 8px 8px 0; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0;"><strong>Route:</strong> /api/cron/${cronRoute}</p>
    <p style="margin: 0 0 8px 0;"><strong>Time:</strong> ${timestamp}</p>
    ${context ? `<p style="margin: 0;"><strong>Context:</strong> ${context}</p>` : ""}
  </div>

  <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
    <p style="margin: 0 0 8px 0; font-weight: 600;">Error Message:</p>
    <pre style="margin: 0; white-space: pre-wrap; word-break: break-word; font-size: 13px; color: #e53e3e; background: #fff; padding: 12px; border-radius: 4px; border: 1px solid #e5e5e5;">${errorMessage}</pre>
  </div>

  <p style="color: #999; font-size: 12px; text-align: center; margin-top: 30px;">
    Oumamie - Automated Cron Monitor
  </p>
</body>
</html>
    `,
  });
}
