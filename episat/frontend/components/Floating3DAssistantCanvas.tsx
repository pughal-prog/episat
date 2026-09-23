"use client";

import React, { useEffect, useRef, useState } from "react";

interface Floating3DAssistantCanvasProps {
  size?: number;
}

export const Floating3DAssistantCanvas: React.FC<Floating3DAssistantCanvasProps> = ({ size = 64 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    // Check user accessibility setting for reduced motion
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let angle = 0;

    // 3D Particles for satellite orbital atmosphere
    const numParticles = 24;
    const particles = Array.from({ length: numParticles }, () => ({
      x: (Math.random() - 0.5) * 45,
      y: (Math.random() - 0.5) * 45,
      z: (Math.random() - 0.5) * 45,
      speed: 0.01 + Math.random() * 0.02,
      size: 1 + Math.random() * 1.5,
      alpha: 0.3 + Math.random() * 0.7
    }));

    // 3D Satellite Cube vertices
    const cubeVertices = [
      { x: -8, y: -8, z: -8 },
      { x: 8, y: -8, z: -8 },
      { x: 8, y: 8, z: -8 },
      { x: -8, y: 8, z: -8 },
      { x: -8, y: -8, z: 8 },
      { x: 8, y: -8, z: 8 },
      { x: 8, y: 8, z: 8 },
      { x: -8, y: 8, z: 8 }
    ];

    // 3D Cube Edges
    const cubeEdges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7]
    ];

    // Solar Panel 3D vertices (left and right wings)
    const panelLeft = [
      { x: -22, y: -5, z: 0 },
      { x: -9, y: -5, z: 0 },
      { x: -9, y: 5, z: 0 },
      { x: -22, y: 5, z: 0 }
    ];

    const panelRight = [
      { x: 9, y: -5, z: 0 },
      { x: 22, y: -5, z: 0 },
      { x: 22, y: 5, z: 0 },
      { x: 9, y: 5, z: 0 }
    ];

    const render = () => {
      ctx.clearRect(0, 0, size, size);
      const cx = size / 2;
      const cy = size / 2;
      const fov = 120;

      if (!reducedMotion) {
        angle += 0.02;
      }

      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);
      const cosB = Math.cos(angle * 0.7);
      const sinB = Math.sin(angle * 0.7);

      // Rotate point in 3D (Y-axis and X-axis rotation)
      const project = (p: { x: number; y: number; z: number }) => {
        // Y rotation
        let x1 = p.x * cosA - p.z * sinA;
        let z1 = p.x * sinA + p.z * cosA;
        // X rotation
        let y2 = p.y * cosB - z1 * sinB;
        let z2 = p.y * sinB + z1 * cosB;

        const distance = 90;
        const scale = fov / (fov + z2 + distance);
        return {
          x: cx + x1 * scale,
          y: cy + y2 * scale,
          z: z2,
          scale
        };
      };

      // 1. Draw Pulsing Outer Orbital Ring (Glow background)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.42, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(45, 212, 191, 0.4)"; // Teal brand
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.restore();

      // 2. Draw 3D Orbiting Atmosphere Particles
      particles.forEach((pt) => {
        if (!reducedMotion) {
          pt.y += Math.sin(angle) * 0.1;
        }
        const proj = project(pt);
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, pt.size * proj.scale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${pt.alpha * 0.8})`; // Amber gold glow
        ctx.fill();
      });

      // 3. Project and Draw Solar Panels
      const drawPolygon = (pts: { x: number; y: number; z: number }[], fillColor: string, strokeColor: string) => {
        const projPts = pts.map(project);
        ctx.beginPath();
        ctx.moveTo(projPts[0].x, projPts[0].y);
        for (let i = 1; i < projPts.length; i++) {
          ctx.lineTo(projPts[i].x, projPts[i].y);
        }
        ctx.closePath();
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1;
        ctx.stroke();
      };

      // Left Solar Panel (Cyan/Navy metallic)
      drawPolygon(panelLeft, "rgba(15, 118, 110, 0.85)", "#2dd4bf");
      // Right Solar Panel (Cyan/Navy metallic)
      drawPolygon(panelRight, "rgba(15, 118, 110, 0.85)", "#2dd4bf");

      // 4. Project and Draw Satellite Central Body Wireframe & Faces
      const projectedCube = cubeVertices.map(project);

      // Draw Edges
      ctx.beginPath();
      cubeEdges.forEach(([i, j]) => {
        ctx.moveTo(projectedCube[i].x, projectedCube[i].y);
        ctx.lineTo(projectedCube[j].x, projectedCube[j].y);
      });
      ctx.strokeStyle = "#fbbf24"; // Gold metallic edge
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // Draw Central Core Node
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.shadowColor = "#2dd4bf";
      ctx.shadowBlur = 8;

      if (!reducedMotion) {
        animationFrameId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, reducedMotion]);

  return (
    <div className="relative flex items-center justify-center w-full h-full">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="w-full h-full block pointer-events-none"
        aria-label="3D EpiSat Satellite AI Assistant Icon"
      />
    </div>
  );
};
