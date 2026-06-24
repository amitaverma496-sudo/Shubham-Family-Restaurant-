import * as React from "react"
import { cn } from "../../lib/utils"
import { ChevronRight } from "lucide-react"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"

interface Interactive3DTextProps {
  regularText: string;
  gradientText: string;
}

const Interactive3DText: React.FC<Interactive3DTextProps> = ({ regularText, gradientText }) => {
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 140, mass: 1 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [18, -18]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-18, 18]), springConfig);
  
  const containerRectRef = React.useRef<DOMRect | null>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRectRef.current && containerRef.current) {
      containerRectRef.current = containerRef.current.getBoundingClientRect();
    }
    const rect = containerRectRef.current;
    if (!rect) return;
    const width = rect.width;
    const height = rect.height;
    
    const relativeX = (e.clientX - rect.left) / width - 0.5;
    const relativeY = (e.clientY - rect.top) / height - 0.5;
    
    x.set(relativeX);
    y.set(relativeY);
  };
  
  const handleMouseLeave = () => {
    containerRectRef.current = null;
    x.set(0);
    y.set(0);
  };

  const wordVariants = {
    hidden: { opacity: 0, y: 50, rotateX: -75, scale: 0.9, z: -100 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotateX: 0,
      scale: 1,
      z: 0,
      transition: {
        type: "spring" as const,
        damping: 14,
        stiffness: 90,
        duration: 0.8
      }
    }
  };

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const words = regularText.split(" ");

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative cursor-pointer select-none [perspective:1200px] py-4 w-full"
    >
      <motion.div
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
        }}
        className="w-full h-full relative"
      >
        {/* Shadow layer for depth */}
        <div
          style={{
            transform: "translateZ(-30px)",
            filter: "blur(12px)",
          }}
          className="absolute inset-0 text-3xl sm:text-5xl font-serif font-extrabold tracking-tight text-black/40 select-none pointer-events-none flex flex-col items-center justify-center text-center leading-none"
        >
          <span>{regularText}</span>
          <span className="block mt-2">{gradientText}</span>
        </div>

        {/* Core Foreground Interactive Text */}
        <motion.h2
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          style={{
            transformStyle: "preserve-3d",
            transform: "translateZ(40px)",
          }}
          className="text-3xl sm:text-5xl font-serif font-extrabold tracking-tight mx-auto md:text-7xl leading-tight text-white text-center"
        >
          {/* Main regular words */}
          <span 
            style={{ transformStyle: "preserve-3d" }}
            className="bg-clip-text text-transparent bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.3)_200%)] dark:bg-[linear-gradient(180deg,_#FFF_0%,_rgba(255,_255,_255,_0.40)_202.08%)] flex flex-wrap justify-center gap-x-3 gap-y-1"
          >
            {words.map((word, i) => (
              <motion.span
                key={i}
                variants={wordVariants}
                className="inline-block origin-bottom [transform-style:preserve-3d]"
              >
                {word}
              </motion.span>
            ))}
          </span>

          {/* Subtitle/gradient line */}
          <motion.span
            initial={{ opacity: 0, scale: 0.85, rotateX: 60, y: 30 }}
            animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
            transition={{ delay: 0.35, type: "spring" as const, stiffness: 95, damping: 13 }}
            style={{ 
              transformStyle: "preserve-3d",
              transform: "translateZ(65px)",
            }}
            className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-teal-300 dark:from-blue-400 dark:to-teal-300 block mt-3 drop-shadow-[0_5px_15px_rgba(59,130,246,0.25)] font-serif italic"
          >
            {gradientText}
          </motion.span>
        </motion.h2>
      </motion.div>
    </div>
  );
};

interface HeroSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string
  subtitle?: {
    regular: string
    gradient: string
  }
  description?: string
  ctaText?: string
  ctaHref?: string
  bottomImage?: {
    light: string
    dark: string
  }
  gridOptions?: {
    angle?: number
    cellSize?: number
    opacity?: number
    lightLineColor?: string
    darkLineColor?: string
  }
}

