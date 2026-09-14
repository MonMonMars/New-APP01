#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'src');
const TARGET = path.join(SRC, 'components', 'AnimatedPressable.tsx');

const SKIP = new Set([
  TARGET,
  path.join(SRC, 'components', 'DropTargets.tsx'),
  path.join(SRC, 'components', 'AnimatedPressable.tsx'),
]);

function walk(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full, files);
    } else if (entry.name.endsWith('.tsx')) {
      files.push(full);
    }
  }
  return files;
}

function relativeImport(fromFile, toFile) {
  let rel = path.relative(path.dirname(fromFile), toFile).replace(/\\/g, '/');
  if (!rel.startsWith('.')) {
    rel = `./${rel}`;
  }
  return rel.replace(/\.tsx$/, '');
}

function removePressableFromImport(content) {
  return content.replace(
    /import\s+\{([^}]+)\}\s+from\s+['"]react-native['"];?/g,
    (match, imports) => {
      const parts = imports
        .split(',')
        .map((part) => part.trim())
        .filter((part) => part && part !== 'Pressable' && !part.startsWith('type Pressable'));
      if (parts.length === 0) {
        return '';
      }
      return `import { ${parts.join(', ')} } from 'react-native';`;
    },
  );
}

function migrateFile(file) {
  if (SKIP.has(file)) {
    return false;
  }

  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('Pressable')) {
    return false;
  }

  const hadAnimatedImport = content.includes("from './AnimatedPressable'") ||
    content.includes('from "../components/AnimatedPressable"') ||
    content.includes("from '../../components/AnimatedPressable'") ||
    content.includes('AnimatedPressable');

  content = content.replace(/<Pressable\b/g, '<AnimatedPressable');
  content = content.replace(/<\/Pressable>/g, '</AnimatedPressable>');
  content = removePressableFromImport(content);

  if (!hadAnimatedImport && content.includes('<AnimatedPressable')) {
    const importPath = relativeImport(file, TARGET);
    const importLine = `import { AnimatedPressable } from '${importPath}';\n`;
    const lastImport = content.lastIndexOf('\nimport ');
    if (lastImport >= 0) {
      const insertAt = content.indexOf('\n', lastImport + 1) + 1;
      content = content.slice(0, insertAt) + importLine + content.slice(insertAt);
    } else {
      content = importLine + content;
    }
  }

  content = content.replace(/\n{3,}/g, '\n\n');
  fs.writeFileSync(file, content);
  return true;
}

const files = walk(SRC);
let count = 0;
for (const file of files) {
  if (migrateFile(file)) {
    count += 1;
    console.log(path.relative(ROOT, file));
  }
}
console.log(`Migrated ${count} files.`);
