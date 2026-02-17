"use server"

interface SMSOptions {
  to: string
  message: string
}

export async function sendSMS(options: SMSOptions) {
  try {
    const twilioSid = process.env.TWILIO_ACCOUNT_SID
    const twilioToken = process.env.TWILIO_AUTH_TOKEN
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER || "+1234567890"

    // If Twilio is not configured, log the SMS (for development)
    if (
      !twilioSid ||
      !twilioToken ||
      twilioSid === "your-twilio-sid" ||
      twilioToken === "your-twilio-token"
    ) {
      console.log("📱 SMS would be sent (Twilio not configured):")
      console.log("To:", options.to)
      console.log("Message:", options.message)
      return { success: true, message: "SMS logged (Twilio not configured)" }
    }

    // Use Twilio API to send SMS
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${twilioSid}:${twilioToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          From: twilioPhone,
          To: options.to,
          Body: options.message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to send SMS")
    }

    const data = await response.json()
    return { success: true, messageId: data.sid }
  } catch (error) {
    console.error("Error sending SMS:", error)
    return { success: false, error: "Failed to send SMS" }
  }
}

export async function sendAnnouncementSMS(
  phone: string,
  announcement: { title: string; content: string }
) {
  const message = `${announcement.title}\n\n${announcement.content.substring(0, 150)}${announcement.content.length > 150 ? "..." : ""}\n\n- University Portal`

  return sendSMS({
    to: phone,
    message,
  })
}



