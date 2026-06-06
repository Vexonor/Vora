import Icon from "@/lib/type/icon"
import React from "react"

const ChevronRightIcon: React.FC<Icon> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="currentColor" viewBox="0 0 256 256">
      <path d="M181.66,133.66l-80,80a8,8,0,0,1-11.32-11.32L164.69,128,90.34,53.66a8,8,0,0,1,11.32-11.32l80,80A8,8,0,0,1,181.66,133.66Z">
      </path>
    </svg>
  )
}

export default ChevronRightIcon