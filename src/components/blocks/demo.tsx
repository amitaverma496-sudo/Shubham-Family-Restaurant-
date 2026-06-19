import { HeroSection } from "./hero-section-dark"

function HeroSectionDemo() {
  return (
    <HeroSection
      title="Michelin-Class Culinary Masterpieces"
      subtitle={{
        regular: "Unveil the Ultimate ",
        gradient: "Royal Gourmet Masterclass",
      }}
      description="Voted Lucknow's No.1 luxury destination on Agra Expressway, where modern artistry blends seamlessly with historic Awadhi royal traditions."
      ctaText="Reserve Royal Table"
      ctaHref="#booking"
      bottomImage={{
        light: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
        dark: "https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1400&auto=format&fit=crop",
      }}
      gridOptions={{
        angle: 65,
        opacity: 0.2,
        cellSize: 60,
        lightLineColor: "#3B82F6",
        darkLineColor: "#1D4ED8",
      }}
    />
  )
}
export { HeroSectionDemo }
