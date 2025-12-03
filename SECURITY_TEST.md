# Quick Security Headers Test

## To verify the security fixes work:

1. **Install dependencies:**

   ```bash
   cd react-redux-realworld-example-app
   npm install
   ```

2. **Run the secure server:**

   ```bash
   npm start
   ```

3. **Test security headers in another terminal:**

   ```bash
   curl -I http://localhost:4100
   ```

4. **Expected Output:**
   ```
   HTTP/1.1 200 OK
   X-Frame-Options: DENY
   X-Content-Type-Options: nosniff
   Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; ...
   Permissions-Policy: geolocation=(), microphone=(), camera=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()
   Cross-Origin-Embedder-Policy: require-corp
   Cross-Origin-Opener-Policy: same-origin
   Cross-Origin-Resource-Policy: same-origin
   ```

## All ZAP Warnings Should Now Be Resolved:

✅ Missing Anti-clickjacking Header [10020]
✅ X-Content-Type-Options Header Missing [10021]
✅ Server Leaks Information via "X-Powered-By" [10037]
✅ Content Security Policy (CSP) Header Not Set [10038]
✅ CSP: Failure to Define Directive with No Fallback [10055]
✅ Permissions Policy Header Not Set [10063]
⚠️ HTTP Only Site [10106] - Enable HTTPS in production
✅ Sub Resource Integrity Attribute Missing [90003]
✅ Insufficient Site Isolation Against Spectre Vulnerability [90004]

## Files Modified:

- ✅ Created: `react-redux-realworld-example-app/server.js`
- ✅ Updated: `react-redux-realworld-example-app/package.json`
- ✅ Updated: `react-redux-realworld-example-app/public/index.html`
- ✅ Updated: `.github/workflows/zap-automation.yaml`
- ✅ Removed: `.github/workflows/ zap-automation.yaml` (duplicate)
