
const Invoice = () => {
  return (
    <div className="w-full h-dvh bg-primary">
      <div className="max-w-3xl h-full mx-auto bg-background p-6">
        <div className="size-full bg-white px-4 py-10 flex flex-col items-center">
          {/* Header */}
          <div className="w-full flex flex-col items-center gap-0.5 text-xs text-foreground text-center font-medium mb-10">
            <span>Asam Pedas Tepi Danau</span>
            <p className="">Jl. Ruko Greenland No.9-11 Blok R, Tlk. Tering, Kec. Batam Kota, Kota Batam, Kepulauan Riau, 29444</p>
            <span>TEL: 0812-9501-2089</span>
          </div>
          {/* Invoice Detail */}
          <div className="w-full flex flex-col gap-0.5">
            <span className="text-lg text-foreground font-semibold">Meja - 04</span>
            <table className="w-full text-sm text-left">
              <tbody>
                <tr>
                  <td className="w-40 align-top font-medium">Nomor Invoice</td>
                  <td className="w-2  align-top flex justify-end items-center">#:</td>
                  <td>678890</td>
                </tr>
                <tr>
                  <td className="w-40 align-top font-medium">Tanggal</td>
                  <td className="w-2  align-top flex justify-end items-center">:</td>
                  <td>12 Oktober 2025</td>
                </tr>
                <tr>
                  <td className="w-40 align-top font-medium">Nama Kasir</td>
                  <td className="w-2  align-top flex justify-end items-center">:</td>
                  <td>Jhon  Doe</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full my-4 border-t border-dashed border-foreground" />
          </div>
          {/* Order Detail */}
          <div className=" w-full flex flex-col gap-0.5">
            <table className="w-full text-sm font-medium">
              <tbody className="flex flex-col gap-2">
                <tr className="w-full flex flex-wrap items-center">
                  <td className="flex-1 text-start">Nasi Goreng</td>
                  <td className="flex-1 text-center">2</td>
                  <td className="flex-1 text-end">30.000</td>
                </tr>
                <tr className="w-full flex flex-wrap items-center">
                  <td className="flex-1 text-start">Teh Obeng</td>
                  <td className="flex-1 text-center">4</td>
                  <td className="flex-1 text-end">20.000</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full my-4 border-t border-dashed border-foreground" />
          </div>
          {/* Price Detail */}
          <div className=" w-full flex flex-col gap-0.5">
            <table className="w-full text-sm font-medium">
              <tbody className="flex flex-col gap-2">
                <tr className="w-full flex flex-wrap items-center">
                  <td className="flex-1 text-start">Subtotal</td>
                  <td className="flex-1 text-end">50.000</td>
                </tr>
                <tr className="w-full flex flex-wrap items-center">
                  <td className="flex-1 text-start">PPN (10%)</td>
                  <td className="flex-1 text-end">5.000</td>
                </tr>
              </tbody>
            </table>
            <div className="flex flex-wrap mt-4 text-lg text-foreground font-semibold">
              <span className="flex-1 text-start">Total</span>
              <span className="flex-1 text-end">55.000</span>
            </div>
            <div className="w-full my-4 border-t border-dashed border-foreground" />
          </div>
          {/* Transaction Detail */}
          <div className="w-full flex flex-col gap-0.5">
            <table className="w-full text-sm text-left">
              <tbody>
                <tr>
                  <td className="w-40 align-top font-medium">Waktu Transaksi</td>
                  <td className="w-2 align-top flex justify-end items-center">:</td>
                  <td>19.30</td>
                </tr>
                <tr>
                  <td className="w-40 align-top font-medium">Metode Pembayaran</td>
                  <td className="w-2 align-top flex justify-end items-center">:</td>
                  <td>Virtual Account BNI</td>
                </tr>
                <tr>
                  <td className="w-40 align-top font-medium">No. Transaksi</td>
                  <td className="w-2 align-top flex justify-end items-center">:</td>
                  <td>BNI25102025001</td>
                </tr>
              </tbody>
            </table>
            <div className="w-full my-4 border-t border-dashed border-foreground" />
          </div>
          {/* Footer */}
          <div className="flex items-end justify-center h-full">
            <p className="text-center text-xs text-foreground font-medium">
              Pembayaran Anda telah diterima.
              Terima kasih atas kunjungan Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoice