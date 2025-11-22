'use client';
import React, { useState, useEffect } from 'react';
import { Eye, Zap, ZapOff, Play, RotateCcw, Home } from 'lucide-react';

const AutocollimatorLab = () => {
  const [step, setStep] = useState(0);
  const [workpiece, setWorkpiece] = useState('');
  const [lightOn, setLightOn] = useState(false);
  const [viewing, setViewing] = useState(false);
  const [focalLength] = useState('150');
  const [currentReading, setCurrentReading] = useState(0);
  const [readings, setReadings] = useState<Array<{position: number, d: number, theta: string}>>([]);
  const [deviation, setDeviation] = useState('');
  const [reflectorPosition, setReflectorPosition] = useState(0);
  const [showGraph, setShowGraph] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [crosshairDeviation, setCrosshairDeviation] = useState(0);
  const [graphView, setGraphView] = useState<'crosshairs' | 'curve'>('crosshairs');

  const getStepMessage = () => {
    switch(step) {
      case 0: return "Please select a workpiece type (Flat or Tapered) to begin";
      case 1: return "Workpiece selected! Please switch on the light source using the button";
      case 2: return "Focal length is set to 150 mm";
      case 3: return "Please switch on the light source using the button";
      case 4: return "Crosshairs are now visible in the eyepiece view";
      case 5: return "Please enter the linear displacement (d) value and click Record";
      case 6: return `Reading ${currentReading} of 5 recorded! Now switch off the light using the button`;
      case 8: return `Light switched off! Click 'Move Reflector 5cm' for reading ${currentReading + 1} of 5`;
      case 9: return "All readings complete! Please click 'View Graph' to see results";
      default: return "";
    }
  };

  useEffect(() => {
    setModalMessage(getStepMessage());
  }, [step, currentReading]);

  const handleWorkpieceSelect = (type: string) => {
    if (step === 0) {
      setWorkpiece(type);
      setStep(1);
      setTimeout(() => setStep(3), 2000);
    }
  };

  const [randomTilt, setRandomTilt] = useState(0);

// Add this inside your useEffect
useEffect(() => {
  setModalMessage(getStepMessage());
  // Generate the random number ONLY on the client, once.
  setRandomTilt(Math.random() * 0.3 - 0.15); 
}, [step, currentReading]);

  const toggleLight = () => {
    if (step === 3 && !lightOn) {
      setLightOn(true);
      setViewing(true);
      
      // Calculate crosshair deviation automatically
      let displacement = 0;
      if (workpiece === 'tapered') {
        const taperedReadings = [0.005, 0.013, 0.022, 0.031, 0.040];
        displacement = taperedReadings[currentReading] || 0.005;
      } else {
        const flatReadings = [0.002, 0.002, 0.003, 0.002, 0.003];
        displacement = flatReadings[currentReading] || 0.002;
      }
      setCrosshairDeviation(displacement);
      
      setStep(5);
    } else if (lightOn && step === 6) {
      handleLightOffAfterReading();
    }
  };

  const getReflectorTiltAngle = () => {
  if (workpiece === 'tapered') {
    return reflectorPosition * 0.02;
  }
  return randomTilt; // Use the state variable instead of Math.random()
};

  const handleCloseView = () => {
    setViewing(false);
  };

  const handleDeviationSubmit = () => {
    if (deviation && step === 5) {
      const d = parseFloat(deviation);
      const expectedValue = crosshairDeviation;
      
      // Validate if entered value is exactly correct (no approximation)
      if (d !== expectedValue) {
        setModalMessage(`Incorrect value! Please enter the exact value: ${expectedValue.toFixed(3)} mm`);
        return;
      }
      
      const f = parseFloat(focalLength);
      const theta = (d / (2 * f)) * 1000;
      
      const newReading = {
        position: reflectorPosition,
        d: d,
        theta: theta.toFixed(4)
      };
      
      setReadings([...readings, newReading]);
      setDeviation('');
      setViewing(false);
      setStep(6);
      setCurrentReading(currentReading + 1);
      
      if (currentReading + 1 >= 5) {
        setShowGraph(true);
      }
    }
  };

  const handleLightOffAfterReading = () => {
    if (step === 6 && lightOn) {
      setLightOn(false);
      if (currentReading >= 5) {
        setStep(9);
      } else {
        setStep(8);
      }
    }
  };

  const moveReflector = () => {
    if (step === 8 && currentReading < 5) {
      setReflectorPosition(reflectorPosition + 50);
      setStep(3);
    }
  };

  const reset = () => {
    setStep(0);
    setWorkpiece('');
    setLightOn(false);
    setViewing(false);
    setCurrentReading(0);
    setReadings([]);
    setDeviation('');
    setReflectorPosition(0);
    setShowGraph(false);
    setCrosshairDeviation(0);
    setGraphView('crosshairs');
  };

  const getWorkpieceTopY = (xPos: number) => {
    if (workpiece === 'tapered') {
      return 350 - (xPos - 350) * (40 / 300);
    }
    return 310;
  };

  const BEAM_Y = 280;
  const WORKPIECE_BASE_Y = 350;

  return (
    <div className="w-full h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex">
      {modalMessage && (
        <div className="fixed top-4 left-4 z-50 w-96">
          <div className="bg-transparent">
            <h3 className="text-xl font-bold text-primary mb-2 drop-shadow-lg">Step {step + 1}</h3>
            <p className="text-white drop-shadow-lg">{modalMessage}</p>
            {step === 9 && (
              <p className="text-yellow-300 drop-shadow-lg text-sm mt-2">Scroll down in the right panel to view the graph.</p>
            )}
          </div>
        </div>
      )}

      <div className="w-2/3 p-6 flex flex-col items-center justify-center relative">
        {!viewing ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 750 450" className="w-full h-full">
              {/* Table */}
              <rect x="50" y="350" width="650" height="20" fill="#8B4513" stroke="#654321" strokeWidth="2"/>
              <rect x="70" y="370" width="15" height="70" fill="#654321"/>
              <rect x="665" y="370" width="15" height="70" fill="#654321"/>
              
              {/* Workpiece - Reduced height, aligned with beam */}
              {workpiece === 'flat' && (
                <rect x="350" y="310" width="300" height="40" fill="#95a5a6" stroke="#7f8c8d" strokeWidth="3">
                  <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                </rect>
              )}
              {workpiece === 'tapered' && (
                <polygon 
                  points="350,350 650,310 650,350" 
                  fill="#95a5a6" 
                  stroke="#7f8c8d" 
                  strokeWidth="3"
                >
                  <animate attributeName="opacity" values="0;1" dur="0.5s" fill="freeze"/>
                </polygon>
              )}
              
              {/* Autocollimator base */}
              <rect x="80" y="305" width="160" height="20" fill="#1a1a1a" stroke="#000" strokeWidth="2"/>
              <rect x="85" y="308" width="150" height="10" fill="#2c2c2c"/>
              
              {/* Support blocks */}
              <rect x="100" y="325" width="25" height="25" fill="#2a2a2a" stroke="#000" strokeWidth="1"/>
              <rect x="195" y="325" width="25" height="25" fill="#2a2a2a" stroke="#000" strokeWidth="1"/>
              
              {/* Main body - horizontal */}
              <rect x="90" y="250" width="130" height="55" fill="#3a3a3a" stroke="#000" strokeWidth="2"/>
              <rect x="95" y="255" width="120" height="45" fill="#4a4a4a"/>
              
              {/* Beam splitter */}
              <rect x="155" y="265" width="15" height="25" fill="#88ccff" opacity="0.3" stroke="#66aadd" strokeWidth="1"/>
              
              {/* Objective lens housing */}
              <rect x="220" y="262" width="55" height="36" fill="#2c2c2c" stroke="#000" strokeWidth="2"/>
              <circle cx="275" cy="280" r="14" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
              <circle cx="275" cy="280" r="10" fill="#333"/>
              
              {/* Eyepiece - top viewing */}
              <rect x="145" y="225" width="30" height="25" fill="#2c2c2c" stroke="#000" strokeWidth="2"/>
              <circle cx="160" cy="232" r="7" fill="#87ceeb" stroke="#000" strokeWidth="1"/>
              <circle cx="160" cy="232" r="5" fill="#b0d4f1"/>
              
              {/* Adjustment knob */}
              <circle cx="190" cy="245" r="8" fill="#1a1a1a" stroke="#000" strokeWidth="1"/>
              <line x1="190" y1="245" x2="190" y2="240" stroke="#4a4a4a" strokeWidth="2"/>
              
              {/* Light source indicator */}
              <rect x="100" y="270" width="20" height="15" fill="#ffaa00" opacity={lightOn ? 0.8 : 0.2}/>
              <text x="105" y="280" fill="white" fontSize="8">LED</text>
              
              {/* Collimated beam - HORIZONTAL at fixed height */}
              {lightOn && workpiece && (
                <>
                  <defs>
                    <linearGradient id="beamOut" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#ffff00" stopOpacity="0.7"/>
                      <stop offset="100%" stopColor="#ffff00" stopOpacity="0.2"/>
                    </linearGradient>
                    <linearGradient id="beamReturn" x1="100%" y1="0%" x2="0%" y2="0%">
                      <stop offset="0%" stopColor="#ff8800" stopOpacity="0.5"/>
                      <stop offset="100%" stopColor="#ff8800" stopOpacity="0.1"/>
                    </linearGradient>
                  </defs>
                  
                  {(() => {
                    const reflectorX = 420 + reflectorPosition;
                    
                    return (
                      <>
                        {/* Outgoing beam - perfectly horizontal */}
                        <line 
                          x1="289" 
                          y1={BEAM_Y} 
                          x2={reflectorX} 
                          y2={BEAM_Y} 
                          stroke="url(#beamOut)" 
                          strokeWidth="6"
                        >
                          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze"/>
                        </line>
                        
                        {/* Return beam - perfectly horizontal */}
                        <line 
                          x1={reflectorX} 
                          y1={BEAM_Y} 
                          x2="289" 
                          y2={BEAM_Y + 2} 
                          stroke="url(#beamReturn)" 
                          strokeWidth="5" 
                          opacity="0.6"
                        >
                          <animate attributeName="opacity" values="0;1" dur="0.3s" fill="freeze"/>
                        </line>
                        
                        {/* Lens glow */}
                        <circle cx="275" cy="280" r="20" fill="#ffff00" opacity="0.2">
                          <animate attributeName="r" values="20;25;20" dur="2s" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="275" cy="280" r="14" fill="#ffff00" opacity="0.3"/>
                      </>
                    );
                  })()}
                </>
              )}
              
              {/* Reflector - properly aligned on workpiece */}
              {workpiece && (
                (() => {
                  const reflectorX = 420 + reflectorPosition;
                  const workpieceTopY = getWorkpieceTopY(reflectorX);
                  const mirrorRadius = 22;
                  const standBaseHeight = 8;
                  const standWidth = 50;
                  
                  // For tapered workpiece, adjust mirror Y to follow surface while staying close to beam
                  // Keep consistent distance (38mm) from surface for tapered, fixed for flat
                  const mirrorCenterY = workpiece === 'tapered' 
                    ? workpieceTopY - 38
                    : BEAM_Y;
                  
                  const standHeight = workpieceTopY - (mirrorCenterY + mirrorRadius);
                  
                  return (
                    <g>
                      <rect 
                        x={reflectorX - standWidth/2} 
                        y={workpieceTopY - standBaseHeight} 
                        width={standWidth} 
                        height={standBaseHeight} 
                        fill="#2557a7" 
                        stroke="#1a4080" 
                        strokeWidth="2"
                      />
                      
                      <rect 
                        x={reflectorX - 18} 
                        y={mirrorCenterY + mirrorRadius} 
                        width="6" 
                        height={standHeight - standBaseHeight} 
                        fill="#2557a7" 
                        stroke="#1a4080" 
                        strokeWidth="1"
                      />
                      <rect 
                        x={reflectorX + 12} 
                        y={mirrorCenterY + mirrorRadius} 
                        width="6" 
                        height={standHeight - standBaseHeight} 
                        fill="#2557a7" 
                        stroke="#1a4080" 
                        strokeWidth="1"
                      />
                      
                      <g>
                        <circle 
                          cx={reflectorX} 
                          cy={mirrorCenterY} 
                          r={mirrorRadius + 4} 
                          fill="#b0b0b0" 
                          stroke="#808080" 
                          strokeWidth="3"
                        />
                        <circle 
                          cx={reflectorX} 
                          cy={mirrorCenterY} 
                          r={mirrorRadius} 
                          fill="#e8e8e8" 
                          stroke="#d0d0d0" 
                          strokeWidth="1"
                        />
                        <circle 
                          cx={reflectorX} 
                          cy={mirrorCenterY} 
                          r={mirrorRadius - 2} 
                          fill="#f5f5f5"
                        />
                        <ellipse 
                          cx={reflectorX - 5} 
                          cy={mirrorCenterY - 5} 
                          rx="8" 
                          ry="12" 
                          fill="#ffffff" 
                          opacity="0.7"
                        />
                        
                        {lightOn && (
                          <circle 
                            cx={reflectorX} 
                            cy={mirrorCenterY} 
                            r="8" 
                            fill="#ffff00" 
                            opacity="0.6"
                          >
                            <animate 
                              attributeName="opacity" 
                              values="0.3;0.8;0.3" 
                              dur="1.5s" 
                              repeatCount="indefinite"
                            />
                          </circle>
                        )}
                      </g>
                    </g>
                  );
                })()
              )}
              
              {workpiece && (
                <line x1="80" y1={BEAM_Y} x2="700" y2={BEAM_Y} stroke="#444" strokeWidth="1" strokeDasharray="5,5" opacity="0.3"/>
              )}
              
              <text x="130" y="215" fill="white" fontSize="16" fontWeight="bold">Autocollimator</text>
              <text x="90" y="235" fill="#aaffaa" fontSize="11">Horizontal Collimated Beam</text>
              
              {workpiece && (
                <>
                  <text x="470" y="395" fill="white" fontSize="16" fontWeight="bold">
                    {workpiece === 'flat' ? 'Flat Workpiece' : 'Tapered Workpiece'}
                  </text>
                  <text x="470" y="415" fill="#88ff88" fontSize="13">
                    Position: {reflectorPosition} mm
                  </text>
                  {workpiece === 'tapered' && (
                    <text x="470" y="430" fill="#ffd700" fontSize="12">
                      Tilt: {getReflectorTiltAngle().toFixed(3)}°
                    </text>
                  )}
                </>
              )}
            </svg>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-black rounded-lg">
            <svg viewBox="0 0 400 400" className="w-3/4 h-3/4">
              <circle cx="200" cy="200" r="150" fill="#0a0a0a" stroke="#333" strokeWidth="4"/>
              <circle cx="200" cy="200" r="145" fill="none" stroke="#444" strokeWidth="1"/>
              
              <circle cx="200" cy="200" r="120" fill="none" stroke="#222" strokeWidth="1"/>
              <circle cx="200" cy="200" r="80" fill="none" stroke="#222" strokeWidth="1"/>
              <circle cx="200" cy="200" r="40" fill="none" stroke="#222" strokeWidth="1"/>
              
              <line x1="50" y1="200" x2="350" y2="200" stroke="#00ff00" strokeWidth="2.5"/>
              <line x1="200" y1="50" x2="200" y2="350" stroke="#00ff00" strokeWidth="2.5"/>
              <circle cx="200" cy="200" r="3" fill="#00ff00"/>
              
              <line 
                x1="50" 
                y1={200 + crosshairDeviation * 15} 
                x2="350" 
                y2={200 + crosshairDeviation * 15} 
                stroke="#ff3333" 
                strokeWidth="2.5" 
                opacity="0.8"
              />
              <line 
                x1={200 + crosshairDeviation * 15} 
                y1="50" 
                x2={200 + crosshairDeviation * 15} 
                y2="350" 
                stroke="#ff3333" 
                strokeWidth="2.5" 
                opacity="0.8"
              />
              <circle cx={200 + crosshairDeviation * 15} cy={200 + crosshairDeviation * 15} r="3" fill="#ff3333"/>
              
              {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map(i => (
                <g key={i}>
                  <line 
                    x1="180" 
                    y1={200 + i * 20} 
                    x2="220" 
                    y2={200 + i * 20} 
                    stroke="#666" 
                    strokeWidth="1"
                  />
                  <text x="225" y={204 + i * 20} fill="#888" fontSize="9">
                    {(-i * 0.5).toFixed(1)}
                  </text>
                </g>
              ))}
              
              <rect x="130" y="360" width="140" height="35" fill="#111" opacity="0.8" rx="5"/>
              <text x="140" y="375" fill="#00ff00" fontSize="11" fontWeight="bold">
                Green: Reticle (Fixed)
              </text>
              <text x="140" y="388" fill="#ff3333" fontSize="11" fontWeight="bold">
                Red: Reflected Image
              </text>
              
              <rect x="70" y="15" width="140" height="25" fill="#222" opacity="0.9" rx="5"/>
              <text x="80" y="32" fill="#ffff00" fontSize="12" fontWeight="bold">
                d = {crosshairDeviation.toFixed(3)} mm
              </text>
            </svg>
            
            <button
              onClick={handleCloseView}
              className="absolute top-4 right-4 bg-destructive text-destructive-foreground px-4 py-2 rounded-lg hover:bg-destructive/90 transition shadow-lg"
            >
              Close View
            </button>
          </div>
        )}
      </div>

      <div className="w-1/3 bg-sidebar p-6 flex flex-col gap-4 overflow-y-auto">
        <div className="bg-sidebar-accent rounded-lg p-4 shadow-lg border border-sidebar-border">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-sidebar-foreground flex items-center gap-2">
              <Play size={20} />
              Control Panel
            </h2>
            <button
              onClick={() => window.location.href = '/'}
              className="p-2 rounded-lg bg-sidebar hover:bg-sidebar-accent-foreground/10 transition text-sidebar-foreground"
              title="Go to Home"
            >
              <Home size={18} />
            </button>
          </div>
          
          <div className="mb-4">
            <label className="text-sidebar-foreground text-sm mb-2 block">Select Workpiece:</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleWorkpieceSelect('flat')}
                disabled={step > 0}
                className={`flex-1 py-2 rounded transition ${
                  workpiece === 'flat' 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-80'
                } disabled:opacity-50`}
              >
                Flat
              </button>
              <button
                onClick={() => handleWorkpieceSelect('tapered')}
                disabled={step > 0}
                className={`flex-1 py-2 rounded transition ${
                  workpiece === 'tapered' 
                    ? 'bg-success text-success-foreground' 
                    : 'bg-sidebar-primary text-sidebar-primary-foreground hover:opacity-80'
                } disabled:opacity-50`}
              >
                Tapered
              </button>
            </div>
          </div>

          {step >= 3 && (
            <button
              onClick={toggleLight}
              disabled={step !== 3 && step !== 6}
              className={`w-full py-3 rounded flex items-center justify-center gap-2 transition font-bold ${
                lightOn 
                  ? 'bg-warning text-warning-foreground hover:opacity-90' 
                  : 'bg-sidebar-accent text-sidebar-accent-foreground hover:bg-sidebar-border'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {lightOn ? <Zap size={20} /> : <ZapOff size={20} />}
              {step === 6 ? 'Switch OFF Light' : (lightOn ? 'Light ON' : 'Switch ON Light')}
            </button>
          )}

          {step >= 5 && viewing && (
            <div className="mb-4 mt-4">
              <label className="text-sidebar-foreground text-sm mb-2 block">Linear Displacement d (mm):</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.001"
                  value={deviation}
                  onChange={(e) => setDeviation(e.target.value)}
                  className="flex-1 px-3 py-2 rounded bg-sidebar text-sidebar-foreground border border-sidebar-border"
                  placeholder="Enter d"
                />
                <button
                  onClick={handleDeviationSubmit}
                  className="bg-success text-success-foreground px-4 py-2 rounded hover:opacity-90"
                >
                  Record
                </button>
              </div>
            </div>
          )}

          {step === 8 && currentReading < 5 && (
            <button
              onClick={moveReflector}
              className="w-full mt-4 bg-sidebar-primary text-sidebar-primary-foreground py-2 rounded hover:opacity-90 transition"
            >
              Move Reflector 5cm →
            </button>
          )}

          {step >= 9 && (
            <button
              onClick={reset}
              className="w-full mt-4 bg-destructive text-destructive-foreground py-2 rounded flex items-center justify-center gap-2 hover:opacity-90 transition"
            >
              <RotateCcw size={18} />
              Reset Experiment
            </button>
          )}
        </div>

        <div className="bg-sidebar-accent rounded-lg p-4 shadow-lg flex-1 border border-sidebar-border">
          <h3 className="text-lg font-bold text-sidebar-foreground mb-3">Readings & Calculations</h3>
          
          <div className="text-sidebar-foreground text-sm mb-3 bg-sidebar p-3 rounded border border-sidebar-border">
            <div className="font-bold text-sidebar-primary mb-1">Principle:</div>
            <div className="text-xs">d = 2 × f × θ</div>
            <div className="text-xs">θ = d / (2 × f)</div>
            <div className="mt-2">Focal Length (f) = {focalLength} mm</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sidebar-foreground text-sm">
              <thead className="bg-sidebar">
                <tr>
                  <th className="p-2 border border-sidebar-border">No.</th>
                  <th className="p-2 border border-sidebar-border">Pos (mm)</th>
                  <th className="p-2 border border-sidebar-border">d (mm)</th>
                  <th className="p-2 border border-sidebar-border">θ (mrad)</th>
                </tr>
              </thead>
              <tbody>
                {readings.map((r, i) => (
                  <tr key={i} className="bg-sidebar-accent">
                    <td className="p-2 border border-sidebar-border text-center">{i + 1}</td>
                    <td className="p-2 border border-sidebar-border text-center">{r.position}</td>
                    <td className="p-2 border border-sidebar-border text-center">{r.d}</td>
                    <td className="p-2 border border-sidebar-border text-center">{r.theta}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {showGraph && (
            <button
              onClick={() => setStep(9)}
              className="w-full mt-4 bg-sidebar-primary text-sidebar-primary-foreground py-2 rounded hover:opacity-90 transition"
            >
              View Graph
            </button>
          )}
        </div>

        {step === 9 && readings.length > 0 && (
          <div className="bg-sidebar-accent rounded-lg p-4 shadow-lg border border-sidebar-border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-sidebar-foreground">Graph Analysis</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => setGraphView('crosshairs')}
                  className={`px-3 py-1 rounded text-sm transition ${
                    graphView === 'crosshairs' 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'bg-sidebar-border text-sidebar-foreground'
                  }`}
                >
                  Crosshairs
                </button>
                <button
                  onClick={() => setGraphView('curve')}
                  className={`px-3 py-1 rounded text-sm transition ${
                    graphView === 'curve' 
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground' 
                      : 'bg-sidebar-border text-sidebar-foreground'
                  }`}
                >
                  Curve
                </button>
              </div>
            </div>

            {graphView === 'crosshairs' ? (
              <svg viewBox="0 0 800 250" className="w-full bg-sidebar rounded border border-sidebar-border">
                <line x1="50" y1="125" x2="750" y2="125" stroke="#ff6600" strokeWidth="3"/>
                
                {readings.map((r, i) => {
                  const xPos = 100 + i * 150;
                  const deviation = parseFloat(r.d.toString()) * 20;
                  
                  return (
                    <g key={i}>
                      <line x1={xPos} y1="10" x2={xPos} y2="240" stroke="#666" strokeWidth="1" strokeDasharray="3,3"/>
                      <text x={xPos - 15} y="245" fill="white" fontSize="11">{r.position}mm</text>
                      
                      <line x1={xPos - 30} y1="125" x2={xPos + 30} y2="125" stroke="#00ff00" strokeWidth="2"/>
                      <line x1={xPos} y1="95" x2={xPos} y2="155" stroke="#00ff00" strokeWidth="2"/>
                      
                      <line 
                        x1={xPos - 30} 
                        y1={125 + deviation} 
                        x2={xPos + 30} 
                        y2={125 + deviation} 
                        stroke="#ff3333" 
                        strokeWidth="2" 
                        opacity="0.8"
                      />
                      <line 
                        x1={xPos + deviation} 
                        y1={95} 
                        x2={xPos + deviation} 
                        y2={155} 
                        stroke="#ff3333" 
                        strokeWidth="2" 
                        opacity="0.8"
                      />
                      
                      {Math.abs(deviation) > 1 && (
                        <>
                          <line 
                            x1={xPos} 
                            y1="125" 
                            x2={xPos} 
                            y2={125 + deviation} 
                            stroke="#ffff00" 
                            strokeWidth="1" 
                            strokeDasharray="2,2"
                          />
                          <text 
                            x={xPos + 35} 
                            y={125 + deviation / 2} 
                            fill="#ffff00" 
                            fontSize="10"
                          >
                            {r.d}mm
                          </text>
                        </>
                      )}
                    </g>
                  );
                })}
                
                <rect x="600" y="20" width="140" height="50" fill="#111" opacity="0.8" rx="5"/>
                <line x1="610" y1="35" x2="640" y2="35" stroke="#00ff00" strokeWidth="2"/>
                <text x="645" y="39" fill="#00ff00" fontSize="10">Fixed Reticle</text>
                <line x1="610" y1="55" x2="640" y2="55" stroke="#ff3333" strokeWidth="2"/>
                <text x="645" y="59" fill="#ff3333" fontSize="10">Reflected Image</text>
              </svg>
            ) : (
              <svg viewBox="0 0 450 350" className="w-full bg-sidebar rounded border border-sidebar-border">
                <line x1="60" y1="280" x2="400" y2="280" stroke="black" strokeWidth="2"/>
                <line x1="60" y1="50" x2="60" y2="280" stroke="black" strokeWidth="2"/>
                
                <text x="200" y="315" fontSize="14" fill="black" fontWeight="bold">Position (mm)</text>
                <text x="15" y="170" fontSize="14" fill="black" fontWeight="bold" transform="rotate(-90 15 170)">
                  Deviation (mm)
                </text>
                
                {[0, 1, 2, 3, 4, 5].map(i => (
                  <g key={i}>
                    <line 
                      x1="60" 
                      y1={280 - i * 40} 
                      x2="400" 
                      y2={280 - i * 40} 
                      stroke="#333" 
                      strokeWidth="1" 
                      strokeDasharray="3,3"
                    />
                    <text x="45" y={285 - i * 40} fill="black" fontSize="10">
                      {(i * 0.01).toFixed(2)}
                    </text>
                  </g>
                ))}
                
                {readings.map((r, i) => (
                  <text key={i} x={80 + i * 65} y="295" fill="black" fontSize="10" textAnchor="middle">
                    {r.position}
                  </text>
                ))}
                
                {readings.map((r, i) => {
                  const x = 80 + i * 65;
                  const y = 280 - (parseFloat(r.d.toString()) * 4000);
                  
                  return (
                    <g key={i}>
                      <circle cx={x} cy={y} r="5" fill="#ff6600"/>
                      {i > 0 && (
                        <line
                          x1={80 + (i - 1) * 65}
                          y1={280 - (parseFloat(readings[i - 1].d.toString()) * 4000)}
                          x2={x}
                          y2={y}
                          stroke="#ff6600"
                          strokeWidth="2.5"
                        />
                      )}
                    </g>
                  );
                })}
                
                <text x="225" y="30" fontSize="16" fill="black" fontWeight="bold" textAnchor="middle">
                  Crosshair Deviation vs Position
                </text>
                
                <rect x="320" y="45" width="70" height="25" fill="#111" opacity="0.8" rx="5"/>
                <text x="355" y="62" fontSize="11" fill={workpiece === 'tapered' ? '#ff6600' : '#00ff00'} textAnchor="middle">
                  {workpiece === 'tapered' ? 'Tapered' : 'Flat'}
                </text>
              </svg>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutocollimatorLab;
