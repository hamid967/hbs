import { Fingerprint, Orbit, ShieldCheck, Sparkles } from "lucide-react";
import React, { useState } from "react";

type SceneTilt = { x: number; y: number };

export default function AuthSpatialScene() {
  const [tilt, setTilt] = useState<SceneTilt>({ x: 0, y: 0 });
  const updateTilt = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch") return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setTilt({ x: ((event.clientY - bounds.top) / bounds.height - 0.5) * -6, y: ((event.clientX - bounds.left) / bounds.width - 0.5) * 8 });
  };

  return <section aria-hidden="true" className="auth-spatial-scene" onPointerMove={updateTilt} onPointerLeave={() => setTilt({ x: 0, y: 0 })}>
    <div className="auth-scene-noise" />
    <div className="auth-scene-grid" />
    <div className="auth-scene-glow auth-scene-glow-emerald" />
    <div className="auth-scene-glow auth-scene-glow-gold" />
    <div className="auth-scene-stage" style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}>
      <div className="auth-orbit auth-orbit-one" />
      <div className="auth-orbit auth-orbit-two" />
      <div className="auth-orbit auth-orbit-three" />
      <div className="auth-node auth-node-top"><Sparkles className="size-4" /></div>
      <div className="auth-node auth-node-right"><Orbit className="size-4" /></div>
      <div className="auth-node auth-node-left"><Fingerprint className="size-4" /></div>
      <div className="auth-core"><div className="auth-core-inner"><span>هـ</span></div></div>
      <div className="auth-signal auth-signal-one" />
      <div className="auth-signal auth-signal-two" />
    </div>
    <div className="auth-scene-copy"><div className="auth-scene-rule" /><p>بوابة الوصول الخاصة</p><h2>حلول الغد<br />HR HBS</h2><span><ShieldCheck className="size-4" /> هوية محمية · وصول منظّم</span></div>
  </section>;
}
