import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush } from 'fabric';
import { PenTool, Eraser, X, MousePointer2 } from 'lucide-react';
import clsx from 'clsx';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<'pen' | 'eraser' | 'pointer'>('pointer');
  const [isOpen, setIsOpen] = useState(true);
  
  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    // Create a full-screen canvas
    // In Fabric v6+, we initialize with the element
    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: false,
      selection: false,
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Set styling for drawing brush
    // v6: PencilBrush needs canvas instance
    const brush = new PencilBrush(canvas);
    brush.width = 3;
    brush.color = '#6366f1'; // Indigo-500
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

    // Handle Window Resize
    const handleResize = () => {
      canvas.setDimensions({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      canvas.dispose();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Handle Tool Change
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    if (activeTool === 'pen') {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.width = 3;
        canvas.freeDrawingBrush.color = '#6366f1';
      }
      canvas.discardActiveObject();
      canvas.requestRenderAll();
      // Ensure canvas catches events
      const parent = canvas.getElement().parentNode as HTMLElement; // canvas-container
      if (parent && parent.parentElement) {
          parent.parentElement.style.pointerEvents = 'auto';
      }
    } else if (activeTool === 'eraser') {
      canvas.isDrawingMode = true;
      if (canvas.freeDrawingBrush) {
         canvas.freeDrawingBrush.width = 20;
         canvas.freeDrawingBrush.color = '#ffffff';
      }
    } else {
      canvas.isDrawingMode = false;
      // Allow clicking through the canvas to the webpage
      const parent = canvas.getElement().parentNode as HTMLElement;
      if (parent && parent.parentElement) {
         parent.parentElement.style.pointerEvents = 'none';
      }
    }

  }, [activeTool]);

  // Handle Floating Toolbar Visibility
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[2147483647] p-3 rounded-full bg-white shadow-xl hover:scale-105 transition-transform border border-slate-100"
      >
        <PenTool className="w-5 h-5 text-indigo-600" />
      </button>
    );
  }

  return (
    <>
      {/* Canvas Layer */}
      <div className={clsx("fixed inset-0 z-[2147483646]", activeTool === 'pointer' ? "pointer-events-none" : "pointer-events-auto")}>
        <canvas ref={canvasRef} />
      </div>

      {/* Floating Toolbar */}
      <div className="fixed top-4 right-4 z-[2147483647] font-sans flex flex-col items-end space-y-2">
        <div className="bg-white/90 backdrop-blur-xl p-2 rounded-2xl shadow-2xl border border-white/20 flex flex-col space-y-2 w-12 items-center transition-all">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X size={18} />
          </button>
          
          <div className="w-6 h-[1px] bg-slate-200 my-1"></div>

          <ToolButton 
            active={activeTool === 'pointer'} 
            onClick={() => setActiveTool('pointer')}
            icon={<MousePointer2 size={18} />}
          />
          
          <ToolButton 
            active={activeTool === 'pen'} 
            onClick={() => setActiveTool('pen')}
            icon={<PenTool size={18} />}
          />

          <ToolButton 
            active={activeTool === 'eraser'} 
            onClick={() => setActiveTool('eraser')}
            icon={<Eraser size={18} />}
          />

          <div className="w-6 h-[1px] bg-slate-200 my-1"></div>

          <div className="w-6 h-6 rounded-full bg-indigo-500 border-2 border-white shadow-sm ring-1 ring-slate-100"></div>
          
        </div>
      </div>
    </>
  );
};

const ToolButton = ({ active, onClick, icon }: { active: boolean, onClick: () => void, icon: React.ReactNode }) => (
  <button 
    onClick={onClick}
    className={clsx(
      "p-2 rounded-xl transition-all duration-200",
      active 
        ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    )}
  >
    {icon}
  </button>
);
