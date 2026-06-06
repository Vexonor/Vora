import Image from "next/image"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-svh flex flex-col items-center justify-center gap-6 p-6 bg-background">
      <div className="flex items-center gap-3">
        <Image
          src="/image/app-logo.svg"
          alt="Vora Logo"
          width={40}
          height={40}
          className="size-10"
        />
        <h1 className="text-2xl font-bold text-primary">Vora</h1>
      </div>

      <div className="flex flex-col items-center gap-3 text-center max-w-sm">
        <div className="size-20 rounded-full bg-destructive/10 flex items-center justify-center">
          <span className="text-4xl font-bold text-destructive">!</span>
        </div>
        <h2 className="text-2xl font-bold text-foreground">Akses Ditolak</h2>
        <p className="text-sm text-muted-foreground">
          Anda tidak memiliki izin untuk mengakses halaman ini. Halaman ini hanya dapat diakses oleh peran tertentu.
        </p>
      </div>

      <Link
        href="/login"
        className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Kembali ke Login
      </Link>
    </div>
  )
}
