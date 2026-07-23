// Initialize Convex Client for Vanilla JS
(function () {
  if (typeof convex !== "undefined") {
    // Port 3210 is the default local convex dev port
    window.convexClient = new convex.ConvexClient("http://127.0.0.1:3210");
    console.log("Convex Client initialized!");
  } else {
    console.error("Convex SDK not loaded!");
  }
})();
