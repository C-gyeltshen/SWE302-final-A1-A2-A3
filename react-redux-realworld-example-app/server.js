const express = require("express");
const path = require("path");
const app = express();

// Security middleware - add headers to all responses
app.use((req, res, next) => {
  // Anti-clickjacking - prevents your site from being embedded in iframes
  res.setHeader("X-Frame-Options", "DENY");

  // Prevents MIME-sniffing attacks
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Remove X-Powered-By header to avoid information leakage
  res.removeHeader("X-Powered-By");

  // Content Security Policy - restricts resource loading
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline' https://demo.productionready.io https://code.ionicframework.com https://fonts.googleapis.com; " +
      "font-src 'self' https://code.ionicframework.com https://fonts.gstatic.com; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' http://localhost:8080 https://conduit.productionready.io; " +
      "frame-ancestors 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self'"
  );

  // Permissions Policy - controls browser features
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()"
  );

  // HTTPS Strict Transport Security (for production with HTTPS)
  // Uncomment when using HTTPS
  // res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // Cross-Origin Embedder Policy and Cross-Origin Opener Policy for Spectre protection
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  res.setHeader("Cross-Origin-Resource-Policy", "same-origin");

  next();
});

// Disable X-Powered-By header at app level
app.disable("x-powered-by");

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, "build")));

// Handle React routing - return index.html for all routes
app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

const PORT = process.env.PORT || 4100;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log("Security headers enabled:");
  console.log("✓ X-Frame-Options: DENY");
  console.log("✓ X-Content-Type-Options: nosniff");
  console.log("✓ Content-Security-Policy: configured");
  console.log("✓ Permissions-Policy: configured");
  console.log("✓ X-Powered-By: removed");
  console.log("✓ CORP/COEP/COOP: enabled (Spectre protection)");
});
