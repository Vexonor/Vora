import { Button } from "@/components/ui/button"
import ChevronRightIcon from "@icons/chevron-right"
import { ReceiptIcon } from "@icons/receipt"
import Link from "next/link"

const PaymentStatus = () => {
  return (
    <div className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto flex flex-col justify-center items-center gap-4 bg-background p-4">
        {/* Icon */}
        <div className="size-24 bg-primary/10 flex justify-center items-center border-2 border-success rounded-full p-4">
          <ReceiptIcon className="size-16 text-success" />
        </div>
        {/* Text */}
        <div className="flex flex-col justify-center items-center gap-1 px-2">
          <span className="text-lg font-bold">Transaksi Berhasil</span>
          <p className="text-center text-sm font-medium">Pembayaran telah berhasil diselesaikan. Struk siap dicetak untuk pelanggan.</p>
        </div>
        {/* Button */}
        <Link href="/customer/payment/invoice" className="w-full flex flex-col items center gap-1">
          <Button className="w-full bg-secondary text-primary font-semibold py-2 rounded-lg">
            <span>Lanjut</span>
            <ChevronRightIcon className="size-5" />
          </Button>
          <span className="text-center text-xs text-foreground/50">Otomatis lanjut dalam 20 detik</span>
        </Link>
      </div>
    </div>
  )
}

export default PaymentStatus