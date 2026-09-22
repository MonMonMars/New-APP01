import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

import { en } from '../src/i18n/en';
import { zhTw } from '../src/i18n/zh-TW';

function flattenStringKeys(obj: Record<string, unknown>, prefix = ''): Set<string> {
  const keys = new Set<string>();
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      for (const nested of flattenStringKeys(value as Record<string, unknown>, path)) {
        keys.add(nested);
      }
    } else if (typeof value === 'string') {
      keys.add(path);
    }
  }
  return keys;
}

function walkSourceFiles(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (name === 'i18n') {
        continue;
      }
      walkSourceFiles(full, out);
      continue;
    }
    if (/\.(tsx?|jsx?)$/.test(name)) {
      out.push(full);
    }
  }
  return out;
}

const T_KEY = /\bt\s*\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;

function collectUsedTranslationKeys(): Set<string> {
  const used = new Set<string>();
  const files = walkSourceFiles(join(process.cwd(), 'src'));
  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    let match: RegExpExecArray | null;
    while ((match = T_KEY.exec(text)) !== null) {
      used.add(match[1]);
    }
  }
  return used;
}

function main() {
  const enKeys = flattenStringKeys(en as Record<string, unknown>);
  const zhKeys = flattenStringKeys(zhTw as Record<string, unknown>);
  const used = collectUsedTranslationKeys();

  const missingEn: string[] = [];
  const missingZh: string[] = [];

  for (const key of [...used].sort()) {
    if (!enKeys.has(key)) {
      missingEn.push(key);
    }
    if (!zhKeys.has(key)) {
      missingZh.push(key);
    }
  }

  const orphanEn = [...enKeys].filter((key) => !used.has(key)).sort();

  const payload = {
    usedKeyCount: used.size,
    enKeyCount: enKeys.size,
    zhKeyCount: zhKeys.size,
    missingEn,
    missingZh,
    orphanEnSample: orphanEn.slice(0, 20),
    orphanEnCount: orphanEn.length,
  };

  console.log(JSON.stringify(payload, null, 2));

  if (missingEn.length > 0 || missingZh.length > 0) {
    process.exit(1);
  }
}

main();
