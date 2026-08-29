export type SubscriptionPlan = "monthly" | "annual";

export interface PaymentRequest {
  plan: SubscriptionPlan;
  amountInPaise: number;
  career: string;
}

export interface PaymentResult {
  success: boolean;
  paymentId: string;
}

export type PaymentHandler = (request: PaymentRequest) => Promise<PaymentResult>;
