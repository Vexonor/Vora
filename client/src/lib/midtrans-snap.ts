type SnapCallbacks = {
  onSuccess: () => void
  onPending: () => void
  onError: () => void
  onClose: () => void
}

type SnapWindow = Window & {
  snap?: { pay: (token: string, callbacks: SnapCallbacks) => void }
}

const SNAP_SCRIPT_URL = {
  production: "https://app.midtrans.com/snap/snap.js",
  sandbox: "https://app.sandbox.midtrans.com/snap/snap.js",
}

function loadSnapScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as SnapWindow).snap) return resolve(true)

    const clientKey = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY
    if (!clientKey) return resolve(false)

    const isProduction = process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    const script = document.createElement("script")
    script.src = isProduction ? SNAP_SCRIPT_URL.production : SNAP_SCRIPT_URL.sandbox
    script.setAttribute("data-client-key", clientKey)
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export async function openSnapPayment(snapToken: string, fallbackRedirectUrl: string, onFinish: () => void) {
  const isSnapReady = await loadSnapScript()
  const snap = (window as SnapWindow).snap

  if (!isSnapReady || !snap) {
    window.location.href = fallbackRedirectUrl
    return
  }

  snap.pay(snapToken, {
    onSuccess: onFinish,
    onPending: onFinish,
    onError: onFinish,
    onClose: onFinish,
  })
}
