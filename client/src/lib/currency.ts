/**
 * Helpers for money inputs that display Indonesian thousand separators
 * (e.g. "15000" shown as "15.000") while the form keeps the raw digit string.
 */

/**
 * Format a raw digit string (or number) into Indonesian thousands.
 * Non-digits are ignored. Returns "" when blank.
 * e.g. "15000" -> "15.000"
 */
export const formatThousands = (v: string | number | null | undefined): string => {
  const digits = String(v ?? "").replace(/\D/g, "");
  return digits ? Number(digits).toLocaleString("id-ID") : "";
};

/** Keep digits only — for storing the raw numeric value from a formatted input. */
export const digitsOnly = (v: string): string => v.replace(/\D/g, "");
