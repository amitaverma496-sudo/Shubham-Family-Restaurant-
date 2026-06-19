"use client";
import React from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

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
