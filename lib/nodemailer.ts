
import { VerificationToken } from '@prisma/client';
import nodemailer from 'nodemailer'
//Ustawienia SMTP
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
})

const domain = process.env.NEXT_PUBLIC_APP_URL

export async function sendVerificationEmail(token: VerificationToken) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #121212;
            color: #fff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e1e1e;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
          }
          h1 {
            color: #d4af37; /* Złoty, symbol siły i prestiżu */
            font-size: 26px;
            text-transform: uppercase;
            font-weight: bold;
          }
          p {
            color: #bbb;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 15px 30px;
            background-color: #d4af37;
            color: #121212;
            text-decoration: none;
            font-size: 18px;
            border-radius: 5px;
            text-align: center;
            font-weight: bold;
            margin-top: 20px;
            box-shadow: 0 4px 8px rgba(255, 255, 255, 0.1);
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          .button:hover {
            background-color: #b8962e;
          }
          .logo {
            max-width: 100%;
            height: auto;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="https://menskamoc.pl/logo.svg" alt="Męska Strona Mocy"/>
          <h1>Witaj na Męskiej Stronie Mocy</h1>
          <p>To moment, w którym zaczynasz działać. Potwierdź swój e-mail i wejdź na ścieżkę rozwoju.</p>
          <a href="${domain}/auth/verification?token=${token.id}" class="button">Aktywuj Konto</a>
        </div>
      </body>
    </html>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: token.email,
    subject: "Twój pierwszy krok – Potwierdź swój e-mail",
    html: htmlContent
  });
}

export async function sendResetPasswordEmail(token: VerificationToken) {
  const htmlContent = `
    <html>
      <head>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #121212;
            color: #fff;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #1e1e1e;
            padding: 20px;
            text-align: center;
            border-radius: 8px;
            box-shadow: 0 0 15px rgba(255, 255, 255, 0.1);
          }
          h1 {
            color: #d4af37;
            font-size: 24px;
            text-transform: uppercase;
          }
          p {
            color: #bbb;
            font-size: 16px;
          }
          .button {
            display: inline-block;
            padding: 12px 24px;
            background-color: #d4af37;
            color: #121212;
            text-decoration: none;
            font-size: 16px;
            border-radius: 5px;
            font-weight: bold;
            margin-top: 20px;
          }
          .button:hover {
            background-color: #b8962e;
          }
          .logo {
            max-width: 150px;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <img class="logo" src="https://menskamoc.pl/logo.svg" alt="Męska Strona Mocy"/>
          <h1>Reset hasła</h1>
          <p>Otrzymaliśmy prośbę o zresetowanie Twojego hasła. Jeśli to Ty, kliknij w przycisk poniżej, aby ustawić nowe hasło.</p>
          <a href="${domain}/auth/password-reset?token=${token.id}" class="button">Zresetuj hasło</a>
          <p>Jeśli nie prosiłeś o reset, zignoruj tę wiadomość.</p>
        </div>
      </body>
    </html>
  `;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: token.email,
    subject: "Resetowanie hasła",
    html: htmlContent,
  });
}
  