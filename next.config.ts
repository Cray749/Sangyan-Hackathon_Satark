import type { NextConfig } from "next";

const config: NextConfig = {
  // small output folder, so the docker image stays light
  output: "standalone",
  poweredByHeader: false,
};

export default config;
