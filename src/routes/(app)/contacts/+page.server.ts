import { error, fail } from '@sveltejs/kit';
import { prisma } from '$lib/server/auth';
import { sendEmailWithAttachments } from '$lib/server/email';
import type { PageServerLoad, Actions } from './$types';

export const load: PageServerLoad = async ({ parent }) => {
	const parentData = await parent();

	try {
		const contacts = await prisma.contact.findMany({
			orderBy: {
				createdAt: 'desc'
			}
		});

		return {
			...parentData,
			contacts
		};
	} catch (error) {
		console.error('Failed to load contacts:', error);
		return {
			...parentData,
			contacts: []
		};
	}
};

export const actions: Actions = {
	updateStatus: async ({ request }) => {
		try {
			const data = await request.formData();
			const contactId = parseInt(data.get('contactId') as string);
			const status = data.get('status') as string;

			if (!contactId || !status) {
				return fail(400, { error: 'Missing required fields' });
			}

			await prisma.contact.update({
				where: { id: contactId },
				data: {
					status,
					updatedAt: new Date()
				}
			});

			return {
				success: true,
				message: 'Contact status updated successfully'
			};
		} catch (err) {
			console.error('Error updating contact status:', err);
			return fail(500, { error: 'Failed to update contact status' });
		}
	},

	sendReply: async ({ request }) => {
		try {
			const data = await request.formData();
			const contactId = parseInt(data.get('contactId') as string);
			const contactEmail = data.get('contactEmail') as string;
			const contactName = data.get('contactName') as string;
			const subject = data.get('subject') as string;
			const message = data.get('message') as string;

			if (!contactId || !contactEmail || !subject || !message) {
				return fail(400, { error: 'Missing required fields' });
			}

			const attachments: Array<{
				filename: string;
				content: Buffer;
				contentType: string;
			}> = [];

			for (const [key, value] of data.entries()) {
				if (key === 'attachments' && value instanceof File && value.size > 0) {
					const buffer = Buffer.from(await value.arrayBuffer());
					attachments.push({
						filename: value.name,
						content: buffer,
						contentType: value.type || 'application/octet-stream'
					});
				}
			}

			const htmlMessage = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background: #fafafa;
            }
            .email-card {
              background: white;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            .header {
              background: #000;
              color: white;
              padding: 24px;
              text-align: center;
            }
            .header h2 {
              margin: 0;
              font-size: 18px;
              font-weight: 500;
            }
            .content {
              padding: 24px;
              font-size: 15px;
              line-height: 1.7;
              white-space: pre-line;
            }
            .signature {
              margin-top: 24px;
              padding-top: 16px;
              border-top: 1px solid #eee;
              color: #666;
            }
            .footer {
              background: #f9f9f9;
              padding: 16px 24px;
              text-align: center;
              font-size: 13px;
              color: #777;
              border-top: 1px solid #eee;
            }
          </style>
        </head>
        <body>
          <div class="email-card">
            <div class="header">
              <h2>Project Inquiry Response</h2>
            </div>
            
            <div class="content">
              ${message}
              <div class="signature">
                <p>Best regards,<br>
                <strong>Your Development Team</strong></p>
              </div>
            </div>
            
            <div class="footer">
              <p>Thank you for your interest • Reply to this email anytime</p>
            </div>
          </div>
        </body>
        </html>
      `;

			await sendEmailWithAttachments({
				to: contactEmail,
				subject: subject,
				html: htmlMessage,
				attachments: attachments
			});

			await prisma.contact.update({
				where: { id: contactId },
				data: {
					status: 'in-progress',
					updatedAt: new Date()
				}
			});

			return {
				success: true,
				message: `Reply sent successfully to ${contactEmail}${attachments.length > 0 ? ` with ${attachments.length} attachment${attachments.length > 1 ? 's' : ''}` : ''}`
			};
		} catch (err) {
			console.error('Error sending reply:', err);
			return fail(500, {
				error: `Failed to send reply: ${err.message || 'Unknown error'}`
			});
		}
	},

	delete: async ({ request }) => {
		try {
			const data = await request.formData();
			const contactId = parseInt(data.get('id') as string);

			if (!contactId) {
				return fail(400, { error: 'Contact ID is required' });
			}

			await prisma.contact.delete({
				where: { id: contactId }
			});

			return {
				success: true,
				message: 'Contact deleted successfully'
			};
		} catch (err) {
			console.error('Error deleting contact:', err);
			return fail(500, { error: 'Failed to delete contact' });
		}
	}
};

function getFileIconForEmail(filename: string): string {
	const ext = filename.toLowerCase().split('.').pop();
	switch (ext) {
		case 'pdf':
			return '📄';
		case 'doc':
		case 'docx':
			return '📝';
		case 'xls':
		case 'xlsx':
			return '📊';
		case 'ppt':
		case 'pptx':
			return '📽️';
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'webp':
			return '🖼️';
		case 'zip':
		case 'rar':
		case '7z':
			return '🗜️';
		case 'txt':
			return '📃';
		case 'mp4':
		case 'avi':
		case 'mov':
			return '🎥';
		case 'mp3':
		case 'wav':
		case 'flac':
			return '🎵';
		default:
			return '📎';
	}
}
