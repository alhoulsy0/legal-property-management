const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/clients/[id]/page.tsx', 'utf8');
c = c.replace('whitespace-nowrap د.أ {', 'whitespace-nowrap ${');
fs.writeFileSync('src/app/(dashboard)/clients/[id]/page.tsx', c, 'utf8');
