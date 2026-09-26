"""Independent surface-area cross-check using Biopython's ShrakeRupley."""
import io
import json
import subprocess
from Bio.PDB import PDBParser, ShrakeRupley

script = """
import {readFileSync} from 'node:fs';
import {parsePDB, analyze, RADII} from './src/science.js';
const p=parsePDB(readFileSync('public/data/5T35.pdb','utf8'));
console.log(JSON.stringify({clean:p.cleanPDB,radii:RADII,result:analyze(p,{target:'A',partner:'D',points:960})}));
"""
data = json.loads(subprocess.check_output(["node", "--input-type=module", "-e", script], text=True))
lines = [line for line in data["clean"].splitlines() if line.startswith("ATOM  ") and line[21] in "AD"]
parser = PDBParser(QUIET=True)
def surface(chains):
    model = parser.get_structure("pair", io.StringIO("\n".join(line for line in lines if line[21] in chains)))[0]
    sr = ShrakeRupley(probe_radius=1.4, n_points=960, radii_dict=data["radii"])
    sr.compute(model, level="M")
    return model.sasa

independent = (surface("A") + surface("D") - surface("AD")) / 2
ours = data["result"]["interfaceArea"]
relative_error = abs(ours-independent)/independent
result = {"points":960,"our_pair_interface_A2":ours,"biopython_pair_interface_A2":independent,
          "relative_difference":float(relative_error),"pass":bool(relative_error < .02),
          "note":"Same selected atom records and radii; independently implemented surface sampling."}
print(json.dumps(result, indent=2))
assert result["pass"], "Independent SASA discrepancy exceeded 2%."
