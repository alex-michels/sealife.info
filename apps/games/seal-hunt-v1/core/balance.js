// Screen fairness + gentle tempo (sizes, speeds, population)
export const BASE = { diag: 1000, area: 800 * 450 };

export const BAL = {
  diag: BASE.diag,
  area: BASE.area,

  fishSpeedMin: 60,
  fishSpeedMax: 90,

  sealSpeed: 200,
  sealAccel: 900,

  fishSizeK: 1,
  maxPreyCap: 24,

  // screen-aware prey escape tuning (filled in recomputeBalance)
  escape: {
    threatK: 6.0,
    burstImpulse: 160,
    steer: 280,
    maxBoost: 1.6,
    fleeHold: 0.22,
    restAfter: 1.60,
    dragHi: 0.985,
    dragLo: 0.998
  }
};


export function recomputeBalance(worldW, worldH) {
  BAL.diag = Math.hypot(worldW, worldH);
  BAL.area = worldW * worldH;

  const diagK = BAL.diag / BASE.diag;                 // ~0.6 phones → 1.0 base → 1.4+ large
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const norm = clamp((diagK - 0.6) / (1.4 - 0.6), 0, 1);  // 0 at small screens, 1 at large

  // Seal: keep snappy on phones (floors), scale mildly for large screens
  BAL.sealSpeed = Math.max(240, 200 * Math.pow(diagK, 0.9));
  BAL.sealAccel = Math.max(1000, 900 * Math.pow(diagK, 0.9));

  // Fish speeds: softer scaling on phones, still a gentle band overall
  const sMin = 58 * Math.pow(diagK, 0.75);
  const sMax = 88 * Math.pow(diagK, 0.75);
  BAL.fishSpeedMin = clamp(sMin, 55, 100);
  BAL.fishSpeedMax = Math.max(BAL.fishSpeedMin + 22, clamp(sMax, 78, 220));

  // Fish size: same logic as before
  BAL.fishSizeK = Math.max(0.75, Math.min(1.1, 0.75 + 0.25 * diagK));

  // Population cap: unchanged
  const softCap = 12 + Math.round(Math.sqrt(BAL.area) / 60);
  BAL.maxPreyCap = Math.max(12, Math.min(40, softCap));

  // —— Escape tuning scales with screen size:
  // Small screens → easier to catch (lower threat/impulse/boost)
  // Large screens  → full values (what you have now)
  BAL.escape.threatK      = 4.8  + (6.2  - 4.8)  * norm;  // 4.8..6.2
  BAL.escape.burstImpulse = 120  + (160  - 120)  * norm;  // 120..160
  BAL.escape.steer        = 220  + (280  - 220)  * norm;  // 220..280
  BAL.escape.maxBoost     = 1.25 + (1.60 - 1.25) * norm;  // 1.25..1.60
  BAL.escape.fleeHold     = 0.18 + (0.22 - 0.18) * norm;  // 0.18..0.22
  // keep restAfter/drag the same (feel is good)
}
