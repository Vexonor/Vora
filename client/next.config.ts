import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'vora-pos-menu-images.s3.ap-southeast-2.amazonaws.com',
      },
    ],
  },
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
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
