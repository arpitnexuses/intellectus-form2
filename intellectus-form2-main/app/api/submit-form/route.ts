import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import { promises as fs } from 'fs'
import path from 'path'
import type Mail from 'nodemailer/lib/mailer'

// Ensure this route runs on the Node.js runtime (required for nodemailer)
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string
    const email = formData.get('email') as string
    const phone = formData.get('phone') as string
    const message = formData.get('message') as string
    const file = formData.get('file') as File | null

    if (!firstName || !lastName || !email || !phone || !message) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    if (file && file.size > 0) {
      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 })
      }

      const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: 'Only PDF and Word documents are allowed' }, { status: 400 })
      }
    }

    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      return NextResponse.json({ error: 'Email service not configured. Missing SMTP_USER/SMTP_PASS.' }, { status: 500 })
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    try {
      // Verify SMTP connection early to surface configuration errors
      await transporter.verify()
    } catch (smtpError: any) {
      console.error('SMTP verification failed:', smtpError)
      return NextResponse.json(
        { error: `Email service connection failed: ${smtpError?.message || 'Unknown SMTP error'}` },
        { status: 500 }
      )
    }

    // Prepare logo image: attach /public/logo.png as CID if available; fallback to inline SVG
    const logoPath = path.join(process.cwd(), 'public', 'logo.png')
    let logoSrc = ''
    try {
      await fs.access(logoPath)
      logoSrc = 'cid:intellectus-logo'
    } catch (e) {
      logoSrc = `data:image/svg+xml;base64,${Buffer.from(`
        <svg width=\"200\" height=\"60\" viewBox=\"0 0 200 60\" xmlns=\"http://www.w3.org/2000/svg\">
          <defs>
            <linearGradient id=\"logoGradient\" x1=\"0%\" y1=\"0%\" x2=\"100%\" y2=\"0%\">
              <stop offset=\"0%\" style=\"stop-color:#1a1a1a;stop-opacity:1\" />
              <stop offset=\"100%\" style=\"stop-color:#2a2a2a;stop-opacity:1\" />
            </linearGradient>
          </defs>
          <rect width=\"200\" height=\"60\" fill=\"url(#logoGradient)\" rx=\"8\"/>
          <rect x=\"20\" y=\"15\" width=\"8\" height=\"30\" fill=\"#4285f4\"/>
          <rect x=\"16\" y=\"15\" width=\"16\" height=\"4\" fill=\"#4285f4\"/>
          <rect x=\"16\" y=\"41\" width=\"16\" height=\"4\" fill=\"#4285f4\"/>
          <rect x=\"40\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"40\" y=\"15\" width=\"20\" height=\"6\" fill=\"white\"/>
          <rect x=\"54\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"70\" y=\"15\" width=\"20\" height=\"6\" fill=\"white\"/>
          <rect x=\"78\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"100\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"100\" y=\"15\" width=\"16\" height=\"6\" fill=\"white\"/>
          <rect x=\"100\" y=\"27\" width=\"12\" height=\"6\" fill=\"white\"/>
          <rect x=\"100\" y=\"39\" width=\"16\" height=\"6\" fill=\"white\"/>
          <rect x=\"125\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"125\" y=\"39\" width=\"16\" height=\"6\" fill=\"white\"/>
          <rect x=\"150\" y=\"15\" width=\"6\" height=\"30\" fill=\"white\"/>
          <rect x=\"150\" y=\"39\" width=\"16\" height=\"6\" fill=\"white\"/>
          <text x=\"100\" y=\"55\" font-family=\"Arial, sans-serif\" font-size=\"8\" fill=\"#cccccc\" text-anchor=\"middle\">CAPITAL</text>
        </svg>
      `).toString('base64')}`
    }

    const emailContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Internship Application</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa; }
          .container { background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%); color: white; padding: 30px; text-align: center; }
          .logo { margin-bottom: 15px; }
          .logo img { max-width: 220px; height: auto; display: block; margin: 0 auto; border-radius: 6px; background-color: #1e1e1e; padding: 10px; }
          .subtitle { font-size: 16px; opacity: 0.9; margin: 0; }
          .content { padding: 30px; }
          .title { color: #1a1a1a; font-size: 24px; margin-bottom: 25px; border-bottom: 2px solid #4285f4; padding-bottom: 10px; }
          .info-section { background-color: #f8f9fa; border-radius: 6px; padding: 20px; margin-bottom: 20px; }
          .info-row { display: flex; margin-bottom: 12px; align-items: flex-start; }
          .info-row:last-child { margin-bottom: 0; }
          .label { font-weight: 600; color: #555; min-width: 120px; margin-right: 15px; }
          .value { color: #333; flex: 1; }
          .message-section { background-color: #ffffff; border: 1px solid #e1e5e9; border-radius: 6px; padding: 20px; margin-top: 20px; }
          .message-label { font-weight: 600; color: #555; margin-bottom: 10px; display: block; }
          .message-content { color: #333; white-space: pre-wrap; line-height: 1.6; }
          .file-info { background-color: #e3f2fd; border-left: 4px solid #4285f4; padding: 15px; margin-top: 20px; border-radius: 0 6px 6px 0; }
          .file-name { font-weight: 600; color: #1976d2; }
          .footer { background-color: #f8f9fa; padding: 20px 30px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #e1e5e9; }
          .timestamp { color: #888; font-size: 12px; margin-top: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">
              <img src="${logoSrc}" alt="Intellectus Capital" style="max-width: 220px; height: auto;">
            </div>
            <p class="subtitle">Investment Banking & Corporate Advisory</p>
          </div>

          <div class="content">
            <h1 class="title">New Internship Application</h1>

            <div class="info-section">
              <div class="info-row"><span class="label">Name:</span><span class="value">${firstName} ${lastName}</span></div>
              <div class="info-row"><span class="label">Email:</span><span class="value">${email}</span></div>
              <div class="info-row"><span class="label">Phone:</span><span class="value">${phone}</span></div>
            </div>

            <div class="message-section">
              <span class="message-label">Cover Letter / Message:</span>
              <div class="message-content">${message}</div>
            </div>

            ${file ? `<div class="file-info"><span class="file-name">📎 Attached File: ${file.name}</span></div>` : ''}
          </div>

          <div class="footer">
            <p>This application was submitted through the Intellectus Capital careers portal.</p>
            <div class="timestamp">Received: ${new Date().toLocaleString('en-US', {
              weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', timeZoneName: 'short'
            })}</div>
          </div>
        </div>
      </body>
      </html>
    `

    const attachments: Mail.Attachment[] = []
    if (logoSrc.startsWith('cid:')) {
      attachments.push({ filename: 'logo.png', path: logoPath, cid: 'intellectus-logo', contentType: 'image/png' })
    }
    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer())
      attachments.push({ filename: file.name, content: buffer, contentType: file.type })
    }

    const info = await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL || process.env.SMTP_USER,
      subject: `New Internship Application from ${firstName} ${lastName}`,
      html: emailContent,
      attachments,
    })

    console.log('Email sent:', info.messageId)
    return NextResponse.json({ message: 'Application submitted successfully!' }, { status: 200 })
  } catch (error: any) {
    console.error('Error sending email:', error)
    const message = typeof error?.message === 'string' ? error.message : 'Failed to submit application. Please try again.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}


