"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";
import NeuralBackground from "@/components/ui/flow-field-background";

export function HeroScrollDemo() {
  return (
    <div className="flex flex-col overflow-hidden pb-[100px] pt-[100px] bg-black bg-gradient-to-b from-black to-zinc-950">
      <ContainerScroll
        titleComponent={
          <div className="space-y-4">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-white uppercase tracking-wider">
              Experience the Sublime <br />
              <span className="text-4xl md:text-[5rem] font-serif font-extrabold text-gold mt-2 leading-none block drop-shadow-lg">
                Art of Gastronomy
              </span>
            </h1>
            <p className="max-w-xl mx-auto text-xs md:text-sm text-white/50 tracking-widest uppercase font-mono mt-4">
              Scroll down to step into the sanctuary of elite fine dining
            </p>
          </div>
        }
      >
        <img
          src="https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop"
          alt="luxury fine dining hero presentation"
          className="mx-auto rounded-xl object-cover h-full w-full object-center select-none"
          draggable={false}
          referrerPolicy="no-referrer"
        />
      </ContainerScroll>
    </div>
  );
}

export default function NeuralHeroDemo() {
  return (
    // Container must have a defined height, or use h-screen
    <div className="relative w-full h-screen">
      <NeuralBackground 
        color="#D4AF37" // Beautiful signature gold accent matching the luxury brand
        scale={1}
        trailOpacity={0.1} // Lower = longer trails
        speed={0.8}
      />
      {/* Premium Content Overlay on the integrated Demo */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10 px-4 bg-black/40">
        <span className="text-gold uppercase font-mono tracking-[0.4em] text-xs mb-2">Computational Gastronomy</span>
        <h2 className="font-serif text-3xl md:text-6xl text-white uppercase tracking-wider max-w-4xl leading-tight">
          Modern Culinary Innovation
        </h2>
        <div className="w-12 h-[1px] bg-gold my-6" />
        <p className="text-gray-400 font-sans tracking-wide max-w-lg text-xs md:text-sm uppercase leading-relaxed font-mono">
          Interactive flow-field grids resembling fluid organic micro-systems and thermodynamic plating heatmaps.
        </p>
      </div>
    </div>
  );
}

