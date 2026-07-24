// Initialize Convex Client for Vanilla JS
(function () {
  if (typeof convex !== "undefined") {
    // Port 3210 is the default local convex dev port
    window.convexClient = new convex.ConvexClient("https://brainy-octopus-570.convex.cloud");
    console.log("Convex Client initialized!");
  } else {
    console.error("Convex SDK not loaded!");
  }
})();
