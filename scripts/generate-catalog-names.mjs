#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { mockProfiles } from '../src/data/profiles.ts';

const FEMALE = [...new Set([
  'Simone', 'Daniela', 'Marisol', 'Elise', 'Arielle', 'Helena', 'Nina', 'Keiko', 'Chloe', 'Isabella',
  'Valentina', 'Reese', 'Sienna', 'Petra', 'Miriam', 'Corinne', 'Yasmin', 'Alondra', 'Claudia', 'Ophelia',
  'Ruth', 'Tara', 'Wren', 'Giulia', 'Renata', 'Ingrid', 'Leila', 'Naia', 'Paloma', 'Selena', 'Vivian',
  'Anika', 'Zara', 'Brielle', 'Camille', 'Sloane', 'Amara', 'Hannah', 'Jade', 'Vera', 'Clara', 'Iris',
  'Stephanie', 'Mathilde', 'Tessa', 'Yuki', 'Luna', 'Noor', 'Ellis', 'Kira', 'Gina', 'Nyla', 'Freya',
  'Lin', 'Suki', 'Amelia', 'Beatrice', 'Carmen', 'Daphne', 'Eloise', 'Fiona', 'Greta', 'Holly', 'Imani',
  'Jasmine', 'Kendra', 'Layla', 'Maeve', 'Nadia', 'Olive', 'Paige', 'Quinn', 'Rosa', 'Stella', 'Talia',
  'Uma', 'Willow', 'Ximena', 'Yara', 'Zelda', 'Ada', 'Bella', 'Celia', 'Dina', 'Esme', 'Flora', 'Gia',
  'Hana', 'Ines', 'Juno', 'Kira', 'Lena', 'Mira', 'Nola', 'Orla', 'Pia', 'Rhea',
])];
const MALE = [...new Set([
  'Julian', 'Theo', 'Malcolm', 'Darius', 'Rafael', 'Jesse', 'Marcus', 'Tyler', 'Ryan', 'Omar', 'Andre',
  'Ben', 'Eli', 'Lucas', 'Ethan', 'Declan', 'Jonah', 'Lars', 'Stefan', 'Devon', 'Paco', 'Ulrich', 'Xavier',
  'Zion', 'Benji', 'Derek', 'Henrik', 'Kwame', 'Kenji', 'Garrett', 'Matteo', 'Sven', 'Rhys', 'Idris',
  'Desmond', 'Morris', 'Phoenix', 'Simon', 'Marco', 'Nathan', 'Miguel', 'Anthony', 'Oliver', 'Daniel',
  'Mateo', 'Caleb', 'Leo', 'Diego', 'James', 'Felix', 'Adrian', 'Bruno', 'Carlos', 'Dante', 'Evan',
  'Frank', 'Gabe', 'Hugo', 'Ivan', 'Joel', 'Kai', 'Milan', 'Nico', 'Oscar', 'Pablo', 'Quentin', 'Ravi',
  'Seth', 'Tomas', 'Uri', 'Victor', 'Wes', 'Yusuf', 'Arjun', 'Brett', 'Cole', 'Dean', 'Emmett', 'Finn',
  'Grant', 'Hank', 'Isaac', 'Jared', 'Kurt', 'Louis', 'Miles', 'Nate', 'Owen', 'Paul', 'Reed', 'Sean',
])];
const NEUTRAL = [...new Set([
  'Quinn', 'River', 'Sage', 'Remy', 'Alex', 'Casey', 'Morgan', 'Avery', 'Skyler', 'Rowan', 'Emery',
  'Finley', 'Harper', 'Jules', 'Logan', 'Micah', 'Noel', 'Parker', 'Robin', 'Shawn', 'Blair', 'Drew',
])];

function poolFor(gender) {
  if (gender === 'woman') return FEMALE;
  if (gender === 'man') return MALE;
  return NEUTRAL;
}

function pickName(pool, seed, used) {
  for (let i = 0; i < pool.length; i += 1) {
    const name = pool[(seed + i) % pool.length];
    if (!used.has(name.toLowerCase())) {
      return name;
    }
  }
  return null;
}

const human = mockProfiles
  .filter((p) => !p.isAiPersona && !p.id.startsWith('ai-'))
  .sort((a, b) => Number(a.id) - Number(b.id));

const used = new Set();
const lines = [];

for (const p of human) {
  const pool = poolFor(p.gender);
  const seed = Number(p.id) || 1;
  let name = pickName(pool, seed, used);
  if (!name) {
    name = `${pool[seed % pool.length]} ${String.fromCharCode(65 + (seed % 26))}.`;
  }
  used.add(name.toLowerCase());
  lines.push(`  '${p.id}': '${name.replace(/'/g, "\\'")}',`);
}

writeFileSync(
  new URL('../src/data/demoCatalogNames.ts', import.meta.url),
  `/** Display names for catalog demo humans — unique per id (regenerate: node scripts/generate-catalog-names.mjs) */
export const DEMO_CATALOG_NAME_BY_ID: Record<string, string> = {
${lines.join('\n')}
};
`,
);
console.log('catalog names', lines.length);
