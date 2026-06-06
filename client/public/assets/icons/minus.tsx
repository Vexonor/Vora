import Icon from "@/lib/type/icon"
import React from "react"

export const MinusIcon: React.FC<Icon> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 256 256">
      <path d="M224,128a8,8,0,0,1-8,8H40a8,8,0,0,1,0-16H216A8,8,0,0,1,224,128Z">
      </path>
    </svg>
  )
}