const RetroGrid = ({
  angle = 65,
  cellSize = 60,
  opacity = 0.5,
  lightLineColor = "gray",
  darkLineColor = "gray",
}) => {
  const gridStyles = {
    "--grid-angle": `${angle}deg`,
    "--cell-size": `${cellSize}px`,
    "--opacity": opacity,
    "--light-line": lightLineColor,
    "--dark-line": darkLineColor,
  } as React.CSSProperties

  return (
    <div
      className={cn(
        "pointer-events-none absolute size-full overflow-hidden [perspective:200px]",
        `opacity-[var(--opacity)]`,
      )}
      style={gridStyles}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div className="animate-grid [background-image:linear-gradient(to_right,var(--light-line)_1px,transparent_0),linear-gradient(to_bottom,var(--light-line)_1px,transparent_0)] [background-repeat:repeat] [background-size:var(--cell-size)_var(--cell-size)] [height:300vh] [inset:0%_0px] [margin-left:-200%] [transform-origin:100%_0_0] [width:600vw] dark:[background-image:linear-gradient(to_right,var(--dark-line)_1px,transparent_0),linear-gradient(to_bottom,var(--dark-line)_1px,transparent_0)]" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-white to-transparent to-90% dark:from-black" />
    </div>
  )
}

const HeroSection = React.forwardRef<HTMLDivElement, HeroSectionProps>(
  (
    {
      className,
      title = "Build products for everyone",
      subtitle = {
        regular: "Designing your projects faster with ",
        gradient: "the largest figma UI kit.",
      },
      description = "Sed ut perspiciatis unde omnis iste natus voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae.",
      ctaText = "Browse courses",
      ctaHref = "#",
      bottomImage = {
        light: "https://farmui.vercel.app/dashboard-light.png",
        dark: "https://farmui.vercel.app/dashboard.png",
      },
      gridOptions,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative overflow-hidden w-full max-w-full", className)} ref={ref} {...props}>
        <div className="absolute top-0 z-[0] h-screen w-screen bg-blue-950/10 dark:bg-blue-950/10 bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(59,130,246,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_20%_80%_at_50%_-20%,rgba(59,130,246,0.3),rgba(255,255,255,0))]" />
        <section className="relative max-w-full mx-auto z-1 overflow-hidden">
          <RetroGrid {...gridOptions} />
          <div className="max-w-screen-xl z-10 mx-auto px-4 py-28 gap-12 md:px-8">
            <div className="space-y-5 max-w-3xl leading-0 lg:leading-8 mx-auto text-center">
              <h1 className="text-xs uppercase md:text-sm text-blue-400 group font-display mx-auto px-5 py-2.5 bg-gradient-to-tr from-zinc-300/5 via-blue-500/10 to-transparent border-[1px] border-blue-500/20 dark:border-white/5 rounded-3xl w-fit flex items-center gap-1">
                {title}
                <ChevronRight className="inline w-4 h-4 ml-1 group-hover:translate-x-1 duration-300" />
              </h1>
              <Interactive3DText 
                regularText={subtitle.regular} 
                gradientText={subtitle.gradient} 
              />
              <p className="max-w-2xl mx-auto text-gray-400 text-xs md:text-sm tracking-wide uppercase font-mono">
                {description}
              </p>
              <div className="items-center justify-center gap-x-3 space-y-3 sm:flex sm:space-y-0 pt-4">
                <span className="relative inline-block overflow-hidden rounded-full p-[1.5px]">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#3B82F6_0%,#1D4ED8_50%,#3B82F6_100%)]" />
                  <div className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-black/80 backdrop-blur-3xl">
                    <a
                      href={ctaHref}
                      className="inline-flex rounded-full text-center group items-center w-full justify-center text-xs font-bold uppercase tracking-widest text-white hover:text-blue-400 transition-all sm:w-auto py-3.5 px-8"
                    >
                      {ctaText}
                    </a>
                  </div>
                </span>
              </div>
            </div>
            {bottomImage && (
              <div className="mt-20 md:mt-32 max-w-4xl mx-auto px-2 relative z-10 overflow-hidden rounded-3xl border border-white/10 shadow-[0_20px_60px_rgba(59,130,246,0.15)] bg-lux-card p-1">
                <img
                  referrerPolicy="no-referrer"
                  src={bottomImage.dark}
                  className="w-full h-auto shadow-2xl rounded-2xl object-cover aspect-video md:aspect-[21/9]"
                  alt="Elegant gourmet meal rendering"
                />
              </div>
            )}
          </div>
        </section>
      </div>
    )
  },
)
HeroSection.displayName = "HeroSection"

export { HeroSection }
