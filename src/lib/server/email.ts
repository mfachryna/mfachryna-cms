import nodemailer from 'nodemailer';
import {
	EMAIL_HOST,
	EMAIL_PORT,
	EMAIL_SECURE,
	EMAIL_USER,
	EMAIL_PASS,
	EMAIL_FROM
} from '$env/static/private';

const transporter = nodemailer.createTransport({
	host: EMAIL_HOST,
	port: parseInt(EMAIL_PORT || '587'),
	secure: EMAIL_SECURE === 'true',
	auth: {
		user: EMAIL_USER,
		pass: EMAIL_PASS
	},
	debug: process.env.NODE_ENV === 'development',
	logger: process.env.NODE_ENV === 'development'
});

export async function verifyEmailConnection() {
	try {
		await transporter.verify();

		return true;
	} catch (error) {
		console.error('❌ SMTP connection error:', error);
		return false;
	}
}

export async function sendEmail({
	to,
	subject,
	html,
	text,
	from = EMAIL_FROM || EMAIL_USER,
	replyTo,
	attachments = []
}: {
	to: string;
	subject: string;
	html: string;
	text?: string;
	from?: string;
	replyTo?: string;
	attachments?: Array<{
		filename: string;
		content: Buffer;
		contentType: string;
	}>;
}) {
	try {
		const mailOptions = {
			from: from,
			to: to,
			subject: subject,
			html: html,
			text: text || htmlToText(html),
			replyTo: replyTo || from,
			attachments: attachments.map((att) => ({
				filename: att.filename,
				content: att.content,
				contentType: att.contentType
			}))
		};

		const info = await transporter.sendMail(mailOptions);

		return {
			success: true,
			messageId: info.messageId,
			response: info.response
		};
	} catch (error) {
		console.error('❌ Email sending error:', error);
		throw new Error(`Failed to send email: ${error.message}`);
	}
}

function htmlToText(html: string): string {
	return html
		.replace(/<[^>]*>/g, '')
		.replace(/&nbsp;/g, ' ')
		.replace(/&amp;/g, '&')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>')
		.replace(/&quot;/g, '"')
		.replace(/&#39;/g, "'")
		.trim();
}

export async function sendEmailWithAutoText(options: {
	to: string;
	subject: string;
	html: string;
	from?: string;
	replyTo?: string;
}) {
	return sendEmail({
		...options,
		text: htmlToText(options.html)
	});
}

export async function sendEmailWithAttachments(options: {
	to: string;
	subject: string;
	html: string;
	from?: string;
	replyTo?: string;
	attachments?: Array<{
		filename: string;
		content: Buffer;
		contentType: string;
	}>;
}) {
	return sendEmail({
		...options,
		text: htmlToText(options.html),
		attachments: options.attachments || []
	});
}
