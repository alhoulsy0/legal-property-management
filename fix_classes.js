const fs = require('fs');
let c = fs.readFileSync('src/app/(dashboard)/clients/[id]/page.tsx', 'utf8');

c = c.replace(/د\.أ \{p\.name\}/g, '${p.name}');
c = c.replace(/د\.أ \{exp\.description\}/g, '${exp.description}');
c = c.replace(/د\.أ \{item\.type /g, '${item.type ');
c = c.replace(/د\.أ \{item\.amount /g, '${item.amount ');
c = c.replace(/-د\.أ د\.أ \{Math/g, '-د.أ ${Math');
c = c.replace(/د\.أ \{isRentLate/g, '${isRentLate');
c = c.replace(/د\.أ \{\n/g, '${\n');
c = c.replace(/د\.أ \{showRentCyclesFor/g, '${showRentCyclesFor');
c = c.replace(/د\.أ \{showIssuesFor/g, '${showIssuesFor');
c = c.replace(/د\.أ \{showExpensesFor/g, '${showExpensesFor');
c = c.replace(/د\.أ \{showPayoutFor/g, '${showPayoutFor');

fs.writeFileSync('src/app/(dashboard)/clients/[id]/page.tsx', c);
