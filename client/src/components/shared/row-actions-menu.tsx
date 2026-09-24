"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { EllipsisIcon, EyeIcon, PencilIcon, Trash2Icon } from "lucide-react"
import Link from "next/link"

type Props = {
  detailHref?: string
  editHref?: string
  onEdit?: () => void
  onDelete: () => void
}

export function RowActionsMenu({ detailHref, editHref, onEdit, onDelete }: Props) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-1 hover:bg-muted rounded-md transition-colors" aria-label="Aksi">
          <EllipsisIcon className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        {detailHref && (
          <DropdownMenuItem asChild className="gap-2 cursor-pointer">
            <Link href={detailHref}>
              <EyeIcon className="size-4" />
              Detail
            </Link>
          </DropdownMenuItem>
        )}
        {editHref && (
          <DropdownMenuItem asChild className="gap-2 cursor-pointer">
            <Link href={editHref}>
              <PencilIcon className="size-4" />
              Edit
            </Link>
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={onEdit} className="gap-2 cursor-pointer">
            <PencilIcon className="size-4" />
            Edit
          </DropdownMenuItem>
        )}
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
