import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/cashier',            
        destination: '/cashier/dashboard', 
        permanent: true,              
      },
    ];
  },
};

export default nextConfig;
