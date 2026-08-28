const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/clients/[id]/page.tsx', 'utf8');
c = c.replace(/<p className="text-sm font-bold text-slate-400 mb-0.5/g, '<p className="text-xs font-bold text-slate-400 mb-0.5');
fs.writeFileSync('src/app/(dashboard)/clients/[id]/page.tsx', c, 'utf8');
