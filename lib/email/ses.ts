import AWS from "aws-sdk";

const FROM_EMAIL = "no-reply@hausofprivae.com";
const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL_ID ??
  process.env.ADMIN_EMAIL ??
  "hausofprivae@gmail.com";

type OrderEmailItem = {
  name: string;
  quantity: number;
  size?: string | null;
  color?: string | null;
  variant?: string | null;
  unitPrice: number;
};

type OrderEmailInput = {
  orderId: string;
  user: {
    name?: string;
    email: string;
    number?: string;
  };
  address: {
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
    pincode?: string;
  };
  items: OrderEmailItem[];
  subtotalAmount: number;
  deliveryCharge: number;
  discountAmount: number;
  totalAmountPaid: number;
  couponCode?: string | null;
};

type FormEmailInput = {
  type: string;
  title: string;
  fields: Record<string, string | number | null | undefined>;
  userEmail?: string | null;
  userSubject?: string;
  adminSubject?: string;
};

type BasicEmailContent = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

function sesClient() {
  return new AWS.SES({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_S3_SECRET_KEY,
    region: process.env.NEXT_PUBLIC_S3_REGION,
  });
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function htmlFieldRows(fields: FormEmailInput["fields"]) {
  return Object.entries(fields)
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 14px;border-bottom:1px solid #f2ece0;font-weight:bold;font-size:13px;width:35%;color:#5f5550;background-color:#fbf8f1;">${escapeHtml(label)}</td>
          <td style="padding:10px 14px;border-bottom:1px solid #f2ece0;font-size:13px;color:#241719;">${escapeHtml(String(value ?? "-"))}</td>
        </tr>`
    )
    .join("");
}

function textFields(fields: FormEmailInput["fields"]) {
  return Object.entries(fields)
    .map(([label, value]) => `${label}: ${value ?? "-"}`)
    .join("\n");
}

function orderLines(items: OrderEmailItem[]) {
  return items
    .map(
      (item) =>
        `${item.name} x ${item.quantity} (${item.size || "-"}, ${item.variant || "stitched"}) - Rs. ${
          item.unitPrice * item.quantity
        }`
    )
    .join("\n");
}

function htmlOrderSummary(input: OrderEmailInput, title: string) {
  const itemRows = input.items
    .map(
      (item) => `
        <tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.name}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.size || "-"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;">${item.variant || "stitched"}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">Rs. ${item.unitPrice * item.quantity}</td>
        </tr>`
    )
    .join("");

  return `
    <div style="font-family:Arial,sans-serif;color:#241719;line-height:1.6;">
      <h2>${title}</h2>
      <p><strong>Order ID:</strong> ${input.orderId}</p>
      <p><strong>Customer:</strong> ${input.user.name || "-"} (${input.user.email})</p>
      <p><strong>Phone:</strong> ${input.user.number || "-"}</p>
      <p><strong>Ship To:</strong> ${[
        input.address.addressLine1,
        input.address.addressLine2,
        input.address.city,
        input.address.state,
        input.address.pincode,
      ]
        .filter(Boolean)
        .join(", ")}</p>
      <table style="border-collapse:collapse;width:100%;margin-top:16px;">
        <thead>
          <tr>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Item</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Qty</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Size</th>
            <th style="text-align:left;padding:8px;border-bottom:1px solid #ddd;">Variant</th>
            <th style="text-align:right;padding:8px;border-bottom:1px solid #ddd;">Amount</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
      </table>
      <p><strong>Subtotal:</strong> Rs. ${input.subtotalAmount}</p>
      <p><strong>Delivery:</strong> Rs. ${input.deliveryCharge}</p>
      <p><strong>Discount:</strong> Rs. ${input.discountAmount}${input.couponCode ? ` (${input.couponCode})` : ""}</p>
      <h3>Total: Rs. ${input.totalAmountPaid}</h3>
    </div>
  `;
}

function textOrderSummary(input: OrderEmailInput, title: string) {
  return `${title}

Order ID: ${input.orderId}
Customer: ${input.user.name || "-"} (${input.user.email})
Phone: ${input.user.number || "-"}
Ship To: ${[
    input.address.addressLine1,
    input.address.addressLine2,
    input.address.city,
    input.address.state,
    input.address.pincode,
  ]
    .filter(Boolean)
    .join(", ")}

Items:
${orderLines(input.items)}

Subtotal: Rs. ${input.subtotalAmount}
Delivery: Rs. ${input.deliveryCharge}
Discount: Rs. ${input.discountAmount}${input.couponCode ? ` (${input.couponCode})` : ""}
Total: Rs. ${input.totalAmountPaid}`;
}

async function sendOrderEmail(to: string, subject: string, title: string, input: OrderEmailInput) {
  await sesClient()
    .sendEmail({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [to] },
      Message: {
        Subject: { Data: subject },
        Body: {
          Text: { Data: textOrderSummary(input, title) },
          Html: { Data: htmlOrderSummary(input, title) },
        },
      },
    })
    .promise();
}

async function sendBasicEmail(input: BasicEmailContent) {
  await sesClient()
    .sendEmail({
      Source: FROM_EMAIL,
      Destination: { ToAddresses: [input.to] },
      Message: {
        Subject: { Data: input.subject },
        Body: {
          Text: { Data: input.text },
          Html: { Data: input.html },
        },
      },
    })
    .promise();
}

export async function sendOrderNotificationEmails(input: OrderEmailInput) {
  if (!process.env.NEXT_PUBLIC_S3_ACCESS_KEY || !process.env.NEXT_S3_SECRET_KEY) {
    console.warn("SES credentials are missing. Skipping order email.");
    return;
  }

  await Promise.all([
    sendOrderEmail(
      input.user.email,
      `Haus of Privae order received - ${input.orderId}`,
      "Your order has been received",
      input
    ),
    sendOrderEmail(
      ADMIN_EMAIL,
      `New order received - ${input.orderId}`,
      "New order received",
      input
    ),
  ]);
}

export async function sendFormNotificationEmails(input: FormEmailInput) {
  if (!process.env.NEXT_PUBLIC_S3_ACCESS_KEY || !process.env.NEXT_S3_SECRET_KEY) {
    console.warn("SES credentials are missing. Skipping form email.");
    return;
  }

  const adminHtml = `
    <div style="margin:0;padding:0;background-color:#f7f2ea;font-family:Arial,sans-serif;color:#241719;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background-color:#8b6f3d;color:#fff;padding:24px 28px;text-align:center;">
          <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#fff;">Atelier Notification</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:24px;font-weight:400;line-height:1.2;">New Form Submission</h1>
        </div>

        <div style="background-color:#fff;padding:32px 28px;border:1px solid #eadfce;border-top:0;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">A new <strong>${escapeHtml(input.type)}</strong> request has been submitted. See the details below:</p>

          <table style="border-collapse:collapse;width:100%;margin-top:16px;border:1px solid #f2ece0;">
            <tbody>
              ${htmlFieldRows(input.fields)}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;

  const userHtml = `
    <div style="margin:0;padding:0;background-color:#f7f2ea;font-family:Arial,sans-serif;color:#241719;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background-color:#282121;color:#fff;padding:28px 28px 22px;text-align:center;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c7a968;">Haus of Privae</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px;font-weight:400;line-height:1.2;">${escapeHtml(input.title)}</h1>
        </div>

        <div style="background-color:#fff;padding:32px 28px;border:1px solid #eadfce;border-top:0;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">
            ${
              input.type === "newsletter"
                ? "Thank you for subscribing to our newsletter! You have been successfully added to our list and will receive our updates and seasonal edits."
                : `Thank you for submitting your ${escapeHtml(input.type)} request. We have received your details and our team will get back to you shortly.`
            }
          </p>

          <p style="margin:24px 0 8px;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:#8b6f3d;font-weight:bold;">Submission Details</p>
          <table style="border-collapse:collapse;width:100%;margin-top:8px;border:1px solid #f2ece0;">
            <tbody>
              ${htmlFieldRows(input.fields)}
            </tbody>
          </table>

          <div style="text-align:center;margin:32px 0 16px;">
            <a href="https://www.hausofprivae.com/product" style="display:inline-block;background-color:#282121;color:#fff;text-decoration:none;padding:13px 24px;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;">Explore Collection</a>
          </div>

          <p style="margin:32px 0 0;font-size:12px;line-height:1.6;color:#6d625e;border-top:1px solid #eadfce;padding-top:16px;text-align:center;">
            Haus of Privae | Conscious Luxury
          </p>
        </div>
      </div>
    </div>
  `;

  const text = `${input.title}\n\nForm: ${input.type}\n${textFields(input.fields)}`;

  const sendEmail = (to: string, subject: string, htmlContent: string) =>
    sesClient()
      .sendEmail({
        Source: FROM_EMAIL,
        Destination: { ToAddresses: [to] },
        Message: {
          Subject: { Data: subject },
          Body: {
            Text: { Data: text },
            Html: { Data: htmlContent },
          },
        },
      })
      .promise();

  const deliveries = [
    sendEmail(
      ADMIN_EMAIL,
      input.adminSubject || `New ${input.type} submission - Haus of Privae`,
      adminHtml
    ),
  ];

  if (input.userEmail) {
    deliveries.push(
      sendEmail(
        input.userEmail,
        input.userSubject || `We received your ${input.type} request`,
        userHtml
      )
    );
  }

  await Promise.all(deliveries);
}

