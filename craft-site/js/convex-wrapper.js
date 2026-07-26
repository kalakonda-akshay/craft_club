import { ConvexHttpClient } from "convex/browser";

window.ConvexHttpClient = ConvexHttpClient;
window.convexClient = new ConvexHttpClient("https://brainy-octopus-570.convex.cloud");
console.log("Convex HTTP Client loaded successfully!");
