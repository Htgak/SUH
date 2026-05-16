import fs from 'fs';
let app = fs.readFileSync('src/app.js', 'utf8');
app = app.replace(/catch \{\}/g, 'catch { /* ignore */ }');
fs.writeFileSync('src/app.js', app, 'utf8');
