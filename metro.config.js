const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require("path");
const fs = require("fs");

const config = getDefaultConfig(__dirname);

// Add static file serving for public directory (favicon, etc.)
const publicPath = path.join(__dirname, "public");
config.server = config.server || {};
config.server.enhanceMiddleware = (middleware) => {
  return (req, res, next) => {
    // Serve favicon from public directory
    if (req.url.startsWith("/favicon")) {
      const filePath = path.join(publicPath, "favicon.png");
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "image/png");
        res.setHeader("Cache-Control", "public, max-age=3600");
        return res.end(fs.readFileSync(filePath));
      }
    }
    return middleware(req, res, next);
  };
};

// Resolve expo-sqlite web worker to an empty module on web
const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  // Intercept the problematic worker import from expo-sqlite on web
  if (platform === "web" && moduleName === "./worker" && context.originModulePath?.includes("expo-sqlite")) {
    return {
      type: "empty",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, {
  input: "./global.css",
  // Force write CSS to file system instead of virtual modules
  // This fixes iOS styling issues in development mode
  forceWriteFileSystem: true,
});
