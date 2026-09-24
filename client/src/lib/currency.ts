export const formatThousands = (v: string | number | null | undefined): string => {
  const digits = String(v ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

export const digitsOnly = (v: string): string => v.replace(/\D/g, "");
