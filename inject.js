const fs = require('fs');
const files = ['craft-site/index.html', 'craft-site/login.html', 'craft-site/admin.html', 'craft-site/admin-content.html'];
const scriptTag = '<script src="https://unpkg.com/convex@1.17.0/browser.bundle.js"></script>\n';

files.forEach(file => {
  if (!fs.existsSync(file)) return;
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('</body>') && !content.includes('browser.bundle.js')) {
    content = content.replace('</body>', scriptTag + '</body>');
    fs.writeFileSync(file, content);
  }
});
console.log("Injected Convex CDN script.");
