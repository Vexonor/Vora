"use client"

import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import EmptyStateSection from "./components/empty-state-section"
import Header from "./components/header"
import PayAtCashierSection from "./components/pay-at-cashier-section"
import BottomSheet from "./components/price-section"
import OrderSection from "./order-section"
import PaymentMethodSection from "./payment-method-section"
import PaymentTypeSection from "./payment-type-section"

const Payment = () => {
  const [paymentType, setPaymentType] = useState<string>("")
  const [paymentMethod, setPaymentMethod] = useState<string>("")

  return (
    <main className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto bg-background flex flex-col gap-4 relative p-4 overflow-y-auto">
        <Header />
        <OrderSection />
        <Separator />
        <PaymentTypeSection
          value={paymentType}
          onValueChange={(val) => {
            setPaymentType(val)
            if (val !== "online") setPaymentMethod("")
          }}
        />
        <Separator />
        <div className="min-h-[200px]">
          {paymentType === "online"
            ? <div className="flex flex-col gap-6">
              <PaymentMethodSection value={paymentMethod} onValueChange={setPaymentMethod} />
              <BottomSheet paymentType="online" paymentMethod={paymentMethod} />
            </div>
            : paymentType === "offline"
              ? <div className="flex flex-col gap-6">
                <PayAtCashierSection />
                <BottomSheet paymentType="offline" />
              </div>
              : <EmptyStateSection />
          }
        </div>
      </div>
    </main>
  )
}

export default Payment