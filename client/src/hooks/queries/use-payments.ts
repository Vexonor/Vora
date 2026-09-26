import { queryKeys } from "@/lib/query-keys"
import { paymentService } from "@/services/payment.service"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export function usePaymentForOrder(orderId: number) {
  return useQuery({
    queryKey: queryKeys.payments.byOrder(orderId),
    queryFn: () => paymentService.findByOrderId(orderId),
    staleTime: 0,
    gcTime: 0,
  })
}

export function useVerifyCashPayment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, receivedAmount }: { orderId: number; receivedAmount: number }) =>
      paymentService.verifyCashPayment(orderId, receivedAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.orders.all, refetchType: "none" })
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all, refetchType: "none" })
      queryClient.invalidateQueries({ queryKey: queryKeys.payments.all, refetchType: "none" })
    },
  })
}
