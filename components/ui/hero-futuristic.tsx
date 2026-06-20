'use client';

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';
import { Sparkles, Zap, ChevronUp } from 'lucide-react';
import NeuralBackground from './flow-field-background';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add
} from 'three/tsl';

// High-resolution artistic gold platter texture map representation
const TEXTUREMAP = { src: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=600&auto=format&fit=crop' }; 
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

extend(THREE as any);

// Post Processing component
const PostProcessing = ({
  strength = 1.2,
  threshold = 0.85,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    try {
      const postProcessing = new THREE.PostProcessing(gl as any);
      const scenePass = pass(scene, camera);
      const scenePassColor = scenePass.getTextureNode('output');
      const bloomPass = bloom(scenePassColor, strength, 0.4, threshold);

      // Create the scanning effect uniform
      const uScanProgress = uniform(0);
      progressRef.current = uScanProgress;

      // Create a gold/blue premium scan line overlay
      const scanPos = float(uScanProgress.value);
      const uvY = uv().y;
      const scanWidth = float(0.04);
      const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
      const goldOverlay = vec3(0.23, 0.51, 0.96).mul(oneMinus(scanLine)).mul(0.35); // Blue-cyan light trace

      // Mix the original scene with the glowing overlay
      const withScanEffect = mix(
        scenePassColor,
        add(scenePassColor, goldOverlay),
        fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
      );

      // Add bloom effect after scan effect
      const final = withScanEffect.add(bloomPass);

      postProcessing.outputNode = final;
      return postProcessing;
    } catch (e) {
      console.warn("Postprocessing initialization skipped", e);
      return null;
    }
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    if (render && progressRef.current) {
      progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.4) * 0.5 + 0.5);
      (render as any).renderAsync();
    }
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = ({ onLoadError }: { onLoadError: () => void }) => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.015;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap;

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.r.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(3.7, 5.1, 9.6)); // Premium color matrix overlay

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    if (uniforms) {
      uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.4) * 0.5 + 0.5);
    }
    // Smooth transition
    if (meshRef.current && 'material' in meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          visible ? 1 : 0,
          0.05
        );
      }
    }
  });

  useFrame(({ pointer }) => {
    if (uniforms && uniforms.uPointer) {
      uniforms.uPointer.value = pointer;
    }
  });

  const scaleFactor = 0.45;
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export const Futuristic3DHeroBackdrop = () => {
  const [webGpuError, setWebGpuError] = useState<string | null>(null);
  const [platingIntensity, setPlatingIntensity] = useState<number>(0.8);
  const [activeLayer, setActiveLayer] = useState<'Molecular' | 'Thermodynamic' | 'Chroma'>('Molecular');

  // Handle browser compatibility
  const handleWebGpuFailure = (err: any) => {
    console.warn("WebGPU initialization failed fallback triggered.", err);
    setWebGpuError(err?.message || "WebGPU fallback");
  };

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden select-none z-[1] pointer-events-none">
      
      {/* 3D Canvas Layer */}
      <div className="absolute inset-0 w-full h-full z-10 pointer-events-auto">
        {!webGpuError ? (
          <div className="w-full h-full transition-opacity duration-1000 opacity-60">
            <Canvas
              flat
              gl={async (props) => {
                try {
                  const renderer = new THREE.WebGPURenderer({ ...props, antialias: true } as any);
                  await renderer.init();
                  return renderer;
                } catch (e) {
                  handleWebGpuFailure(e);
                  throw e;
                }
              }}
              onError={(e) => handleWebGpuFailure(e)}
            >
              <PostProcessing fullScreenEffect={true} strength={platingIntensity} />
              <Scene onLoadError={() => setWebGpuError("Texture error")} />
            </Canvas>
          </div>
        ) : (
          // Elegant responsive gold flow-field fallback
          <div className="w-full h-full">
            <NeuralBackground 
              color="#D4AF37" 
              trailOpacity={0.16}
              particleCount={250}
              speed={0.5}
              scale={1.1}
              className="w-full h-full opacity-55"
            />
          </div>
        )}
      </div>

      {/* Embedded Hologram Controls HUD (Floating absolutely at bottom left of hero section) */}
      <div className="absolute bottom-6 right-6 z-30 pointer-events-auto hidden md:flex flex-col gap-3">
        <div className="glass px-5 py-3.5 rounded-2xl border border-white/10 shadow-2xl backdrop-blur-xl flex flex-col gap-3 max-w-[280px]">
          
          {/* Diagnostic top line */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-gold opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-gold"></span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-gold uppercase font-bold">
                {webGpuError ? "HD PARTICLE FIELD" : "SENSORY 3D RENDER"}
              </span>
            </div>
            <span className="text-[8px] font-mono text-white/40">v2.1a</span>
          </div>

          {/* Slider input */}
          <div className="space-y-1">
            <div className="flex justify-between items-center text-[8px] font-mono text-white/70 uppercase tracking-widest">
              <span>Hologram Warp</span>
              <span>{Math.round(platingIntensity * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.3" 
              max="1.7" 
              step="0.1"
              value={platingIntensity} 
              onChange={(e) => setPlatingIntensity(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold"
            />
          </div>

          {/* Molecular layer selections */}
          <div className="flex items-center justify-between gap-1 bg-black/40 p-0.5 rounded-lg border border-white/5">
            {(['Molecular', 'Chroma'] as const).map((layer) => (
              <button
                key={layer}
                onClick={() => setActiveLayer(layer)}
                className={`flex-1 text-center py-1 rounded text-[8px] font-mono uppercase tracking-wider transition-all cursor-pointer ${activeLayer === layer ? 'bg-gold text-white font-bold' : 'text-white/40 hover:text-white'}`}
              >
                {layer}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
};

export default Futuristic3DHeroBackdrop;
