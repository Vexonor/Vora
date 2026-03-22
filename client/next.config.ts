import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/(private)/cashier',            
        destination: '/cashier/dashboard', 
        permanent: true,              
      },
      {
        source: '/(private)/kitchen',            
        destination: '/kitchen/order', 
        permanent: true,              
      },
      {
        source: '/(private)/manager',            
        destination: '/manager/dashboard', 
        permanent: true,              
      },
    ];
  },
};

export default nextConfig;
