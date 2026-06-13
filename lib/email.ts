import { Resend } from "resend";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// Default sender for sandboxed / development accounts
const DEFAULT_SENDER = "Bokra Stay <onboarding@resend.dev>";

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  if (resend) {
    try {
      const data = await resend.emails.send({
        from: DEFAULT_SENDER,
        to: [to],
        subject,
        html,
      });
      console.log(`[Email Sent via Resend] ID: ${data.data?.id}`);
      return data;
    } catch (error) {
      console.error("[Email Error] Failed to send email via Resend:", error);
    }
  } else {
    console.log("=========================================");
    console.log("[MOCK EMAIL SENT]");
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`HTML Body:\n${html}`);
    console.log("=========================================");
  }
  return { data: { id: "mock-email-id" } };
}

export async function sendBookingConfirmationEmail({
  email,
  name,
  propertyTitle,
  checkIn,
  checkOut,
  totalPrice,
}: {
  email: string;
  name: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
}) {
  const subject = `Booking Confirmed: ${propertyTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
      <h2 style="color: #0d9488; margin-bottom: 20px;">Booking Confirmed!</h2>
      <p>Dear ${name || "Guest"},</p>
      <p>Your booking for <strong>${propertyTitle}</strong> is successfully confirmed and paid.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <h3 style="color: #374151;">Stay Details:</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; color: #4b5563;"><strong>Check-in:</strong></td>
          <td style="padding: 6px 0; text-align: right;">${checkIn}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;"><strong>Check-out:</strong></td>
          <td style="padding: 6px 0; text-align: right;">${checkOut}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; color: #4b5563;"><strong>Total Paid:</strong></td>
          <td style="padding: 6px 0; text-align: right; font-weight: bold; color: #0d9488;">${totalPrice.toLocaleString()} ETB</td>
        </tr>
      </table>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 14px; color: #6b7280; text-align: center;">Thank you for choosing Bokra Stay!</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendBookingCancellationEmail({
  email,
  name,
  propertyTitle,
}: {
  email: string;
  name: string;
  propertyTitle: string;
}) {
  const subject = `Booking Cancelled: ${propertyTitle}`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
      <h2 style="color: #ef4444; margin-bottom: 20px;">Booking Cancelled</h2>
      <p>Dear ${name || "Guest"},</p>
      <p>Your booking for <strong>${propertyTitle}</strong> has been cancelled.</p>
      <p>If this was an error, please reach out to support or book again on our platform.</p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 14px; color: #6b7280; text-align: center;">Bokra Stay Team</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}

export async function sendVerificationStatusEmail({
  email,
  name,
  isVerified,
}: {
  email: string;
  name: string;
  isVerified: boolean;
}) {
  const subject = isVerified
    ? "Bokra Stay: Your Host Account is Verified!"
    : "Bokra Stay: Document Verification Status Update";
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; rounded: 12px;">
      <h2 style="color: ${isVerified ? "#0d9488" : "#ef4444"}; margin-bottom: 20px;">
        ${isVerified ? "Account Verified" : "Verification Update"}
      </h2>
      <p>Dear ${name || "Host"},</p>
      <p>
        ${
          isVerified
            ? "Congratulations! Your host account has been successfully verified. You can now publish properties and receive bookings on Bokra Stay."
            : "Your document submission status has been updated. Please log in to your Host Console dashboard to review the feedback and submit any missing information."
        }
      </p>
      <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
      <p style="font-size: 14px; color: #6b7280; text-align: center;">Bokra Stay Host Support</p>
    </div>
  `;
  return sendEmail({ to: email, subject, html });
}
