import React, { useEffect, useRef, useState } from 'react';
import { Settings2, X } from 'lucide-react';

export default function App() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  
  // UI Control States
  const [radiusXScale, setRadiusXScale] = useState(0.3);
  const [radiusYScale, setRadiusYScale] = useState(0.08);
  const [heightScale, setHeightScale] = useState(0.5);
  const [rotationSpeed, setRotationSpeed] = useState(1.5);
  const [dashSpeed, setDashSpeed] = useState(2.0);
  const [showControls, setShowControls] = useState(true);

  // Animation Refs (to prevent jumping when speeds change)
  const requestRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);
  const thetaRef = useRef<number>(0);
  const dashPhaseRef = useRef<number>(0);
  const speedsRef = useRef({ rotation: 1.5, dash: 2.0 });

  const [animState, setAnimState] = useState({ theta: 0, dashPhase: 0 });

  // Update speeds ref when state changes
  useEffect(() => {
    speedsRef.current = { rotation: rotationSpeed, dash: dashSpeed };
  }, [rotationSpeed, dashSpeed]);

  // Handle window resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight,
        });
      }
    };

    window.addEventListener('resize', updateDimensions);
    updateDimensions();

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Animation Loop
  useEffect(() => {
    const animate = (t: number) => {
      if (lastTimeRef.current !== 0) {
        const dt = t - lastTimeRef.current;
        
        // Accumulate phases based on current speeds and delta time
        thetaRef.current += dt * (speedsRef.current.rotation * 0.001);
        dashPhaseRef.current += dt * (speedsRef.current.dash * 0.001);
        
        setAnimState({
          theta: thetaRef.current,
          dashPhase: dashPhaseRef.current
        });
      }
      lastTimeRef.current = t;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const { width, height } = dimensions;
  const cx = width / 2;
  const cy = height / 2;

  // Scale based on screen size and user controls
  const minDim = Math.min(width, height);
  const rx = minDim * radiusXScale;
  const ry = minDim * radiusYScale; 
  const h = minDim * heightScale;   

  const topCy = cy - h / 2;
  const bottomCy = cy + h / 2;

  const { theta, dashPhase } = animState;

  // Points for the rotating line
  const x1 = cx + rx * Math.cos(theta);
  const y1 = topCy + ry * Math.sin(theta);

  const x2 = cx + rx * Math.cos(theta + Math.PI);
  const y2 = bottomCy + ry * Math.sin(theta + Math.PI);

  // Dash animation
  const sineVal = Math.sin(dashPhase);
  const dashGap = (sineVal * 0.5 + 0.5) * 20; 
  
  const actualGap = dashGap < 1 ? 0 : dashGap;
  const dashArray = actualGap === 0 ? 'none' : `15 ${actualGap}`;

  return (
    <div className="relative w-full h-screen bg-white overflow-hidden flex items-center justify-center select-none font-sans">
      
      {/* Toggle Button */}
      <button
        onClick={() => setShowControls(true)}
        className={`absolute top-6 left-6 p-3 bg-white/90 backdrop-blur-md border border-gray-200 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-300 z-10 ${showControls ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        title="显示控制面板"
      >
        <Settings2 className="w-5 h-5 text-gray-700" />
      </button>

      {/* Controls UI */}
      <div className={`absolute top-6 left-6 p-6 bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-xl w-80 z-20 transition-all duration-300 origin-top-left ${showControls ? 'scale-100 opacity-100' : 'scale-95 opacity-0 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 tracking-tight">参数控制面板</h2>
          <button 
            onClick={() => setShowControls(false)} 
            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
            title="隐藏控制面板"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <ControlSlider label="整体宽度 (X轴半径)" value={radiusXScale} min={0.1} max={0.8} step={0.01} onChange={setRadiusXScale} />
        <ControlSlider label="圆的透视 (Y轴半径)" value={radiusYScale} min={0.01} max={0.4} step={0.01} onChange={setRadiusYScale} />
        <ControlSlider label="整体高度 (圆间距)" value={heightScale} min={0.1} max={1.0} step={0.01} onChange={setHeightScale} />
        <ControlSlider label="线条旋转速度" value={rotationSpeed} min={0} max={5} step={0.1} onChange={setRotationSpeed} />
        <ControlSlider label="虚实变换速度" value={dashSpeed} min={0} max={10} step={0.1} onChange={setDashSpeed} />
      </div>

      {/* SVG Canvas */}
      <div ref={containerRef} className="w-full h-full">
        <svg width={width} height={height} className="block">
          {/* Top Circle */}
          <ellipse 
            cx={cx} 
            cy={topCy} 
            rx={rx} 
            ry={ry} 
            fill="none" 
            stroke="#000" 
            strokeWidth="2" 
          />

          {/* Bottom Circle */}
          <ellipse 
            cx={cx} 
            cy={bottomCy} 
            rx={rx} 
            ry={ry} 
            fill="none" 
            stroke="#000" 
            strokeWidth="2" 
          />

          {/* The Animated Rotating Line */}
          <line
            x1={x1}
            y1={y1}
            x2={x2}
            y2={y2}
            stroke="#000"
            strokeWidth="2"
            strokeDasharray={dashArray}
            strokeLinecap="round"
          />
        </svg>
      </div>
    </div>
  );
}

interface ControlSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (val: number) => void;
}

function ControlSlider({ label, value, min, max, step, onChange }: ControlSliderProps) {
  return (
    <div className="mb-5">
      <div className="flex justify-between mb-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <span className="text-sm text-gray-500 font-mono">{value.toFixed(2)}</span>
      </div>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
      />
    </div>
  );
}
