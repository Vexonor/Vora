import { queryKeys } from "@/lib/query-keys"
import { paymentService } from "@/services/payment.service"
import { useMutation, useQuery } from "@tanstack/react-query"

export function usePaymentForOrder(orderId: number) {
  return useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.findByOrderId(orderId),
  })
}

export function useVerifyCashPayment() {
  return useMutation({
    mutationFn: ({ orderId, receivedAmount }: { orderId: number; receivedAmount: number }) =>
      paymentService.verifyCashPayment(orderId, receivedAmount),
  })
}
