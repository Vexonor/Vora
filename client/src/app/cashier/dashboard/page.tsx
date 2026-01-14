import { Separator } from "@/components/ui/separator"
import { BellRingingIcon } from "@icons/bell-ringing"
import { ReceiptItemIcon } from "@icons/receipt-item"
import TimerIcon from "@icons/timer"
import Image from "next/image"

const Dashboard = () => {
  return (
    <div className="grid grid-cols-3 grid-rows-4 gap-6">
      {/* Highlight Card */}
      <div className="col-span-2 grid auto-rows-min gap-6 md:grid-cols-3">
        <div className="bg-primary flex flex-col flex-wrap aspect-video rounded-xl p-4">
          {/* Header */}
          <div className="flex justify-between">
            <span className="text-white text-base 2xl:text-xl font-semibold">Pesanan Baru</span>
            <div className="size-10 2xl:size-16 bg-white rounded-lg flex justify-center items-center p-2 2xl:p-4">
              <BellRingingIcon className="size-full text-primary" />
            </div>
          </div>
          {/* Total */}
          <span className="grow flex items-end text-white text-3xl 2xl:text-5xl font-semibold">20</span>
        </div>
        <div className="bg-white border border-foreground/40 aspect-video rounded-xl p-4">
          {/* Header */}
          <div className="flex justify-between">
            <span className="text-foreground text-base 2xl:text-xl font-semibold">Total Pesanan</span>
            <div className="size-10 2xl:size-16 bg-primary/20 rounded-lg flex justify-center items-center p-2 2xl:p-4">
              <ReceiptItemIcon className="size-full text-primary" />
            </div>
          </div>
          {/* Total */}
          <span className="grow flex items-end text-foreground text-3xl 2xl:text-5xl font-semibold">20</span>
        </div>
        <div className="bg-white border border-foreground/40 aspect-video rounded-xl p-4">
          {/* Header */}
          <div className="flex justify-between">
            <span className="text-foreground text-base 2xl:text-xl font-semibold">Sedang Diproses</span>
            <div className="size-10 2xl:size-16 bg-secondary/20 rounded-lg flex justify-center items-center p-2 2xl:p-4">
              <TimerIcon className="size-full text-secondary" />
            </div>
          </div>
          {/* Total */}
          <span className="grow flex items-end text-foreground text-3xl 2xl:text-5xl font-semibold">15</span>
        </div>
      </div>

      {/* Top Menu */}
      <div className="col-span-1 row-span-4 bg-white border border-foreground/40 flex-1 rounded-xl p-4">
        <h3 className="text-foreground text-xl font-bold">Menu Populer</h3>

        <div className="flex flex-col gap-4 mt-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="shrink-0">
              <Image
                src="/image/menu/nasi-goreng.jpg"
                alt="Nasi Goreng"
                width={100}
                height={100}
                className="size-16 object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-sm truncate">Nasi Goreng</h4>
              <span className="text-xs text-muted-foreground">
                Total Pesanan: 50
              </span>
            </div>
          </div>
          <Separator />
        </div>
      </div>

      {/* Order & Payment Highlight */}
      <div className="col-span-2 row-span-3 grid grid-cols-2 gap-6 flex-1 rounded-xl">
        <div className="bg-white border border-foreground/40 rounded-lg p-4">
          <h4 className="font-bold text-xl">Pesanan</h4>
        </div>
        <div className="bg-white border border-foreground/40 rounded-lg p-4">
          <h4 className="font-bold text-xl">Pembayaran</h4>
        </div>
      </div>
    </div>
  )
}

export default Dashboard