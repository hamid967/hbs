import { useEffect, useRef } from "react";
import * as THREE from "three";

/** مشهد زخرفي خفيف لتدفقات الطلبات والموافقات، لا يحمل أي بيانات عمل حساسة. */
export function HeroThreeScene() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
    camera.position.set(0, 0.2, 6.8);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.8));
    const key = new THREE.DirectionalLight(0xdaf3df, 3.2);
    key.position.set(3, 4, 5);
    scene.add(key);

    const group = new THREE.Group();
    scene.add(group);
    const geometry = new THREE.IcosahedronGeometry(0.72, 2);
    const core = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x1d5a40, metalness: 0.2, roughness: 0.28 }));
    core.position.set(0, 0.12, 0);
    group.add(core);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.34, 0.025, 12, 80), new THREE.MeshBasicMaterial({ color: 0x9ccfa7, transparent: true, opacity: 0.76 }));
    ring.rotation.set(0.92, 0.22, -0.35);
    group.add(ring);

    const satellites = [
      { position: new THREE.Vector3(-1.82, 0.78, 0.15), color: 0xe5c99d, size: 0.24 },
      { position: new THREE.Vector3(1.73, 0.56, -0.22), color: 0x4f9e70, size: 0.18 },
      { position: new THREE.Vector3(-1.28, -1.22, 0.18), color: 0x97c9a3, size: 0.15 },
      { position: new THREE.Vector3(1.2, -1.34, 0.12), color: 0xe5c99d, size: 0.13 },
    ];
    const satelliteMeshes = satellites.map((item) => {
      const mesh = new THREE.Mesh(new THREE.SphereGeometry(item.size, 24, 24), new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.35, metalness: 0.08 }));
      mesh.position.copy(item.position);
      group.add(mesh);
      return mesh;
    });

    const connectorMaterial = new THREE.LineBasicMaterial({ color: 0x76ab83, transparent: true, opacity: 0.4 });
    satellites.forEach((item) => {
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints([core.position, item.position]), connectorMaterial);
      group.add(line);
    });

    const cursor = { x: 0, y: 0 };
    const onMove = (event: PointerEvent) => {
      const bounds = host.getBoundingClientRect();
      cursor.x = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 0.65;
      cursor.y = -((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 0.4;
    };
    host.addEventListener("pointermove", onMove);

    const resize = () => {
      const { width, height } = host.getBoundingClientRect();
      renderer.setSize(width, height, false);
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    };
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    resize();

    let frame = 0;
    let raf = 0;
    const render = () => {
      const elapsed = performance.now() * 0.00055;
      group.rotation.y += (cursor.x - group.rotation.y) * 0.035;
      group.rotation.x += (cursor.y - group.rotation.x * 0.45) * 0.035;
      if (!reducedMotion) {
        core.rotation.y += 0.008;
        ring.rotation.z += 0.002;
        satelliteMeshes.forEach((mesh, index) => { mesh.position.y += Math.sin(elapsed * 2 + index) * 0.002; });
      }
      renderer.render(scene, camera);
      if (!reducedMotion || frame < 2) {
        frame += 1;
        raf = requestAnimationFrame(render);
      }
    };
    render();

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      host.removeEventListener("pointermove", onMove);
      geometry.dispose();
      ring.geometry.dispose();
      connectorMaterial.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 z-0 cursor-crosshair opacity-90" />;
}
