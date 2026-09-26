// Mechanical index of the application's evidence records; not a new literature review.
import {writeFile} from 'node:fs/promises';
import {articles,examples} from '../src/examples.js';

const archivePapers={
 clocks:'https://doi.org/10.1126/science.adx3595',
 rta:'https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/'
};
const lines=[
 '# Ternary Check: Article and Case Concordance',
 '',
 'Companion to “The Complex Is Not the Reaction” and Ternary Check v0.2.3. This index covers all 14 retrieved corpus entries and all 88 application case records, including grouped compounds, controls, comparators and primary-paper extensions.',
 '',
 'This is a trace of the curated case library, not an assertion that every underlying claim has been independently revalidated or that the entire publication archive has been recovered. Article-only claims, preprints, source conflicts and construct restrictions remain explicitly visible. Primary papers take precedence where an article and its paper disagree.',
 '',
 'Only BRD4–MZ1–VHL 5T35 is bundled as an example coordinate set. A listed molecular system is not a claim that its structure or fitted parameters are included.',
 ''
];
for(const a of articles){
 const records=examples.filter(x=>x.article===a.id);
 lines.push(`## ${a.title}`,'');
 if(a.url)lines.push(`[Read the article or post](${a.url}).`);
 else lines.push('Archive essay; public article URL not confirmed. No public URL is invented.');
 if(a.paper)lines.push(`[Linked primary study](${a.paper}).`);
 if(archivePapers[a.id])lines.push(`[Additional primary context](${archivePapers[a.id]}).`);
 lines.push('',`Interpretive question: ${a.lesson} This group contains ${records.length} case records.`,'');
 for(const x of records){
  const url=x.paper||a.paper||a.url||archivePapers[a.id];
  lines.push(`### ${x.name}`,'',
   `Record \`${x.id}\`. Category: ${x.category}. Target/context: ${x.target}. Recruiter or route: ${x.e3}. Evidence label: ${x.status||'See case statement and source scope'}.`,
   '',
   `Case statement: ${x.evidence}${url?` ([Case provenance](${url}))`:''}`,
   '',
   `Interpretation boundary: ${x.boundary}${url?` ([Context](${url}))`:''}`,'');
 }
}
lines.push('## Corpus-level unresolved points','',
 'The GlueMap ranking/substrate conflict and MG6 article-only evidence are not resolved by this release. KAT2A compound-number details retain their article-reported status. RNF39 domain evidence is not promoted to full-length endogenous depletion. The heme–BACH1 study remains labeled as preprint evidence. The two archive essays still need confirmed public article links before public editorial cross-linking.',
 '',
 'The article uses additional primary studies for the BRD4 ubiquitination-zone discussion, ubiquitin-chain elongation kinetics and matched-series affinity relationships. These additions are cited in the essay; they are not retroactively represented as original members of the 14-entry article corpus.',
 '');
await writeFile('docs/ARTICLE-CONCORDANCE.md',lines.join('\n'));
console.log(`Wrote concordance: ${articles.length} corpus entries, ${examples.length} cases.`);
