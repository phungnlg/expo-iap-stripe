export interface ValidationResult { isValid: boolean; expiryDate?: string; productId?: string; error?: string; }
class ReceiptValidator {
  async validateAppleReceipt(_receiptData: string): Promise<ValidationResult> { await new Promise((r) => setTimeout(r, 500)); return { isValid: true, expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), productId: 'monthly' }; }
  async validateGoogleReceipt(_token: string, productId: string): Promise<ValidationResult> { await new Promise((r) => setTimeout(r, 500)); return { isValid: true, expiryDate: new Date(Date.now() + 30*24*60*60*1000).toISOString(), productId }; }
  async validateStripePayment(id: string): Promise<ValidationResult> { await new Promise((r) => setTimeout(r, 300)); return { isValid: true, productId: id }; }
}
export const receiptValidator = new ReceiptValidator();
