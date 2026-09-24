import { Loader2Icon } from "lucide-react"

export function PageLoader() {
  return (
    <div className="flex flex-1 items-center justify-center py-20">
      <Loader2Icon className="size-6 animate-spin text-muted-foreground" />
    </div>
  )
}

type LoadErrorStateProps = {
  message: string
  onRetry: () => void
  retryLabel?: string
}

export function LoadErrorState({ message, onRetry, retryLabel = "Coba lagi" }: LoadErrorStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-2 py-20">
      <p className="text-sm text-destructive">{message}</p>
      <button onClick={onRetry} className="text-sm text-primary underline">
        {retryLabel}
      </button>
    </div>
  )
}
