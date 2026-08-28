const fs = require('fs');
function fix(path) {
    if (!fs.existsSync(path)) return;
    let c = fs.readFileSync(path, 'utf8');
    c = c.replace(/placeholder-slate-500/g, 'placeholder-slate-500');
    c = c.replace(/<input([^>]*?)className="([^"]*?)"/g, (match, p1, p2) => {
        if (!p2.includes('placeholder-')) {
            return `<input${p1}className="${p2} placeholder-slate-500"`;
        }
        return match;
    });
    c = c.replace(/<textarea([^>]*?)className="([^"]*?)"/g, (match, p1, p2) => {
        if (!p2.includes('placeholder-')) {
            return `<textarea${p1}className="${p2} placeholder-slate-500"`;
        }
        return match;
    });
    fs.writeFileSync(path, c, 'utf8');
}
fix('src/app/(dashboard)/clients/page.tsx');
fix('src/app/(dashboard)/dashboard/page.tsx');
