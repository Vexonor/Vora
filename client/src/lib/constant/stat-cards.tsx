import { BellRingingIcon } from "@icons/bell-ringing";
import { ReceiptItemIcon } from "@icons/receipt-item";
import TimerIcon from "@icons/timer";
import { StatCardProps } from "../type/stat-card";

export const STATS: StatCardProps[] = [
  {
    title: "Pesanan Baru",
    value: 20,
    icon: <BellRingingIcon className="size-full" />,
    variant: "primary",
    iconBg: "bg-white",
    iconColor: "text-primary",
  },
  {
    title: "Total Pesanan",
    value: 20,
    icon: <ReceiptItemIcon className="size-full" />,
    iconBg: "bg-primary/20",
    iconColor: "text-primary",
  },
  {
    title: "Sedang Diproses",
    value: 15,
    icon: <TimerIcon className="size-full" />,
    iconBg: "bg-secondary/20",
    iconColor: "text-secondary",
  },
]