# Email Setup Instructions

This form now includes email functionality that sends form submissions to your email address with attached files.

## Setup Steps

### 1. Create Environment File
Create a `.env.local` file in the root directory with your SMTP credentials:

```env
# SMTP Configuration for Gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Recipient email (where form submissions will be sent)
# If not provided, emails will be sent to SMTP_USER
RECIPIENT_EMAIL=recipient@example.com
```

### 2. Gmail App Password Setup
Since you're using Gmail SMTP, you'll need to:

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS` (not your regular Gmail password)

### 3. Features Included

- ✅ Form validation (client-side and server-side)
- ✅ File upload support (PDF, DOC, DOCX)
- ✅ Email notifications with form details
- ✅ File attachments in emails
- ✅ Success/error status messages
- ✅ Loading states during submission
- ✅ File size validation (10MB limit)
- ✅ File type validation

### 4. Testing

1. Start the development server: `npm run dev`
2. Fill out the form with test data
3. Upload a test file (PDF or Word document)
4. Submit the form
5. Check your email for the notification

### 5. Troubleshooting

- **"Email service not configured"**: Check your `.env.local` file
- **"Authentication failed"**: Verify your Gmail app password
- **"File too large"**: Ensure files are under 10MB
- **"Invalid file type"**: Only PDF, DOC, and DOCX files are allowed

### 6. Customization

You can customize:
- Email template in `/app/api/submit-form/route.ts`
- File size limits (currently 10MB)
- Allowed file types
- Form validation rules
- SMTP settings for other email providers
