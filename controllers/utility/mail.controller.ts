import nodemailer, { SentMessageInfo, TransportOptions } from 'nodemailer'
import config from '@/config'
import { EmailTemplate } from '@/repositories'

interface SendEmailContent {
    subject: string
    template: string
    otp?: string
}

interface SendEmailTemplateParams {
    identifier: string
    to: string
    content: { otp: string }
    bcc?: string | string[] | null
}

const sendEmail = async (toEmail: string, content: SendEmailContent, bcc: string | string[] | null = null) => {
    try {
        const { subject, template } = content
        const transport = nodemailer.createTransport({
            host: config.SMTP_HOST,
            port: config.SMTP_PORT,
            secure: config.SMTP_SECURE,
            auth: {
                user: config.SMTP_USER,
                pass: config.SMTP_PASS,
            },
        } as TransportOptions)

        const mailSentInformation: SentMessageInfo = await transport.sendMail({
            from: config.SMTP_MAIL,
            to: toEmail,
            bcc: bcc ?? undefined,
            subject,
            html: template,
        })

        console.log('Mail sent info: ', mailSentInformation.accepted, mailSentInformation.messageId)
        return true
    } catch (error) {
        console.log('Error in sending email', error)
        return false
    }
}

export const sendEmailViaTemplate = async ({ identifier, to, content, bcc }: SendEmailTemplateParams) => {
    try {
        const template = await EmailTemplate.findByIdentifier(identifier)

        if (!template) {
            console.log('No email template found for', identifier)
            return false
        }

        if (template.status === 'inactive') {
            console.log(`${identifier} template is currently inactive`)
        }

        const mailContent = { subject: '', template: '' }

        mailContent['subject'] = template.subject
        mailContent['template'] = template.content

        switch (identifier) {
            case 'OTP_TEMPLATE':
                mailContent['template'] = mailContent['template'].replace('##OTP##', content.otp)
                break
            default:
                break
        }

        return await sendEmail(to, mailContent, bcc)
    } catch (error) {
        console.log('sendEmailViaTemplate', error)
        return false
    }
}
