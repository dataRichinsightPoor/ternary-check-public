// Illustrative rapid-equilibrium PROTAC model, not a fitted or validated predictor.
export const KDEFAULTS = { target: 100, e3: 30, kt: 100, ke: 100, alpha: 5, kpr: 1.2, half: 8, dose: 100, hours: 24, wash: 8, off: 6, commit: 12 };

// Free intracellular drug d is clamped. Protein mass balances are exact.
// X = c(T-X)(E-X), c = alpha*d / ((Kt+d)(Ke+d)).
export function equilibrium(T, E, d, Kt, Ke, alpha) {
  if (d <= 0 || E <= 0 || T <= 0 || alpha <= 0) return { ternary: 0, freeTarget: T/(1+d/Kt), binaryTarget: T*d/(Kt+d), freeE3: E/(1+d/Ke) };
  const c = alpha*d/((Kt+d)*(Ke+d));
  const b = 1+c*(T+E);
  const discriminant = 1 + 2*c*(T+E) + c*c*(T-E)**2;
  const x = 2*c*T*E/(b+Math.sqrt(discriminant));
  return { ternary: x, freeTarget: (T-x)/(1+d/Kt), binaryTarget: (T-x)*d/(Kt+d), freeE3: (E-x)/(1+d/Ke) };
}

export function simulate(p, dose = p.dose, washout = false, retain = true) {
  const basal = Math.LN2/p.half, synth = basal*p.target;
  const steps = Math.ceil(p.hours/Math.min(0.04, 0.3/(basal+p.kpr)));
  const dt = p.hours/steps;
  let target = p.target;
  const out = [];
  const deriv = (t, d) => synth-basal*t-p.kpr*equilibrium(Math.max(0,t),p.e3,d,p.kt,p.ke,p.alpha).ternary;
  const stride = Math.max(1,Math.floor(steps/180));
  for (let i=0;i<=steps;i++) {
    const time = i*dt, d = washout && time >= p.wash ? 0 : dose;
    if (retain && (i%stride===0 || i===steps)) out.push({ time, remaining: target/p.target*100, ternary: equilibrium(target,p.e3,d,p.kt,p.ke,p.alpha).ternary });
    if (i===steps) break;
    // Split an integration step exactly at washout.
    const advance = (h,drug) => {
      const k1=deriv(target,drug), k2=deriv(target+h*k1/2,drug), k3=deriv(target+h*k2/2,drug), k4=deriv(target+h*k3,drug);
      target = Math.max(0,target+h*(k1+2*k2+2*k3+k4)/6);
    };
    if (washout && time < p.wash && time+dt > p.wash) { advance(p.wash-time,dose); advance(time+dt-p.wash,0); }
    else advance(dt,d);
  }
  const eq = equilibrium(target,p.e3,washout && p.hours>=p.wash ? 0 : dose,p.kt,p.ke,p.alpha);
  return { remaining: target/p.target*100, loss: 100*(1-target/p.target), activeLoss: 100*(1-eq.freeTarget/p.target), series: out };
}

export function mechanism(p) {
  // dc/dd has the sign of Kt*Ke-d². Include that equilibrium maximum
  // and the user's dose, rather than letting a coarse grid miss both.
  const doses = [...new Set([
    ...Array.from({length:49},(_,i) => 10**(-2+i*7/48)),
    p.dose, Math.sqrt(p.kt*p.ke)
  ])].sort((a,b)=>a-b);
  const doseCurve = doses.map(dose => {
    const r = simulate(p,dose,false,false);
    return { dose, degradation:r.loss, inhibition:r.activeLoss, ternary:equilibrium(p.target,p.e3,dose,p.kt,p.ke,p.alpha).ternary };
  });
  const best = doseCurve.reduce((a,b)=>b.degradation>a.degradation ? b : a);
  const heatmap=[];
  for(let y=0;y<10;y++) for(let x=0;x<14;x++) {
    const kt=10**(x*4/13), kpr=10**(-2+(9-y)*3/9);
    heatmap.push({x,y,kt,kpr,loss:simulate({...p,kt,kpr},p.dose,false,false).loss});
  }
  return { doseCurve, best, continuous:simulate(p), pulse:simulate(p,p.dose,true), heatmap,
    commitment:p.commit/(p.commit+p.off), dwell:60/p.off, turnover:Math.LN2/p.half };
}