export async function sendNewsletterWelcomeEmail(email: string) {
  if (!process.env.NEXT_PUBLIC_S3_ACCESS_KEY || !process.env.NEXT_S3_SECRET_KEY) {
    console.warn("SES credentials are missing. Skipping newsletter welcome email.");
    return;
  }

  const safeEmail = escapeHtml(email);
  const subject = "Welcome to The Privae Edit";
  const text = `Welcome to The Privae Edit

You are now on the Haus of Privae list.

Expect atelier stories, early access to new edits, and private notes from the Haus.

Explore the collection: https://www.hausofprivae.com/product

Haus of Privae`;

  const html = `
    <div style="margin:0;padding:0;background:#f7f2ea;font-family:Arial,sans-serif;color:#241719;">
      <div style="max-width:640px;margin:0 auto;padding:32px 16px;">
        <div style="background:#282121;color:#fff;padding:28px 28px 22px;text-align:center;">
          <p style="margin:0 0 10px;font-size:10px;letter-spacing:4px;text-transform:uppercase;color:#c7a968;">The Privae Edit</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:30px;font-weight:400;line-height:1.2;">Welcome to the Haus</h1>
        </div>

        <div style="background:#fff;padding:32px 28px;border:1px solid #eadfce;border-top:0;">
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">Thank you for joining Haus of Privae.</p>
          <p style="margin:0 0 18px;font-size:15px;line-height:1.7;">You will receive atelier stories, early access to new edits, and private notes from the Haus. Thoughtful, occasional, never noisy.</p>

          <div style="text-align:center;margin:32px 0 16px;">
            <a href="https://www.hausofprivae.com/product" style="display:inline-block;background:#282121;color:#fff;text-decoration:none;padding:13px 24px;font-size:11px;letter-spacing:2.4px;text-transform:uppercase;">Explore Collection</a>
          </div>

          <p style="margin:24px 0 0;font-size:12px;line-height:1.6;color:#6d625e;">This email was sent to ${safeEmail} because you subscribed on hausofprivae.com.</p>
        </div>
      </div>
    </div>
  `;

  await sendBasicEmail({
    to: email,
    subject,
    text,
    html,
  });
}
