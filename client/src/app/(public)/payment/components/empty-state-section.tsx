import { HandTapIcon } from "@icons/hand-tap"

const EmptyStateSection = () => {
  return (
    <div className="bg-foreground/10 border border-foreground rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
      <div className="bg-foreground/50 p-3 rounded-full">
        <HandTapIcon className="text-primary-foreground size-8" />
      </div>
      <h3 className="font-bold text-lg text-foreground/50">Silahkan pilih metode pembayaran</h3>
      <p className="text-xs text-foreground/50">
        Silahkan pilih opsi pembayaran <strong>Online</strong> atau <strong>Offline</strong> di atas untuk melanjutkan pesanan.
      </p>
    </div>
  )
}

export default EmptyStateSection