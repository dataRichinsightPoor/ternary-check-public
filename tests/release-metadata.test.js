import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {articles,examples} from '../src/examples.js';

test('current release metadata and guides agree with package version',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 const {version}=JSON.parse(read('package.json'));
 const lock=JSON.parse(read('package-lock.json'));
 assert.equal(lock.version,version);
 assert.equal(lock.packages[''].version,version);
 assert.match(read('CITATION.cff'),new RegExp(`^version: ${version.replaceAll('.','\\.')}\\s*$`,'m'));
 for(const file of ['README.md','START-HERE.md'])
  assert.ok(read(file).includes(`Version ${version}`),`${file} current version`);
 assert.ok(read('RELEASE-NOTES.md').startsWith(`# Ternary Check v${version}\n`));
 assert.ok(read('.github/workflows/package-draft.yml').includes(`default: v${version}`));
});

test('companion essay covers every corpus entry and concordance covers every case',()=>{
 const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
 const essay=read('docs/COMPANION-ARTICLE.md');
 const index=read('docs/ARTICLE-CONCORDANCE.md');
 for(const a of articles){
  assert.ok(essay.includes(a.url||a.title.split(' ·')[0]),`essay missing ${a.id}`);
  assert.ok(index.includes(`## ${a.title}`),`index missing ${a.id}`);
 }
 for(const x of examples)assert.ok(index.includes(`Record \`${x.id}\``),`index missing ${x.id}`);
});
