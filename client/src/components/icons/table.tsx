import type { IconProps } from "@/types/icon"

export const TableIcon: React.FC<IconProps> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true" role="img" className={`iconify iconify--hugeicons ${className}`} viewBox="0 0 24 24" id="table-02" stroke="currentColor" fill="currentColor">
      <path fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M2 4h20m-2.5 0L22 20M4.5 4L2 20M4 9h16" />
    </svg>
  )
}