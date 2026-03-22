"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react"

type Props = {
  onDetail: () => void
  onEdit: () => void
  onDelete: () => void
}

export function StockActionDropdown({ onDetail, onEdit, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-muted rounded-md transition-colors">
          <EllipsisIcon className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={onDetail} className="gap-2 cursor-pointer">
          <EyeIcon className="size-4" />
          Detail
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
          <PencilIcon className="size-4" />
          Edit
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onDelete}
          className="gap-2 cursor-pointer text-destructive focus:text-destructive"
        >
          <Trash2Icon className="size-4" />
          Hapus
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}