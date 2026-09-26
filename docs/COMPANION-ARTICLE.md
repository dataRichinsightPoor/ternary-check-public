# The Complex Is Not the Reaction

Data-Rich, Insight-Poor — CCXXXIX  
A companion to Ternary Check  
Ermelinda Damko

A protein can be recruited without being efficiently ubiquitinated. A reporter can become more sensitive without the underlying degrader becoming more potent. Both distinctions have experimental support; both are easy to lose when a platform compresses its output into one attractive number ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/); [Ratiometric transcriptional activation by protein degradation, open manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)). The useful question is not whether we can generate another score, but whether we can identify the step at which an apparently favorable molecular encounter stops becoming productive protein loss.

Ternary Check is built around that question. It separates an inspectable structural calculation from a deliberately reduced kinetic model, a source-linked case library, and an E3 evidence browser. The separation is the point: a surface measurement should not quietly become a catalytic rate, and an illustrative rate should not quietly become a compound prediction.

This essay revisits all 14 articles, posts, and archive essays represented in the tool. They do not supply 14 solved ternary complexes: the bundled coordinate example is BRD4–MZ1–VHL, while the wider corpus supplies mechanistic comparisons, controls, and competing explanations. Their common subject is the distance between a state we can observe and a process we need to understand.

## A structure is most useful when its question is narrow

The starting example is the 2.7 Å BRD4 BD2–MZ1–VHL complex deposited as 5T35, with Elongin B and C also present in the crystallographic assembly ([Gadd et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5392356/); [RCSB 5T35](https://www.rcsb.org/structure/5T35)). This structure helped explain cooperative recognition and supported structure-guided development of the more selective degrader AT1; it is a strong counterexample to the idea that structural caution requires structural pessimism ([Gadd et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5392356/)).

Begin, however, with something as apparently straightforward as interface area. Ternary Check defines pair interface area as

\[
A_{\mathrm{pair}}=
\frac{\mathrm{SASA}_{T}+\mathrm{SASA}_{E}-\mathrm{SASA}_{TE}}{2}.
\]

That factor of two is a convention, not a correction for bad biology. In the app's 960-point calculation on the selected protein pair, approximately 344 Å² of pair area corresponds to approximately 689 Å² of summed solvent-accessible surface loss. A number reported as total burial should not be compared with a half-burial measure without first aligning the definitions.

Gadd and colleagues reported 688 Å² of protein–protein buried surface area and a much larger extended interface when contacts involving MZ1 were included ([Gadd et al., 2017](https://pmc.ncbi.nlm.nih.gov/articles/PMC5392356/)). The numerical proximity is informative, but it is not an independent biological validation of this browser calculation. Matching atoms, radii, probe size, assembly, and area convention comes before interpreting agreement.

The same discipline applies to lysines. The app estimates solvent exposure of the terminal NZ atom under explicit geometric rules; it does not determine whether that atom can enter an E2–ubiquitin catalytic configuration. It analyzes only two selected protein chains, excludes ligand and other-chain occlusion from its surface calculation, and leaves missing coordinates missing. A green lysine therefore means “passes this exposure rule,” not “will be ubiquitinated.”

This is the practical continuation of [The Mechanistic Void in Molecular Glue Design](https://www.linkedin.com/pulse/mechanistic-void-molecular-glue-design-ermelinda-damko-cbmze), which argued that stable recruitment does not complete a degradation mechanism. That argument survives a correction to its examples: the earlier article and the retrieved GlueMap version disagree on compound ranking and substrate assignment, so the roscovitine/DS50 comparison is quarantined rather than reused as a quantitative demonstration ([earlier article](https://www.linkedin.com/pulse/mechanistic-void-molecular-glue-design-ermelinda-damko-cbmze); [GlueMap preprint, version 1](https://www.biorxiv.org/content/10.1101/2025.01.13.632817v1.full.pdf)). A provenance problem does not become a mechanistic result because it has been put into a dashboard.

## The acceptor is a region, not necessarily a residue

Crowe and colleagues moved beyond the isolated recruitment complex to examine MZ1-recruited BRD4 BD2 within NEDD8-activated CRL2–VHL, including E2–ubiquitin machinery in a trapped complex ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)). Their work is especially useful because it joins structural positioning to site mapping and perturbation rather than asking the picture to carry the whole mechanism.

In the modeled closed complex, the terminal nitrogen of BRD4 Lys456 lay 18.4 Å from the carbonyl of the modeled thioester at UBE2R1 Cys93 ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)). That is not a captured bond-forming contact. It identifies a favorable direction of approach within a flexible machine, while the unresolved acceptor ubiquitin and locally flexible components limit what can be claimed about the actual transfer configuration ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)).

