"use server"

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const resendApiKey = process.env.RESEND_API_KEY
    const emailFrom = process.env.EMAIL_FROM || "noreply@university.edu"

    // If Resend is not configured, log the email (for development)
    if (!resendApiKey || resendApiKey === "your-resend-api-key") {
      console.log("📧 Email would be sent (Resend not configured):")
      console.log("To:", options.to)
      console.log("Subject:", options.subject)
      console.log("Body:", options.text || options.html)
      return { success: true, message: "Email logged (Resend not configured)" }
    }

    // Use Resend API to send email
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: emailFrom,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text || options.html.replace(/<[^>]*>/g, ""),
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send email")
    }

    const data = await response.json()
    return { success: true, messageId: data.id }
  } catch (error) {
    console.error("Error sending email:", error)
    return { success: false, error: "Failed to send email" }
  }
}

export async function sendAnnouncementEmail(
  email: string,
  announcement: { title: string; content: string; type: string }
) {
  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${announcement.title}</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h1 style="color: #1a1a1a; margin-top: 0;">University Portal</h1>
        </div>
        <div style="background-color: #fff; padding: 20px; border-radius: 8px; border: 1px solid #e0e0e0;">
          <h2 style="color: #1a1a1a; margin-top: 0;">${announcement.title}</h2>
          <div style="margin: 20px 0;">
            ${announcement.content.replace(/\n/g, "<br>")}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 30px;">
            This is an automated message from the University Portal.
          </p>
        </div>
      </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `[${announcement.type}] ${announcement.title}`,
    html,
    text: announcement.content,
  })
}



