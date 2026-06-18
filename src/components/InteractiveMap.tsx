import { useState } from 'react';
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps';
import { Navigation, MapPin, Compass, Sparkles, ExternalLink, Settings, X } from 'lucide-react';

const API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';

const hasValidKey = Boolean(API_KEY) && API_KEY !== 'YOUR_API_KEY';

// Exact coordinates of Shubham Family Restaurant & Hotel, Agra Expressway, Lucknow
const SHUBHAM_COORDS = { lat: 26.8849767, lng: 80.825135 };
// Robust universal Google Maps query to prevent "Dynamic Link Not Found" firebase errors
const GOOGLE_MAPS_REDIRECT_URL = "https://www.google.com/maps/search/?api=1&query=Shubham+Family+Restaurant+%26+Hotel+Agra+Expressway+Lucknow";

export default function InteractiveMap() {
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [infoWindowOpen, setInfoWindowOpen] = useState(true);
  const [mapType, setMapType] = useState<'roadmap' | 'satellite' | 'hybrid'>('roadmap');
  const [showKeyGuide, setShowKeyGuide] = useState(false);

  // Default fallback: Render a beautiful, full-scale, completely interactive embedded map
  if (!hasValidKey) {
    return (
      <div className="w-full h-full min-h-[440px] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-black flex flex-col group">
        
        {/* Fully Interactive Fallback Map (100% clean and clear of any graphics/floating boxes on top) */}
        {!showKeyGuide ? (
          <div className="flex flex-col h-full w-full flex-1">
            
            {/* The Map itself - completely free of overlays inside */}
            <div className="w-full flex-1 min-h-[300px] relative">
              <iframe
                title="Shubham Family Restaurant & Hotel Lucknow interactive location Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d14234.331238699478!2d80.82513498835467!3d26.88497678550742!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x399bffae24e6ebb5%3A0x6bba847c2faee249!2sShubham%20Family%20Restaurant%20%26%20Hotel!5e0!3m2!1sen!2sin!4v1718712395648!5m2!1sen!2sin"
                className="w-full h-full border-0 grayscale brightness-90 contrast-[1.02] hover:grayscale-0 transition-all duration-700"
                loading="lazy"
                referrerPolicy="no-referrer"
                allowFullScreen
              />
            </div>

            {/* Clear External Layout Bar (Placed fully EXTERNAL below map so no content overlays the streets) */}
            <div className="bg-black/95 border-t border-white/10 p-4 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="flex gap-2.5 items-center">
                <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/45 flex items-center justify-center shrink-0">
                  <MapPin className="w-3.5 h-3.5 text-gold" />
                </div>
                <div className="text-left">
                  <h4 className="font-serif text-[11px] font-extrabold tracking-wider text-white uppercase leading-none">
                    Agra Expressway Entrance
                  </h4>
                  <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase mt-0.5">
                    Shri Tilak Complex, Lucknow
                  </p>
                </div>
              </div>

              {/* Action buttons completely off the map */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <a 
                  href={GOOGLE_MAPS_REDIRECT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gold hover:bg-gold/80 text-black font-sans font-black tracking-widest text-[10px] uppercase px-4 py-2 rounded-xl shadow-lg transition-all hover:scale-103 active:scale-97 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
                >
                  Get Directions
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                <button
                  onClick={() => setShowKeyGuide(true)}
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/15 flex items-center justify-center hover:border-gold hover:bg-black text-white hover:text-gold transition-all cursor-pointer shrink-0"
                  title="Configure API Key"
                >
                  <Settings className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        ) : (
          /* Sleek in-app private API configuration panel */
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md z-30 flex flex-col justify-center items-center p-6 text-center">
            <button 
              onClick={() => setShowKeyGuide(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 border border-white/10 hover:border-gold hover:text-gold flex items-center justify-center text-white cursor-pointer transition-all"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="max-w-md mx-auto space-y-4">
              <div className="w-10 h-10 rounded-full bg-gold/10 border border-gold/30 flex items-center justify-center mx-auto">
                <Compass className="w-5 h-5 text-gold animate-pulse" />
              </div>
              <h3 className="font-serif text-base tracking-widest text-gold uppercase">Advanced Google Maps SDK API Configuration</h3>
              <p className="text-[11px] text-white/70 tracking-wide leading-relaxed uppercase">
                Using a custom Google Maps Platform API key loads custom map themes, dynamic marker interactions, and Google cloud styling.
              </p>

              <div className="text-left bg-black/80 border border-white/10 rounded-xl p-4 text-[10px] space-y-2 font-mono tracking-wide">
                <p className="text-gold font-bold uppercase flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-gold shrink-0" /> Steps to set your secret API key:</p>
                <ol className="list-decimal pl-4 space-y-1.5 uppercase text-[9px] text-white/60">
                  <li>Get your dynamic Maps key at <a href="https://console.cloud.google.com/google/maps-apis/start?utm_campaign=gmp-code-assist-ais" target="_blank" rel="noopener noreferrer" className="text-gold underline hover:text-white">console.cloud.google.com</a></li>
                  <li>In the top right workspace menus, click the <strong>Settings</strong> (⚙️ gear icon)</li>
                  <li>Select <strong>Secrets</strong></li>
                  <li>Define name as <code className="text-gold select-all">GOOGLE_MAPS_PLATFORM_KEY</code></li>
                  <li>Paste the key credentials & hit save !</li>
                </ol>
              </div>

              <button 
                onClick={() => setShowKeyGuide(false)}
                className="px-4 py-1.5 bg-white/5 border border-white/15 hover:border-gold rounded-full text-[9px] font-mono tracking-widest text-white hover:text-gold uppercase cursor-pointer transition-all"
              >
                Return to Active Map View
              </button>
            </div>
          </div>
        )}

      </div>
    );
  }

  // Fallback safe: If premium credentials exist, render premium vector map
  return (
    <div className="w-full h-full min-h-[440px] rounded-3xl border border-white/10 overflow-hidden relative shadow-2xl bg-black flex flex-col group">
      
      {/* Real Interactive SDK Map Provider */}
      <div className="w-full flex-1 min-h-[300px]">
        <APIProvider apiKey={API_KEY} version="weekly">
          <Map
            defaultCenter={SHUBHAM_COORDS}
            defaultZoom={15}
            mapTypeId={mapType}
            mapId="SHUBHAM_LUXURY_MAP_ID"
            style={{ width: '100%', height: '100%' }}
            gestureHandling="cooperative"
            disableDefaultUI={true}
          >
            {/* Custom Interactive Marker with InfoWindow ref anchor */}
            <AdvancedMarker 
              ref={markerRef} 
              position={SHUBHAM_COORDS} 
              onClick={() => setInfoWindowOpen(prev => !prev)}
            >
              <Pin 
                background="#D4AF37" 
                glyphColor="#0A0A0A" 
                borderColor="#FFF0D4"
                scale={1.2}
              />
            </AdvancedMarker>

            {/* Info Window providing valuable address, time, and luxury features */}
            {infoWindowOpen && (
              <InfoWindow 
                anchor={marker} 
                onCloseClick={() => setInfoWindowOpen(false)}
                headerDisabled
              >
                <div className="p-3 bg-black text-white rounded-xl border border-gold/30 max-w-[240px] space-y-1.5 select-none">
                  <div className="flex items-center gap-1.5">
                    <div className="w-5.5 h-5.5 bg-gold rounded-full flex items-center justify-center font-bold text-black text-[9px]">S</div>
                    <div>
                      <h4 className="font-serif text-xs font-black text-gold uppercase tracking-wider leading-none">SHUBHAM</h4>
                    </div>
                  </div>
                  
                  <div className="h-[1px] bg-white/10" />

                  <p className="text-[8.5px] font-sans text-white/80 leading-relaxed uppercase">
                    Shri Tilak Complex, Agra Expressway, Lucknow
                  </p>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Clear External Layout Bar for SDK Map */}
      <div className="bg-black/95 border-t border-white/10 p-4 shrink-0 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex gap-2.5 items-center">
          <div className="w-7 h-7 rounded-full bg-gold/15 border border-gold/45 flex items-center justify-center shrink-0">
            <Navigation className="w-3.5 h-3.5 text-gold shrink-0" />
          </div>
          <div className="text-left">
            <h4 className="font-serif text-[11px] font-extrabold tracking-wider text-white uppercase leading-none">
              Agra Expressway Starting Point
            </h4>
            <p className="text-[9px] text-white/50 font-mono tracking-widest uppercase mt-0.5">
              Lucknow, Uttar Pradesh
            </p>
          </div>
        </div>

        {/* Action components */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <a 
            href={GOOGLE_MAPS_REDIRECT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-gold hover:bg-gold/80 text-black font-sans font-black tracking-widest text-[10px] uppercase px-4 py-2 rounded-xl shadow-lg transition-all hover:scale-103 active:scale-97 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
          >
            Get Directions
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          {/* Map Type selectors */}
          <div className="flex bg-white/5 border border-white/10 p-0.5 rounded-xl">
            {(['roadmap', 'satellite'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setMapType(type)}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-mono uppercase font-bold tracking-widest transition-all cursor-pointer ${
                  mapType === type ? 'bg-gold text-black' : 'text-white/60 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
