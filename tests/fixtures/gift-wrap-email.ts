export const emails: any[] = [];
class SES {
  sendEmail(input: unknown) {
    return { promise: async () => { emails.push(input); return {}; } };
  }
}
export default { SES };
