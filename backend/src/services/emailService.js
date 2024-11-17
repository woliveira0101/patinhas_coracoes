const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

class EmailService {
  getTransporter() {
    if (!this.transporter) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: process.env.SMTP_PORT === '465',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }
    return this.transporter;
  }

  async sendPasswordResetEmail(to, resetToken) {
    const resetLink = `${process.env.FRONTEND_URL}/auth/password/reset/${resetToken}`;

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject: 'Redefinição de Senha - Patinhas',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Redefinição de Senha</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; margin: 0; padding: 0;">
          <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333; margin-bottom: 20px;">Redefinição de Senha</h2>
            
            <p style="margin-bottom: 20px;">Você solicitou a redefinição de sua senha. Clique no botão abaixo para criar uma nova senha:</p>
            
            <!-- Botão de Redefinição -->
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 30px auto;">
              <tr>
                <td>
                  <a href="${resetLink}"
                     target="_blank"
                     style="background-color: #4CAF50;
                            color: #ffffff;
                            text-decoration: none;
                            padding: 12px 24px;
                            border-radius: 5px;
                            display: inline-block;
                            font-weight: bold;">
                    Redefinir Senha
                  </a>
                </td>
              </tr>
            </table>

            <!-- Link alternativo -->
            <p style="margin: 20px 0;">
              Se o botão acima não funcionar, copie e cole o link abaixo no seu navegador:<br>
              <a href="${resetLink}" style="color: #4CAF50; word-break: break-all;">${resetLink}</a>
            </p>

            <p style="margin: 20px 0;">Este link é válido por 1 hora.</p>
            
            <p style="margin: 20px 0;">Se você não solicitou a redefinição de senha, por favor ignore este email.</p>
            
            <hr style="border: 1px solid #eee; margin: 30px 0;">
            
            <p style="color: #666; font-size: 12px; text-align: center;">
              Esta é uma mensagem automática, por favor não responda.
            </p>
          </div>
        </body>
        </html>
      `,
      text: `
        Redefinição de Senha

        Você solicitou a redefinição de sua senha. Para criar uma nova senha, acesse o link abaixo:

        ${resetLink}

        Este link é válido por 1 hora.

        Se você não solicitou a redefinição de senha, por favor ignore este email.
      `,
    };

    try {
      const transporter = this.getTransporter();
      await transporter.sendMail(mailOptions);
      logger.info(`Password reset email sent to ${to}`);
    } catch (error) {
      logger.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }
}

module.exports = new EmailService();
