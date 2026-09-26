"""Independent continuous and exact post-washout checks; run from repo root."""
import json
import subprocess
import math
from scipy.integrate import solve_ivp

script = """
import {KDEFAULTS,simulate} from './src/kinetics.js';
const rows=[];let seed=417;
const u=()=>((seed=(1664525*seed+1013904223)>>>0)/2**32);
for(let i=0;i<100;i++){
 const p={...KDEFAULTS,target:10**(-1+5*u()),e3:10**(-1+5*u()),
 kt:10**(-1+5*u()),ke:10**(-1+5*u()),alpha:10**(-2+4*u()),
 kpr:10*u(),half:.25+199.75*u(),dose:10**(-2+7*u()),hours:1+71*u()};
 p.wash=p.hours*u();
 rows.push({p,value:simulate(p).remaining,pulse:simulate(p,p.dose,true).remaining});
}
console.log(JSON.stringify(rows));
"""
rows = json.loads(subprocess.check_output(
    ['node', '--input-type=module', '-e', script], text=True))
errors = []
pulse_errors = []
for row in rows:
    p = row['p']
    basal = math.log(2) / p['half']
    c = p['alpha'] * p['dose'] / ((p['kt']+p['dose']) * (p['ke']+p['dose']))
    def rate(time, y):
        target, e3 = y[0], p['e3']
        b = 1 + c*(target+e3)
        x = 2*c*target*e3/(b+math.sqrt(1+2*c*(target+e3)+c*c*(target-e3)**2))
        return [basal*(p['target']-target)-p['kpr']*x]
    independent = solve_ivp(rate, [0,p['hours']], [p['target']],
                            method='DOP853', rtol=1e-10, atol=1e-12)
    assert independent.success
    errors.append(abs(row['value']-100*independent.y[0,-1]/p['target']))
    at_wash = solve_ivp(rate, [0,p['wash']], [p['target']],
                       method='DOP853', rtol=1e-10, atol=1e-12)
    assert at_wash.success
    # After ideal washout X=0; exact recovery gives an independent check
    # of the step split as well as the drug-free part of the integrator.
    final = p['target'] + (at_wash.y[0,-1]-p['target'])*math.exp(
        -basal*(p['hours']-p['wash']))
    pulse_errors.append(abs(row['pulse']-100*final/p['target']))
result = {
    'cases':len(rows), 'seed':417, 'independentIntegrator':'SciPy DOP853',
    'maxAbsoluteDifferencePercentagePoints':float(max(errors)),
    'washoutCases':len(pulse_errors),
    'maxWashoutDifferencePercentagePoints':float(max(pulse_errors)),
    'pass':bool(max(errors)<.01 and max(pulse_errors)<.01),
    'scope':'Continuous exposure versus SciPy DOP853 and pulse versus DOP853 plus exact exponential recovery; not biological validation.'
}
print(json.dumps(result,indent=2))
assert result['pass']
