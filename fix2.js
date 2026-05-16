import fs from 'fs';
let app = fs.readFileSync('src/app.js', 'utf8');
// Replace all catch(e) or catch(err) that have empty bodies or unused variables
app = app.replace(/catch \([A-Za-z0-9_]+\) {(\s*)}/g, 'catch {$1  /* ignored */\n$1}');
app = app.replace(/catch \([A-Za-z0-9_]+\) {(\s*\/\/[^\n]+)\s*}/g, 'catch {$1\n}');
fs.writeFileSync('src/app.js', app, 'utf8');
