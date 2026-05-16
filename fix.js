import fs from 'fs';
let content = fs.readFileSync('src/app.js', 'utf8');
content = content.replace(/\\\$/g, '$');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('src/app.js', content, 'utf8');
