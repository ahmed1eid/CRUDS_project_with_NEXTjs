import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* خيارات الإعداد هنا */
  output: 'export',      // هذا السطر سيقوم بتوليد مجلد 'out' عند عمل build
  images: {
    unoptimized: true,   // ضروري لأن التصدير الثابت لا يدعم تحسين الصور الافتراضي من Next.js
  },
};

export default nextConfig;