export const mailConfig = {
  host: process.env.SMTP_HOST ?? "localhost",
  port: Number(process.env.SMTP_PORT ?? "1025"),
  secure: (process.env.SMTP_SECURE ?? "false") === "true",
  user: process.env.SMTP_USER ?? "",
  pass: process.env.SMTP_PASS ?? "",
  from: process.env.MAIL_FROM ?? "no-reply@yourapp.local",
  enabled: (process.env.MAIL_ENABLED ?? "true") === "true",
};
