import 'dotenv/config';
import type { APIRoute } from 'astro';
import { renderTemplate } from '../../email/renderTemplate';

// Recomendado: usar App Password de Gmail (no la contraseña normal)
// Configura en tu .env:
// GMAIL_USER=tu_correo@gmail.com
// GMAIL_APP_PASSWORD=tu_app_password
// CONTACT_TO=destino@correo.com (opcional; si no se define, se usa GMAIL_USER)

export const POST: APIRoute = async ({ request }) => {
  try {
    const { name, email, subject, message } = await request.json();

    if (!name || !email || !subject || !message) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Faltan campos requeridos.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user = process.env.GMAIL_USER as string | undefined;
    const pass = process.env.GMAIL_APP_PASSWORD as string | undefined;
    const to = (process.env.CONTACT_TO as string | undefined) || user;

    // DIAGNÓSTICO TEMPORAL: comprobar si el .env está cargado (no imprime valores)
    console.log('[contact-api] ENV CHECK =>', {
      hasUser: !!user,
      hasPass: !!pass,
      hasTo: !!to,
    });

    if (!user || !pass) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Configura GMAIL_USER y GMAIL_APP_PASSWORD en .env' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Import dinámico para evitar conflictos CJS/ESM en dev
    const nodemailer = (await import('nodemailer')).default;

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user, pass },
    });

    // Verificar conexión/credenciales antes de enviar (opcional, con tipado laxo)
    if (typeof (transporter as any).verify === 'function') {
      try {
        const verifyResult = await (transporter as any).verify();
        console.log('[contact-api] transporter.verify OK =>', verifyResult);
      } catch (verr: any) {
        console.error('[contact-api] transporter.verify ERROR =>', verr?.message);
        return new Response(
          JSON.stringify({ ok: false, error: verr?.message || 'No fue posible autenticar con Gmail (verify).' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const siteTitle = process.env.SITE_TITLE || 'Mi Portafolio';
    const html = renderTemplate('contact', {
      name,
      email,
      subject,
      message,
      date: new Date().toLocaleString(),
      siteTitle,
    });

    await transporter.sendMail({
      from: `Portafolio <${user}>`,
      to,
      replyTo: email,
      subject: `[${siteTitle}] ${subject}`,
      html,
    });
    console.log('[contact-api] sendMail OK');

    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('Error enviando correo:', err);
    return new Response(
      JSON.stringify({ ok: false, error: err?.message || 'Error al enviar el correo.' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
