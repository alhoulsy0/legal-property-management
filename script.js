const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/dashboard/page.tsx', 'utf8');
content = content.replace(/\$(?!\{)/g, '?.? ');
fs.writeFileSync('src/app/(dashboard)/dashboard/page.tsx', content);
