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
  maxPreyCap: 24
};

export function recomputeBalance(worldW, worldH) {
  BAL.diag = Math.hypot(worldW, worldH);
  BAL.area = worldW * worldH;
  const diagK = BAL.diag / BASE.diag;

  // Seal: keep time-to-cross similar across screens
  BAL.sealSpeed = 200 * diagK;
  BAL.sealAccel = 900 * diagK;

  // Fish speeds: gentle band, scaled but clamped (no eye-strain flashes)
  const sMin = 60 * diagK, sMax = 90 * diagK;
  BAL.fishSpeedMin = Math.max(60, Math.min(100, sMin));
  BAL.fishSpeedMax = Math.max(BAL.fishSpeedMin + 20, Math.min(220, sMax));

  // FISH SIZE: smaller on small screens, a touch larger on huge screens
  // diagK=0.5 → 0.875, diagK=1 → 1.0, diagK=1.5 → 1.1 (capped)
  BAL.fishSizeK = Math.max(0.75, Math.min(1.1, 0.75 + 0.25 * diagK));

  // Population cap: sublinear with area → calm on 4K, not empty on phones
  const softCap = 12 + Math.round(Math.sqrt(BAL.area) / 60); // ~15 phone, ~35–40 desktop
  BAL.maxPreyCap = Math.max(12, Math.min(40, softCap));
}
