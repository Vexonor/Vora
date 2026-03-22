import { CashRegisterIcon } from "@icons/cash-register"


const PayAtCashierSection = () => {
  return (
    <div className="bg-primary/10 border border-primary rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
      <div className="bg-primary p-3 rounded-full">
        <CashRegisterIcon className="text-primary-foreground size-8" />
      </div>
      <h3 className="font-bold text-lg text-primary">Bayar di Kasir</h3>
      <p className="text-xs text-primary">
        Silahkan menuju kasir untuk melakukan pembayaran dan tunjukkan kode pesanan Anda.
      </p>
    </div>
  )
}

export default PayAtCashierSection