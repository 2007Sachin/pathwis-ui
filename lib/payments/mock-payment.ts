import type { PaymentHandler } from "../../types";

export const handleMockPayment: PaymentHandler = async ({ plan }) => {
  await new Promise((resolve) => setTimeout(resolve, 650));

  return {
    success: true,
    paymentId: `mock_${plan}_payment`,
  };
};
