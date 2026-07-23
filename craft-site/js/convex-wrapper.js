import { ConvexHttpClient } from "convex/browser";

// Expose a configured ConvexHttpClient to the global window object
window.convexClient = new ConvexHttpClient("http://127.0.0.1:3210");
console.log("Convex HTTP Client loaded successfully!");
