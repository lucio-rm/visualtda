import fs from 'fs';
import path from 'path';

function walk(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'brain') {
        walk(fullPath, fileList);
      }
    } else {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const allSrc = walk('./src');
const allDocs = walk('./docs');
const allFiles = [...allSrc, ...allDocs];

console.log('Auditing', allFiles.length, 'files...');

// 1. Childish phrases
const childishRegex = /(¡lo lograste|¡hayyy|¡felicidades|¡excelente!|antes de escribir código, explorá|¡vamos!|¡buen trabajo!|¡genial!|¡hurra!|¡bravo!|bien hecho|felicitaciones)/i;
for (const f of allFiles) {
  if (f.includes('audit_quality.mjs')) continue;
  const c = fs.readFileSync(f, 'utf8');
  c.split('\n').forEach((line, i) => {
    if (childishRegex.test(line)) {
      console.log(`[CHILDISH] ${f}:${i + 1}: ${line.trim()}`);
    }
  });
}

// 2. Double spaces in JSX/strings
for (const f of allSrc) {
  if (!f.endsWith('.tsx') && !f.endsWith('.ts')) continue;
  const c = fs.readFileSync(f, 'utf8');
  c.split('\n').forEach((line, i) => {
    if (line.includes("'  ") || line.includes('"  ') || line.includes('  "') || line.includes("  '")) {
      // ignore indentation or comment
      const trimmed = line.trim();
      if (!trimmed.startsWith('//') && !trimmed.startsWith('*')) {
        console.log(`[DOUBLE SPACE] ${f}:${i + 1}: ${trimmed.slice(0, 90)}`);
      }
    }
  });
}

// 3. Broken LaTeX or unescaped entities
for (const f of allSrc) {
  const c = fs.readFileSync(f, 'utf8');
  c.split('\n').forEach((line, i) => {
    if (line.includes('&amp;') || line.includes('&lt;') || line.includes('&gt;') || line.includes('&#')) {
      if (!line.includes('.html')) {
        console.log(`[RAW ENTITY] ${f}:${i + 1}: ${line.trim()}`);
      }
    }
  });
}
