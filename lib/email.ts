async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Bokra Stay <noreply@bokrastay.com>";
  const isMock = !apiKey || apiKey.startsWith("re_stub");

  if (isMock) {
    // Extract all hrefs so dev can click links directly from the terminal
    const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]);
    console.log("\n📧 ========== MOCK EMAIL ==========");
    console.log("   To      :", to);
    console.log("   Subject :", subject);
    if (hrefs.length > 0) {
      console.log("   Links   :");
      hrefs.forEach((url) => console.log("            →", url));
    }
    console.log("===================================\n");
    return true;
  }

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return false;
    }
    return true;
  } catch (error) {
    console.error("Email service error:", error);
    return false;
  }
}

export { sendEmail };

function emailTemplate(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Bokra Stay</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f5f3ef;
      color: #1a1208;
      padding: 40px 20px;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
    }
    .header {
      background: linear-gradient(135deg, #1a1208 0%, #2d2010 100%);
      padding: 32px 40px;
      text-align: center;
    }
    .logo {
      font-size: 28px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.5px;
    }
    .logo span {
      color: #c9a84c;
    }
    .tagline {
      color: #9b8070;
      font-size: 13px;
      margin-top: 4px;
    }
    .body {
      padding: 40px;
    }
    .greeting {
      font-size: 22px;
      font-weight: 700;
      color: #1a1208;
      margin-bottom: 12px;
    }
    .text {
      font-size: 15px;
      color: #6b5e4e;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .detail-card {
      background: #faf9f7;
      border: 1px solid rgba(0,0,0,0.08);
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    .detail-card-title {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #9b8e7e;
      margin-bottom: 16px;
    }
    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 10px 0;
      border-bottom: 1px solid rgba(0,0,0,0.06);
      font-size: 14px;
    }
    .detail-row:last-child {
      border-bottom: none;
    }
    .detail-label {
      color: #9b8e7e;
      font-weight: 500;
    }
    .detail-value {
      color: #1a1208;
      font-weight: 600;
      text-align: right;
      max-width: 60%;
    }
    .highlight-value {
      color: #b8943d;
      font-size: 20px;
      font-weight: 800;
    }
    .btn {
      display: inline-block;
      background: #b8943d;
      color: #ffffff !important;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 10px;
      font-weight: 700;
      font-size: 15px;
      text-align: center;
      margin: 24px 0;
    }
    .btn-container {
      text-align: center;
    }
    .divider {
      height: 1px;
      background: rgba(0,0,0,0.06);
      margin: 24px 0;
    }
    .info-box {
      background: rgba(184,148,61,0.06);
      border: 1px solid rgba(184,148,61,0.2);
      border-radius: 10px;
      padding: 16px 20px;
      margin: 20px 0;
      font-size: 14px;
      color: #6b5e4e;
      line-height: 1.5;
    }
    .warning-box {
      background: rgba(239,68,68,0.04);
      border: 1px solid rgba(239,68,68,0.15);
      border-radius: 10px;
      padding: 16px 20px;
      margin: 20px 0;
      font-size: 14px;
      color: #6b5e4e;
      line-height: 1.5;
    }
    .footer {
      background: #faf9f7;
      border-top: 1px solid rgba(0,0,0,0.06);
      padding: 24px 40px;
      text-align: center;
    }
    .footer-text {
      font-size: 12px;
      color: #9b8e7e;
      line-height: 1.6;
    }
    .footer-link {
      color: #b8943d;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">Bokra<span>Stay</span></div>
      <div class="tagline">Ethiopia's Verified Home Rental Platform</div>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p class="footer-text">
        This email was sent by Bokra Stay.<br>
        Wachemo University, Hossana, Ethiopia.<br>
        <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}" class="footer-link">
          Visit Bokra Stay
        </a>
      </p>
    </div>
  </div>
</body>
</html>
  `;
}

export async function sendPasswordResetEmail({
  email,
  name,
  resetUrl,
}: {
  email: string;
  name: string;
  resetUrl: string;
}): Promise<boolean> {
  const content = `
    <p class="greeting">Reset your password</p>
    <p class="text">
      Hi ${name || "there"}, we got a request to reset your Bokra Stay password. Click the button below to choose a new one.
    </p>
    <div class="btn-container">
      <a href="${resetUrl}" class="btn">
        Reset My Password
      </a>
    </div>
    <p class="text" style="font-size:13px; color:#9b8e7e;">
      This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.
    </p>
    <div class="warning-box">
      ⚠️ Never share this link with anyone. Bokra Stay staff will never ask for your password.
    </div>
  `;

  return sendEmail({
    to: email,
    subject: "Reset your Bokra Stay password",
    html: emailTemplate(content),
  });
}

export async function sendBookingConfirmationEmail({
  email,
  name,
  propertyTitle,
  propertyAddress,
  propertyCity,
  hostName,
  hostEmail,
  hostPhone,
  checkIn,
  checkOut,
  totalPrice,
  bookingId,
  chapaReference,
}: {
  email: string;
  name: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyCity: string;
  hostName: string;
  hostEmail: string;
  hostPhone?: string | null;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
  chapaReference?: string | null;
}): Promise<boolean> {
  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const diffTime = Math.max(checkOutDate.getTime() - checkInDate.getTime(), 1000 * 60 * 60 * 24);
  const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const pricePerNight = Math.round(totalPrice / nights);
  const shortBookingId = bookingId.slice(0, 8).toUpperCase();

  const content = `
    <p class="greeting">Your booking is confirmed! 🎉</p>
    <p class="text">
      Great news ${name || "there"}! Your stay at <strong>${propertyTitle}</strong> is confirmed and your payment has been received.
    </p>
    <div class="detail-card">
      <div class="detail-card-title">📋 Booking Details</div>
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">#${shortBookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Property</span>
        <span class="detail-value">${propertyTitle}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Address</span>
        <span class="detail-value">
          ${propertyAddress}, ${propertyCity}
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-in</span>
        <span class="detail-value">${checkIn}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-out</span>
        <span class="detail-value">${checkOut}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Duration</span>
        <span class="detail-value">
          ${nights} night${nights > 1 ? "s" : ""}
        </span>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title">💰 Payment Summary</div>
      <div class="detail-row">
        <span class="detail-label">
          ${pricePerNight.toLocaleString()} ETB × ${nights} nights
        </span>
        <span class="detail-value">
          ${totalPrice.toLocaleString()} ETB
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Payment Status</span>
        <span class="detail-value" style="color:#22c55e;">
          ✓ Paid
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Total Charged</span>
        <span class="detail-value">
          <span class="highlight-value">
            ${totalPrice.toLocaleString()} ETB
          </span>
        </span>
      </div>
      ${
        chapaReference
          ? `
      <div class="detail-row">
        <span class="detail-label">Payment Reference</span>
        <span class="detail-value" style="font-family:monospace;font-size:12px;">
          ${chapaReference}
        </span>
      </div>`
          : ""
      }
    </div>

    <div class="detail-card">
      <div class="detail-card-title">🏠 Your Host</div>
      <div class="detail-row">
        <span class="detail-label">Host Name</span>
        <span class="detail-value">${hostName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Host Email</span>
        <span class="detail-value">${hostEmail}</span>
      </div>
      ${
        hostPhone
          ? `
      <div class="detail-row">
        <span class="detail-label">Host Phone</span>
        <span class="detail-value">${hostPhone}</span>
      </div>`
          : ""
      }
    </div>

    <div class="info-box">
      <strong>📌 What happens next?</strong><br><br>
      • Your host has been notified of your booking<br>
      • Contact your host before arrival to arrange check-in details<br>
      • Save this email as your booking confirmation<br>
      • Check-in time is typically after 12:00 PM unless agreed otherwise with your host
    </div>

    <div class="warning-box">
      <strong>❌ Cancellation Policy</strong><br><br>
      Free cancellation up to 48 hours before check-in. Cancellations within 48 hours of check-in are non-refundable. To cancel, go to My Bookings on the Bokra Stay platform.
    </div>

    <div class="btn-container">
      <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/renter/bookings" class="btn">
        View My Bookings
      </a>
    </div>

    <p class="text" style="font-size:13px; color:#9b8e7e; text-align:center; margin-top:16px;">
      Need help? Contact us at support@bokrastay.com
    </p>
  `;

  return sendEmail({
    to: email,
    subject: `Booking Confirmed — ${propertyTitle} | Bokra Stay`,
    html: emailTemplate(content),
  });
}

export async function sendHostBookingNotificationEmail({
  hostEmail,
  hostName,
  renterName,
  propertyTitle,
  checkIn,
  checkOut,
  totalPrice,
  bookingId,
}: {
  hostEmail: string;
  hostName: string;
  renterName: string;
  propertyTitle: string;
  checkIn: string;
  checkOut: string;
  totalPrice: number;
  bookingId: string;
}): Promise<boolean> {
  const shortBookingId = bookingId.slice(0, 8).toUpperCase();
  const platformFee = Math.round(totalPrice * 0.03);
  const hostEarnings = totalPrice - platformFee;

  const content = `
    <p class="greeting">You have a new booking! 🏠</p>
    <p class="text">
      Hi ${hostName}, great news! <strong>${renterName}</strong> has just booked your property <strong>${propertyTitle}</strong>.
    </p>
    <div class="detail-card">
      <div class="detail-card-title">📋 Booking Details</div>
      <div class="detail-row">
        <span class="detail-label">Booking ID</span>
        <span class="detail-value">#${shortBookingId}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Guest Name</span>
        <span class="detail-value">${renterName}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-in</span>
        <span class="detail-value">${checkIn}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Check-out</span>
        <span class="detail-value">${checkOut}</span>
      </div>
    </div>

    <div class="detail-card">
      <div class="detail-card-title">💰 Your Earnings</div>
      <div class="detail-row">
        <span class="detail-label">Booking Amount</span>
        <span class="detail-value">
          ${totalPrice.toLocaleString()} ETB
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Platform Fee (3%)</span>
        <span class="detail-value" style="color:#ef4444;">
          - ${platformFee.toLocaleString()} ETB
        </span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Your Earnings</span>
        <span class="detail-value">
          <span class="highlight-value">
            ${hostEarnings.toLocaleString()} ETB
          </span>
        </span>
      </div>
    </div>

    <div class="info-box">
      <strong>✅ What to do next:</strong><br><br>
      • Your guest will contact you before arrival<br>
      • Make sure the property is ready for check-in<br>
      • Your earnings will be available to withdraw after the stay is completed
    </div>

    <div class="btn-container">
      <a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/host/bookings" class="btn">
        View Booking Details
      </a>
    </div>
  `;

  return sendEmail({
    to: hostEmail,
    subject: `New Booking — ${propertyTitle} | Bokra Stay`,
    html: emailTemplate(content),
  });
}

export async function sendBookingCancellationEmail({
  email,
  name,
  propertyTitle,
}: {
  email: string;
  name: string;
  propertyTitle: string;
}): Promise<boolean> {
  const content = `
    <p class="greeting">Booking Cancelled</p>
    <p class="text">Dear ${name || "Guest"},</p>
    <p class="text">Your booking for <strong>${propertyTitle}</strong> has been cancelled.</p>
    <p class="text">If this was an error, please reach out to support or book again on our platform.</p>
  `;
  return sendEmail({
    to: email,
    subject: `Booking Cancelled: ${propertyTitle}`,
    html: emailTemplate(content),
  });
}

export async function sendVerificationStatusEmail({
  email,
  name,
  isVerified,
}: {
  email: string;
  name: string;
  isVerified: boolean;
}): Promise<boolean> {
  const subject = isVerified
    ? "Bokra Stay: Your Host Account is Verified!"
    : "Bokra Stay: Document Verification Status Update";
  const content = `
    <p class="greeting">${isVerified ? "Account Verified 🎉" : "Verification Update"}</p>
    <p class="text">Dear ${name || "Host"},</p>
    <p class="text">
      ${
        isVerified
          ? "Congratulations! Your host account has been successfully verified. You can now publish properties and receive bookings on Bokra Stay."
          : "Your document submission status has been updated. Please log in to your Host Console dashboard to review the feedback and submit any missing information."
      }
    </p>
  `;
  return sendEmail({
    to: email,
    subject,
    html: emailTemplate(content),
  });
}
