import Image from "next/image"
import Link from "next/link"

export default function NotFound() {
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
        <h2 className="text-7xl font-black text-primary leading-none">404</h2>
        <h3 className="text-2xl font-bold text-foreground">Halaman Tidak Ditemukan</h3>
        <p className="text-sm text-muted-foreground">
          Maaf, halaman yang Anda cari tidak ada, sudah dipindahkan, atau tautannya salah.
        </p>
      </div>

      <Link
        href="/"
        className="bg-primary text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Kembali ke Beranda
      </Link>
    </div>
  )
}
