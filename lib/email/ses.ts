import AWS from "aws-sdk";

const FROM_EMAIL = "hop@ashishbishnoi.com";
const ADMIN_EMAIL = "hausofprivae@gmail.com";

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

function sesClient() {
  return new AWS.SES({
    accessKeyId: process.env.NEXT_PUBLIC_S3_ACCESS_KEY,
    secretAccessKey: process.env.NEXT_S3_SECRET_KEY,
    region: process.env.NEXT_PUBLIC_S3_REGION,
  });
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
