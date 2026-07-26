// Initialize Convex Client for Vanilla JS
(function() {
  if (typeof convex !== 'undefined' && convex.ConvexClient) {
    window.convexClient = new convex.ConvexClient("https://brainy-octopus-570.convex.cloud");
    // window.convexClient = new convex.ConvexClient("http://127.0.0.1:3210");
  } else {
    console.warn("Convex SDK not found! Make sure you loaded the UMD bundle correctly.");
  }
})();
