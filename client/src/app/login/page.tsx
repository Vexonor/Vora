import { LoginForm } from "@/components/login-form"
import Image from "next/image"


export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center gap-3">
              <Image
                src="/image/app-logo.svg"
                alt="Vora Logo"
                width={100}
                height={100}
                className="size-10"
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <h1 className="text-2xl font-bold text-primary truncate">Vora</h1>
            </div>
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/image/store.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover"
          width={512}
          height={512}
        />
      </div>
    </div>
  )
}
