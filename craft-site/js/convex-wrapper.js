import { ConvexHttpClient } from "convex/browser";

// Expose a configured ConvexHttpClient to the global window object
window.convexClient = new ConvexHttpClient("https://brainy-octopus-570.convex.cloud");
console.log("Convex HTTP Client loaded successfully!");
