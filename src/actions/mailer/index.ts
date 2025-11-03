'use server'
import nodemailer from 'nodemailer'

export const onMailer = async (email: string) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.NODE_MAILER_EMAIL,
        pass: process.env.NODE_MAILER_GMAIL_APP_PASSWORD,
      },
    })

    const mailOptions = {
      to: email,
      subject: 'Realtime Support',
      text: 'One of your customers on ChatDock, just switched to realtime mode',
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.log(error)
  }
}
