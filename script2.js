const fs = require('fs');
let content = fs.readFileSync('src/app/(dashboard)/clients/[id]/page.tsx', 'utf8');

// Replace standard JSX patterns
content = content.replace(/\$\{/g, '?.? {');
// Restore backtick template literals by finding them and fixing them
// Actually, it's safer to just fix the known instances
content = content.replace(/>\$/g, '>?.? ');
content = content.replace(/\$</g, '?.? <');
content = content.replace(/: \$/g, ': ?.? ');
content = content.replace(/\-\$/g, '-?.? ');
content = content.replace(/ \$/g, ' ?.? ');

fs.writeFileSync('src/app/(dashboard)/clients/[id]/page.tsx', content);
