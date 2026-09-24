"use client"

import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useState } from "react"
import { CartReviewSection } from "./components/cart-review-section"
import { CheckoutSummary } from "./components/checkout-summary"
import { OnlinePaymentMethodSection } from "./components/online-payment-method-section"
import { PayAtCashierNotice } from "./components/pay-at-cashier-notice"
import { PaymentBackLink } from "./components/payment-back-link"
import { PaymentTypeEmptyState } from "./components/payment-type-empty-state"
import { PaymentTypeSection, type CustomerPaymentType } from "./components/payment-type-section"

export default function CustomerPaymentPage() {
  const [paymentType, setPaymentType] = useState<CustomerPaymentType | null>(null)
  const [onlinePaymentMethod, setOnlinePaymentMethod] = useState("")
  const [customerName, setCustomerName] = useState("")

  const handlePaymentTypeChange = (selectedType: CustomerPaymentType | null) => {
    setPaymentType(selectedType)
    if (selectedType !== "online") setOnlinePaymentMethod("")
  }

  return (
    <main className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto bg-background flex flex-col gap-4 relative p-4 overflow-y-auto">
        <PaymentBackLink />
        <CartReviewSection />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="customer-name" className="text-sm font-bold text-foreground">
            Nama Pemesan <span className="font-normal text-muted-foreground">(opsional)</span>
          </label>
          <Input
            id="customer-name"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="Masukkan nama Anda"
            maxLength={100}
            className="bg-white"
          />
        </div>
        <Separator />
        <PaymentTypeSection selectedType={paymentType} onSelectedTypeChange={handlePaymentTypeChange} />
        <Separator />
        <div className="min-h-[200px]">
          {paymentType === "online" && (
            <div className="flex flex-col gap-6">
              <OnlinePaymentMethodSection
                selectedMethod={onlinePaymentMethod}
                onSelectedMethodChange={setOnlinePaymentMethod}
              />
              <CheckoutSummary
                paymentType="online"
                onlinePaymentMethod={onlinePaymentMethod}
                customerName={customerName}
              />
            </div>
          )}
          {paymentType === "offline" && (
            <div className="flex flex-col gap-6">
              <PayAtCashierNotice />
              <CheckoutSummary paymentType="offline" customerName={customerName} />
            </div>
          )}
          {paymentType === null && <PaymentTypeEmptyState />}
        </div>
      </div>
    </main>
  )
}
