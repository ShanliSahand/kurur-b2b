export async function sendOtpSms(phone: string, code: string) {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const sender = process.env.SMS_SENDER_NUMBER || "2000660110";
    
    // If we are in development and don't have a real key, just log it
    if (!apiKey || apiKey === "6B414562516A5530533742453162544A666A373162757973755A543843334A444B47466E5163376D542B453D") {
      console.log(`\n🧪 [DEV MODE] SMS to ${phone}: Your code is ${code}\n`);
      return { success: true };
    }

    // Standard Send API (Works on basic accounts)
    const message = `کد تایید کرور: ${code}`;
    const url = `https://api.kavenegar.com/v1/${apiKey}/sms/send.json?receptor=${phone}&sender=${sender}&message=${encodeURIComponent(message)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.return.status === 200) {
      console.log("SMS sent successfully:", data.entries);
      return { success: true };
    } else {
      console.error("Kavenegar API Error:", data.return);
      return { success: false, error: `خطا در ارسال پیامک: ${data.return.message}` };
    }
  } catch (error) {
    console.error("Error sending SMS:", error);
    return { success: false, error: "خطای شبکه در ارسال پیامک" };
  }
}