Lys456 also emerged as a preferred early ubiquitination site in the in vitro experiments, yet replacing it alone with arginine had negligible effects on the reported ubiquitination metrics and comparable cellular degradation to wild type ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)). Removing Lys368, Lys445, and Lys456 together impaired ubiquitination and degradation, approaching the effect of the larger light-face mutant ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)).

The distinction is consequential. A preferred acceptor can be experimentally real without being uniquely necessary. The authors interpret this buffering in terms of neighboring acceptors, ligase flexibility, and the lifetime of the recruited complex; the mutant series is stronger evidence for a productive ubiquitination region than a nearest-lysine ranking would have been ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)).

It also changes the next experiment. A single-site mutant that leaves degradation intact should not automatically invalidate the structural hypothesis; a cluster perturbation, with matched expression and folding controls, may distinguish redundancy from irrelevance. Conversely, loss of degradation after a mutation is not enough unless one can separate loss of acceptor chemistry from disruption of the recognition surface.

The cellular maps add another useful complication: some lysines on the nominally unfavorable face were ubiquitinated in cells despite not being detected in the recombinant in vitro assay ([Crowe et al., 2024](https://pmc.ncbi.nlm.nih.gov/articles/PMC11468923/)). The lesson is not that geometry fails. It is that geometry must be indexed to an assembly, an ensemble, an enzyme system, and a measurement window.

## Chemistry creates the surface the ligase sees

The target-first chemistry discussed in [High-Throughput SuFEx Glues and the Hard Part](https://www.linkedin.com/pulse/high-throughput-sufex-glues-hard-part-turning-screens-ermelinda-damko-6epwe) turns this problem around: rather than preselecting an E3-binding arm, diversify the exposed surface of a target ligand and discover which effector becomes recruitable. In the primary study, diversification using 3,163 amine building blocks produced chemically induced proximity systems involving CRBN, DCAF16, and FBXO3 ([Shaum et al., 2026](https://doi.org/10.1038/s41589-025-02137-2)).

For the ENL-directed dHTC1 system, prebinding to ENL changed CRBN competition potency from approximately 23 µM to 106 nM, with the study reporting approximately 220-fold cooperativity in that assay ([Shaum et al., 2026](https://doi.org/10.1038/s41589-025-02137-2)). The active and inactive stereoisomers could retain similar target affinity while separating in degradation behavior ([Shaum et al., 2026](https://doi.org/10.1038/s41589-025-02137-2)). The mechanistically relevant species is therefore not adequately described by the affinity of the free ligand for one isolated protein.

That does not make an assay-derived cooperativity factor a universal constant. Nor does a hook-shaped dose response, by itself, establish the molecular architecture: the primary study leaves dHTC2's molecular-glue versus heterobifunctional classification unresolved and treats dHTC3 as glue-like without definitive structural classification ([Shaum et al., 2026](https://doi.org/10.1038/s41589-025-02137-2)). These distinctions matter when deciding which equations are appropriate, not merely which label belongs in a library.

[Beyond the Degron](https://www.linkedin.com/pulse/beyond-degron-how-non-canonical-crbn-recruitment-could-damko-bh0se) extended the recognition question to KAT2A. The primary Science study supports noncanonical CRBN recruitment rather than a requirement that every new substrate reproduce the familiar degron template ([Ojeda et al., 2026](https://doi.org/10.1126/science.aef5391)). The broader implication is worth testing: a searchable sequence motif and a chemically recruitable surface need not define the same target space.

[The Return of the Degron](https://www.linkedin.com/pulse/return-degron-ermelinda-damko-qbxce) then examined the converse problem: finding latent CRBN binders does not make each binder an endogenous degradable substrate. The proteome-wide study makes that boundary concrete with domain-context comparisons and a focused screen of 960 CRBN-directed analogs for RNF39 ([Galli, Xiao et al., 2026](https://doi.org/10.1038/s41587-026-03237-7)).

Both Z5000181945 and Z4999952733 strengthened recruitment, but the retrieved degradation result is for Z5000181945 acting on the RNF39 RING domain, with MLN4924 rescue; it is not a demonstrated full-length RNF39 result ([Galli, Xiao et al., 2026](https://doi.org/10.1038/s41587-026-03237-7)). FIZ1, ZBTB11, and Helios similarly illustrate the need for compound-specific follow-through beyond latent binding ([Galli, Xiao et al., 2026](https://doi.org/10.1038/s41587-026-03237-7)). Construct identity belongs in the evidence record, not in a footnote discarded when the result becomes a training label.

## An E3 is not a scalar property of a cell

[Programming Ligase Choice in SMARCA2/4 Molecular Glues](https://www.linkedin.com/pulse/programming-ligase-choice-smarca24-molecular-glues-ermelinda-damko-9lzpe) provides a direct warning against universal ligase rankings. Small chemical changes altered productive DCAF16 and FBXO22 dependence, and compound 4 remained DCAF16-dependent despite weak FBXO22 binding in the reported system ([Rouhimoghadam et al., 2026](https://pubmed.ncbi.nlm.nih.gov/42392088/)). Engagement and productive use are different phenotypes.

The cysteine-dependent chemistry in that study also prevents a casual transfer into a reversible equilibrium model ([Rouhimoghadam et al., 2026](https://pubmed.ncbi.nlm.nih.gov/42392088/)). An explicit model of covalent capture would need to account for formation and loss of the captured state, not simply assign it a favorable dissociation constant. The app accordingly treats these compounds as mechanistic examples rather than fitted presets.

[When Molecular Glues Learn Geography: Heme, BACH1, and AML](https://www.linkedin.com/pulse/when-molecular-glues-learn-geography-heme-bach1-aml-ermelinda-damko-i3rbe) adds a spatial restriction. In the underlying preprint, cytoplasmic rather than mitochondrial CUL2–FEM1B supports the reported BACH1 degradation, connecting the availability of the ligase interface to its localization ([Heider et al., 2026, preprint](https://pubmed.ncbi.nlm.nih.gov/42146656/)). The same protein name in a whole-cell abundance table does not identify the same accessible machinery.

This is why “E3 abundance” in a reduced model should be interpreted as an effective available pool, not automatically as total transcript or total protein abundance. A change in localization, assembly, competing substrate load, or interface availability could alter that pool without changing the total measured amount. Treating all such changes as an apparent shift in affinity would fit the wrong biological explanation.

An E3 database remains valuable, but it answers a different question. UbiBrowser distinguishes literature-supported E3–substrate interactions from predicted interactions; its records document biological relationships rather than a universal ranking of chemically recruitable ligases ([Wang et al., UbiBrowser 2.0](https://academic.oup.com/nar/article/50/D1/D719/6406468)). In Ternary Check, provider links and local known-interaction TSV import preserve that distinction, while a file fingerprint makes the imported evidence set identifiable.

A known endogenous interaction should be used to investigate context, not to claim that a new degrader will work. Absence of a record should prompt a search for missing evidence, not a negative efficacy prediction. The most useful database connection may be the one that prevents an annotation from acquiring a stronger meaning than its experiment.

## Residence helps commitment; cycling determines throughput

The post [How “Good” MD Can Make or Break PROTAC Design](https://www.linkedin.com/posts/ermelinda-damko-ab1570305_datarichinsightpoor-activity-7447431599593250816-P0Ig) asked what static poses miss about the ensembles of dBET-family degraders. The associated eLife reviewed preprint compares dBET1, dBET23, dBET57, and dBET70 using structural dynamics and modeled geometric criteria for ubiquitination competence ([Wu, Hung and Chang, reviewed preprint v2](https://elifesciences.org/reviewed-preprints/101127v2)). Those fractions are populations satisfying a model criterion, not experimentally counted probabilities of ubiquitin transfer.

Bai and colleagues similarly modeled multiple CRL4A conformations and evaluated whether target lysines could approach the ubiquitination machinery without severe clashes ([Bai et al., 2022](https://www.jbc.org/article/S0021-9258(22)00093-X/fulltext)). These approaches make a structural hypothesis more discriminating by adding the machinery and its motion. They do not eliminate uncertainty about sampling, force fields, chemical reactivity, or how a simulated substate maps to a cellular endpoint.

The archived essay “The Doorstop and the Three Clocks” supplies a complementary distinction. Its LOCKTAC comparison concerns stabilizing preexisting macromolecular interactions, such as spliceosomal recognition or a kinesin–microtubule state, rather than assuming that every useful increase in residence time is a degradation mechanism ([Deshaies and Potts, 2025](https://doi.org/10.1126/science.adx3595)). A longer-lived complex can help one biological process and prevent another from completing its cycle.

The app exposes a deliberately small version of this competition. If a recruited complex has two constant, independent exit hazards, productive commitment at \(k_c\) and dissociation at \(k_{\mathrm{off}}\), then

\[
P(\text{commit before dissociation})=
\frac{k_c}{k_c+k_{\mathrm{off}}}.
\]

Reducing dissociation increases this probability monotonically. There is no intermediate “optimal residence time” in this equation. To obtain one, a model must introduce an additional cost, such as slow release, limiting E3 recycling, a trapped state, or impaired progression to another required configuration.

That observation refines rather than discards the residence-time argument in [From Degradation Curves to Degradability Landscapes](https://www.linkedin.com/pulse/from-degradation-curves-degradability-landscapes-making-damko-qwkue). A productive residence-time band may be a sensible biological hypothesis, but it cannot be claimed as an output of a model that lacks the mechanism that would generate the upper boundary.

The clocks can also be strikingly different in scale. Liwocha and colleagues measured a fastest ubiquitin-transfer rate of approximately 100 s⁻¹ in pre-steady-state chain-elongation experiments with ubiquitin-primed HIF1α peptide and neddylated CRL2–VHL ([Liwocha et al., 2024](https://www.nature.com/articles/s41594-023-01206-1)). This is neither an initial ubiquitination rate for an arbitrary substrate nor a cellular protein-depletion rate. It makes the distinction sharper: a fast catalytic step does not tell us how frequently the system reaches that step.

## Degradation must outrun replacement

The degradability-landscape framework developed by Du and colleagues puts target turnover and E3 availability into a quantitative account of efficacy, rather than treating a degradation curve as a self-explanatory compound property ([Du et al., 2026](https://doi.org/10.1038/s41467-026-75591-8)). Ternary Check uses an independent reduced model to expose that logic. It does not reproduce the paper or import its fitted parameters.

Let \(T\) be total target, \(E\) total available E3, \(d\) clamped free intracellular degrader, and \(X\) ternary complex. With target and E3 dissociation constants \(K_T\) and \(K_E\), and dimensionless cooperativity \(\alpha\), the model solves

\[
X=c(d)(T-X)(E-X),\qquad
c(d)=\frac{\alpha d}{(K_T+d)(K_E+d)}.
\]

This formulation conserves target and E3 while accounting for binary competition. It does not conserve a finite total drug pool: \(d\) is stipulated free intracellular concentration, not added medium concentration, administered dose, or intracellular total drug.

Target dynamics are then

\[
\frac{dT}{dt}
=k_bT_0-k_bT-k_{\mathrm{pr}}X,\qquad
k_b=\frac{\ln 2}{t_{1/2}}.
\]

The first term replaces the baseline target pool \(T_0\); the second removes target through basal turnover; the third is a supplied productive-clearance term. All ubiquitin-chain decisions, processing losses, and subsequent clearance are collapsed into \(k_{\mathrm{pr}}\), and E3 recycling is assumed instantaneous. Geometry does not set that rate.

A useful result follows before fitting anything. Since \(X\leq E\), reaching a steady remaining fraction \(f=T/T_0\) requires

\[
\frac{k_{\mathrm{pr}}E}{k_bT_0}\geq 1-f.
\]

This is a necessary capacity condition, not a sufficient prediction. It says that the maximum modeled productive removal capacity must at least cover the replacement flux left uncompensated by basal turnover.

Consider explicitly hypothetical inputs: a 100 nM baseline target pool, an 8-hour half-life, and \(k_{\mathrm{pr}}=1.2\ \mathrm{h}^{-1}\). Baseline synthesis is approximately 8.66 nM per hour. If available E3 is only 3 nM, even complete E3 saturation caps productive removal at 3.6 nM per hour, so this model cannot sustain more than approximately 41.55% target loss at steady state. Improved affinity cannot remove that particular capacity ceiling; incomplete occupancy makes the attainable result worse.

This is the sort of bound that can change an experiment. Before investing in a small affinity improvement, ask whether the measured E3 pool and plausible processing rate leave enough capacity for the intended depletion. If they do not, the relevant intervention may be recruitment of another available ligase, altered delivery, or a different way of suppressing the target's function.

The dose sweep has its own restricted analytic result: \(c(d)\) is maximal at \(d=\sqrt{K_TK_E}\). The refined app includes this point and the selected dose rather than allowing a coarse grid to miss them. This is an optimum of the stated equilibrium model, not a recommendation for extracellular dosing; exposure kinetics and finite drug balance could move the experimental optimum.

Finally, a well-fit curve need not identify its mechanism. In the low-occupancy approximation, productive removal contains a factor proportional to \(k_{\mathrm{pr}}\alpha E\); different combinations can produce similar behavior. Independent E3 measurements, early ubiquitination, exposure measurements, and turnover perturbations can therefore be more informative than collecting a denser version of the same endpoint curve.

## Delivery and disposal are different bottlenecks

The two elimination audits widened the comparison beyond the proteasome. [Scientific Audits of Next-Generation Elimination](https://www.linkedin.com/pulse/datarich-insightpoor-scientific-audits-nextgeneration-ermelinda-damko-9i9ye) discussed vepdegestrant, SMARCA2-directed programs including PLX-61639 and PRT3789, and ferritin-based LYTAC examples; [Transport, RNA and Failure Modes](https://www.linkedin.com/pulse/datarich-insightpoor-scientific-audits-nextgeneration-ermelinda-damko-at3ue) asked how modality choice changes when the intervention acts on production rather than protein disposal. These are useful comparisons of causal pathways, not interchangeable entries in an E3 score matrix.

For a hypothetical protein at baseline steady state, complete synthesis arrest with unchanged first-order turnover gives \(T(t)/T_0=2^{-t/t_{1/2}}\). An 8-hour half-life therefore leaves 50% after 8 hours and 12.5% after 24 hours without any acceleration of degradation. The albumin-hitchhiking MMP13 siRNA example in the transport audit belongs to this production-side comparison, with delivery as an additional issue rather than evidence of E3 recruitment ([Transport, RNA and Failure Modes](https://www.linkedin.com/pulse/datarich-insightpoor-scientific-audits-nextgeneration-ermelinda-damko-at3ue)).

[EndoTags and the New Design Logic of Extracellular Degradation](https://www.linkedin.com/pulse/endotags-new-design-logic-extracellular-degradation-ermelinda-damko-fhs5e) supplies a different structural problem. The primary work uses receptor conformational triggering, receptor clustering, and constitutive trafficking through different engineered architectures, including IGF2R-, ASGPR-, sortilin-, and transferrin-receptor-directed designs ([Designed endocytosis-inducing proteins degrade targets and amplify signals](https://www.nature.com/articles/s41586-024-07948-2)). These receptors are not alternative E3 ligases.

The examples range from EGFR-directed constructs and atezolizumab–EndoTag PD-L1 targeting to protein G-mediated soluble IgG uptake and logic-gated assemblies ([EndoTags primary study](https://www.nature.com/articles/s41586-024-07948-2)). Their common requirement is not an exposed lysine facing E2, but a productive route from binding through uptake and sorting to net disposal. A convincing internalization result should therefore lead to questions about recycling, lysosomal delivery, and receptor replenishment rather than directly to a degradation claim.

The conjugate comparison in [Beyond Better Toxins: PEGS Boston](https://www.linkedin.com/pulse/beyond-better-toxins-what-pegs-boston-revealed-next-wave-damko-whnne) adds another upstream layer: antibody-guided delivery and payload architecture change how an intracellular effector becomes available. For a released degrader intended to act in the cytosol, the useful accounting must distinguish target-cell binding, internalization, release, and access to the compartment containing the target and ligase. Those events should not be absorbed into an apparently poor ternary affinity.

Putting these modalities beside one another is valuable precisely because their failure modes differ. The app's routing and synthesis-arrest illustrations are separate calculators, not alternative skins on the PROTAC equations. A common endpoint, less protein, does not imply a common rate-limiting step.

## The detector can manufacture apparent potency

The archived essay “Cellular Hocus Pocus” examined ratiometric transcriptional activation, in which depletion of an inhibitory fusion component releases an amplified transcriptional output. The work now has a Cell publication, while the detailed quantitative comparisons discussed here remain traceable to the open manuscript ([Cell publication](https://www.cell.com/cell/fulltext/S0092-8674(26)00936-0); [open manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)).

Across 12 selected monoclonal lines, GFP activation EC50 values ranged from 160 pM to 13 nM, an approximately 81-fold span; the most- and least-sensitive lines did not show a statistically significant difference in the reported degradation DC50 comparison ([open manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)). Failure to detect a significant difference is not proof of exact equivalence. It is nevertheless a direct warning against substituting reporter activation potency for a target-loss potency without calibrating their relationship.

This is not an argument against amplification. The study followed reporter discovery with endogenous UBE2S validation and CRBN-dependence experiments, demonstrating how a sensitive detector can be paired with orthogonal mechanistic evidence ([open manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)). The advantage is detection; the obligation is calibration.

The range of examples reinforces the point: active/inactive ACBI comparisons, LC-2, BCL6 polymerization-associated degradation, protein-based depletion systems, RNA interference, and EGFR downregulation can all be interrogated through the reporter architecture ([open manuscript](https://pmc.ncbi.nlm.nih.gov/articles/PMC13228303/)). They do not thereby become one chemical mechanism. A fusion-tag depletion experiment also does not establish that the corresponding untagged protein has a ligandable surface accessible to a new small molecule.

This creates a second inverse problem alongside kinetic identifiability. The observed dose response is a composition of biological response and detector response; if the detector is nonlinear, the fitted midpoint belongs to that composition. Before comparing two “potencies,” we need to know whether their numerator, denominator, time point, construct, and transfer function are actually the same.

## What I would measure first

The best defense against overinterpretation is not to measure everything. It is to choose the next measurement that separates explanations still consistent with the present result. I would begin with time-resolved endogenous target loss and a measured exposure history, then ask whether the same ordering appears in recruitment, early ubiquitination, and recovery.

For a geometry hypothesis, the highest-value addition is a perturbation that changes the proposed productive region while preserving recognition as far as possible. For an E3-availability hypothesis, localization or controlled abundance changes should be paired with target synthesis and exposure measurements. For a trafficking hypothesis, surface disappearance needs to be separated from total-protein loss and recycling. For a reporter hit, an orthogonal endogenous assay should establish what the amplified signal represents.

Washout is particularly useful when interpreted narrowly. In the app, drug disappears instantaneously and the remaining target returns toward baseline by first-order turnover, so

\[
T(t)=T_0+[T(t_w)-T_0]e^{-k_b(t-t_w)}
\quad\text{for }t\geq t_w.
\]

A real recovery trace that disagrees with this expression identifies a failed assumption, not a uniquely diagnosed cause. Residual exposure, persistent productive complexes, altered synthesis, or another state variable could all require an expanded model. Measuring one of those quantities independently is more decisive than fitting an additional unidentifiable rate.

There is also substantial positive evidence that carefully measured ternary properties can guide optimization. Wurz and colleagues found useful relationships between affinity, cooperativity, and degradation within matched experimental series, while also discussing permeability-related departures from simple affinity-based expectations ([Wurz et al., 2023](https://www.nature.com/articles/s41467-023-39904-5)). The correct response is to preserve the domain in which that relationship was established, not to reject structure–activity reasoning or extend it to every target and ligase.

## Using Ternary Check: from a structure to a discriminating experiment

[Open Ternary Check](https://datarichinsightpoor.github.io/ternary-check-public/) to explore the argument rather than take the calculations on trust. The browser workbench keeps four tasks separate: inspecting a deposited structure, testing a conditional kinetic model, reading the evidence behind an example, and examining E3-related records. It is designed to make the assumptions behind a conclusion visible, not to compress them into a predicted degradation score.

In Structure audit, begin with the bundled BRD4–MZ1–VHL example, retrieve another public PDB entry, or load a local PDB file. Select the target and partner chains, inspect the molecular view, and compare pair surface burial, terminal lysine-NZ exposure, residue proximity, and overlap flags under explicit settings. The [structural calculation script](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/src/science.js) contains the numerical rules, while the [worker script](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/src/worker.js) runs the structural analysis away from the main interface. These are two-chain geometric calculations: a displayed ligand is contextual information, not an occluding atom set in the pair-only surface calculation. Neither favorable burial nor an exposed lysine establishes productive ubiquitin transfer.

Mechanism lab asks a different question: what behavior follows if the supplied kinetic assumptions are true? Change target abundance, available E3, binary affinities, cooperativity, productive clearance, target half-life, exposure, or washout timing, then inspect the dose response and target time course. The [kinetics script](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/src/kinetics.js) implements the equilibrium calculation, target-turnover integration, and commitment-versus-dissociation diagnostic. The [equations and capacity argument in this article](#degradation-must-outrun-replacement) explain the model; the application's Methods view states its definitions and limitations. The structural and kinetic modules are intentionally not a prediction pipeline: a calculated interface does not silently supply an affinity or a productive-clearance rate.

A useful first exercise is to save the default hypothetical scenario, reduce available E3 from 30 to 3 nM, and compare the resulting target-loss curves without changing the structure. Figure 2 shows why that perturbation matters: the same assumed chemistry can operate under very different processing capacity. Next, compare continuous exposure with ideal washout and ask which additional measurement would distinguish residual drug from slow target replacement. Export the run as a Markdown dossier or CSV, and retain the input-session JSON if the calculation needs to be revisited. The purpose is an auditable chain from input to output to next experiment, not a ranking of compounds that were never experimentally compared.

The Examples view supplies biological context rather than fitted parameter sets. Its 88 records cover named degraders, controls, mechanistic comparators, and explicitly labeled extensions across the 14 retrieved articles, posts, and archive essays. The [article-to-case concordance](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/docs/ARTICLE-CONCORDANCE.md) traces those relationships, while the [case-library script](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/src/examples.js) preserves the evidence labels and illustrative inputs. Readers coming from [From Degradation Curves to Degradability Landscapes](https://www.linkedin.com/pulse/from-degradation-curves-degradability-landscapes-making-damko-qwkue), [The Mechanistic Void in Molecular Glue Design](https://www.linkedin.com/pulse/mechanistic-void-molecular-glue-design-ermelinda-damko-cbmze), or [EndoTags and the New Design Logic of Extracellular Degradation](https://www.linkedin.com/pulse/endotags-new-design-logic-extracellular-degradation-ermelinda-damko-fhs5e) can follow different mechanistic questions into the same workbench without treating those modalities as one model.

The E3 evidence view connects to a database by provenance, not by presenting a universal ligase score. Obtain the [known E3-interaction file from UbiBrowser](http://ubibrowser.bio-it.cn/ubibrowser_v3/Public/download/literature/literature.E3.txt) under the provider's terms, review its [database definitions](http://ubibrowser.bio-it.cn/ubibrowser_v3/home/document/index), and import the TSV locally; the app does not bundle the provider's interaction records. Species and component-role filters, source records, and file hashing help keep an imported result attached to its origin. An optional live UniProt lookup provides annotation for the requested gene or accession, not quantitative evidence that a particular cell contains a sufficient active E3 pool. The [evidence-integration script](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/src/evidence.js) makes these retrieval and import rules inspectable.

For reproducibility, the [repository guide](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/README.md) describes local use and build commands; the independent [surface-area cross-check](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/tests/crosscheck.py) and [kinetics cross-check](https://github.com/dataRichinsightPoor/ternary-check-public/blob/v0.2.4/tests/kinetics-crosscheck.py) expose how selected numerical results are tested against separate implementations. Local PDB contents are processed in the browser rather than uploaded by the application; optional external lookups contact their providers. Exported session JSON can contain the original coordinates and should therefore be handled with the same care as the input structure.

The tool and source are now public. Open the [GitHub Pages application](https://datarichinsightpoor.github.io/ternary-check-public/), browse the [MIT-licensed source repository](https://github.com/dataRichinsightPoor/ternary-check-public), or download the [v0.2.4 release](https://github.com/dataRichinsightPoor/ternary-check-public/releases/tag/v0.2.4), which includes a standalone HTML edition, source and site archives, verification receipts, and checksums. Code links above refer to the v0.2.4 release tag. The companion video records v0.2.3; the public edition retains its calculation code and adds clean-history distribution and updated documentation. Passing a numerical or browser test establishes specified software behavior, not prospective prediction of cellular degradation.

## Where the bottleneck moved

Across these examples, the bottleneck is not simply an insufficient number of structures. It is the missing connection between a measured state and the conditional flux out of that state: recognition into a productive configuration, ubiquitination into committed disposal, delivery into accessible exposure, or molecular loss into an interpretable readout.

Ternary Check deliberately stops before claiming those connections have been measured. Its structural audit asks whether a geometric statement survives changes in definitions and sampling. Its mechanism lab asks whether supplied assumptions can support the desired response. Its case library asks whether the evidence is recruitment, domain degradation, endogenous loss, a comparator, or an unresolved source conflict.

What would change my mind about withholding a general structure-to-degradation score is prospective performance on held-out chemical series and target–ligase systems, with specified endpoints, exposure and time, calibrated uncertainty, and clear reporting of where the model fails. A compelling system should also survive comparisons against simpler baselines and experimentally separate alternative explanations, rather than merely reproducing correlated labels.

Until then, the more useful ambition is narrower and more demanding. Make the observable precise, make the assumptions executable, and make the next discriminating experiment obvious. The complex is where the explanation begins; productive flux is what the explanation still has to earn.

## About this companion

This essay accompanies the public Ternary Check v0.2.4 release and its separate 88-case concordance; the figures and demonstration video were prepared with v0.2.3. The corpus includes 12 publicly linked articles/posts and two archive essays, “The Doorstop and the Three Clocks” and “Cellular Hocus Pocus,” whose public article URLs have not been confirmed; primary-study links are supplied without inventing archive links.

All numerical model examples here are synthetic calculations, not measured compound parameters. The software is a research-use audit and teaching workbench, not a validated cellular-efficacy predictor. The public repository begins with clean history and excludes the earlier private UbiBrowser snapshot; database users obtain and import the provider's file under its applicable terms.
