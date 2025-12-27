import { mailConfig } from "../config/mail";
import nodemailer, { Transporter } from "nodemailer";

type VerifyEmailPayload = {
  name: string;
  link: string;
};

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function verifyEmailHtml({ name, link }: VerifyEmailPayload) {
  const safeName = escapeHtml(name);
  const safeLink = escapeHtml(link);

  return `
  <div style="font-family:system-ui,Segoe UI,Roboto,Arial;line-height:1.4">
    <h2>E-Mail bestätigen</h2>
    <p>Hallo ${safeName},</p>
    <p>bitte bestätige deine E-Mail-Adresse, indem du auf den folgenden Link klickst:</p>
    <p><a href="${safeLink}">E-Mail bestätigen</a></p>
    <p>Falls du dich nicht registriert hast, ignoriere diese Nachricht.</p>
  </div>`;
}

function verifyEmailText({ name, link }: VerifyEmailPayload) {
  return `Hallo ${name},

bitte bestätige deine E-Mail-Adresse über diesen Link:
${link}

Falls du dich nicht registriert hast, ignoriere diese Nachricht.
`;
}

class MailService {
  private transporter: Transporter;

  constructor() {
    const auth =
      mailConfig.user && mailConfig.pass
        ? { user: mailConfig.user, pass: mailConfig.pass }
        : undefined;

    this.transporter = nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth,
    });
  }

  async sendVerifyEmail(to: string, payload: VerifyEmailPayload) {
    if (!mailConfig.enabled) return;

    await this.transporter.sendMail({
      from: mailConfig.from,
      to,
      subject: "E-Mail bestätigen",
      text: verifyEmailText(payload),
      html: verifyEmailHtml(payload),
    });
  }

  async sendResetPasswordEmail(to: string, payload: VerifyEmailPayload) {
    if (!mailConfig.enabled) return;

    await this.transporter.sendMail({
      from: mailConfig.from,
      to,
      subject: "Passwort zurücksetzen",
      text: verifyEmailText(payload),
      html: verifyEmailHtml(payload),
    });
  }
}

export const mailService = new MailService();
