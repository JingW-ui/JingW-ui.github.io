export const TAU = Math.PI * 2;
export const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = t => { const x = clamp(t); return x*x*(3-2*x); };
export const hash = n => { const x = Math.sin(n*127.1+311.7)*43758.5453; return x-Math.floor(x); };

export function roundedRect(ctx,x,y,w,h,r=12) {
  ctx.beginPath(); ctx.roundRect(x,y,w,h,r);
}
