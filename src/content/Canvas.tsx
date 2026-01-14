import React, { useEffect, useRef, useState } from 'react';
import { Canvas as FabricCanvas, PencilBrush, Rect, Circle, IText } from 'fabric';
import { PenTool, Eraser, X, MousePointer2, Trash2, Square, Circle as CircleIcon, Type } from 'lucide-react';
import clsx from 'clsx';

const COLORS = [
  '#6366f1', // Indigo (Default)
  '#ef4444', // Red
  '#22c55e', // Green
  '#eab308', // Yellow
  '#0f172a', // Black
];

type ToolType = 'pointer' | 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';

export const Canvas = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<FabricCanvas | null>(null);
  const [activeTool, setActiveTool] = useState<ToolType>('pointer');
  const [color, setColor] = useState(COLORS[0]);
  const [brushSize, setBrushSize] = useState(3);
  const [isOpen, setIsOpen] = useState(true);

  // Initialize Canvas
  useEffect(() => {
    if (!canvasRef.current || fabricRef.current) return;

    const canvas = new FabricCanvas(canvasRef.current, {
      isDrawingMode: false,
      selection: true, // Allow selection for pointer mode
      width: window.innerWidth,
      height: window.innerHeight,
    });

    // Default Brush
    const brush = new PencilBrush(canvas);
    brush.width = brushSize;
    brush.color = color;
    canvas.freeDrawingBrush = brush;

    fabricRef.current = canvas;

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

  // Update Brush Properties (Color/Size)
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;
    
    // Update Free Drawing Brush
    if (canvas.freeDrawingBrush) {
      canvas.freeDrawingBrush.width = activeTool === 'eraser' ? brushSize * 5 : brushSize;
      canvas.freeDrawingBrush.color = activeTool === 'eraser' ? '#ffffff' : color;
    }

    // Update Selected Object Properties (if any)
    const activeObject = canvas.getActiveObject();
    if (activeObject) {
       // If it's a shape/text, update its fill/color
       if (activeObject instanceof Rect || activeObject instanceof Circle) {
           activeObject.set('fill', color);
           // activeObject.set('stroke', color); // Optional: if we want outline style
           canvas.requestRenderAll();
       } else if (activeObject instanceof IText) {
           activeObject.set('fill', color);
           canvas.requestRenderAll();
       }
    }

  }, [color, brushSize, activeTool]);

  // Handle Tool Activation
  useEffect(() => {
    if (!fabricRef.current) return;
    const canvas = fabricRef.current;

    canvas.isDrawingMode = (activeTool === 'pen' || activeTool === 'eraser');
    
    // Pointer Events logic
    const parent = canvas.getElement().parentNode as HTMLElement;
    if (parent && parent.parentElement) {
       // If pointer or shapes (we need to select them), enable pointer events
       // Actually 'pointer' mode allows clicking THROUGH to the page? 
       // No, 'pointer' mode usually means 'Select/Move' in drawing apps.
       // BUT in this extension, we want a mode to interact with the PAGE.
       // Let's keep 'pointer' as 'Interact with Page'.
       // We need a separate 'select' tool? Or just imply 'Select' when using Shape tools?
       // Let's say: 
       // - Pointer: Interact with Page (canvas pass-through)
       // - Pen/Eraser: Draw
       // - Shapes/Text: Add/Move/Edit (canvas active)
       
       if (activeTool === 'pointer') {
          parent.parentElement.style.pointerEvents = 'none'; // Click through
          canvas.selection = false;
       } else {
          parent.parentElement.style.pointerEvents = 'auto'; // Capture clicks
          canvas.selection = (activeTool !== 'pen' && activeTool !== 'eraser'); // Allow selection only in Shape/Text modes (or if we added a specific Select tool)
       }
    }

  }, [activeTool]);

  // Helper to add objects centered
  const addShape = (type: 'rectangle' | 'circle' | 'text') => {
      if (!fabricRef.current) return;
      const canvas = fabricRef.current;
      const center = canvas.getCenter();
      
      let object;

      if (type === 'rectangle') {
          object = new Rect({
              left: center.left,
              top: center.top,
              fill: color,
              width: 100,
              height: 100,
              rx: 10, // Rounded corners for "System Design" look
              ry: 10,
              originX: 'center',
              originY: 'center',
          });
      } else if (type === 'circle') {
          object = new Circle({
              left: center.left,
              top: center.top,
              fill: color,
              radius: 50,
              originX: 'center',
              originY: 'center',
          });
      } else if (type === 'text') {
          object = new IText('System Node', {
              left: center.left,
              top: center.top,
              fontFamily: 'Inter',
              fill: color,
              fontSize: 20,
              originX: 'center',
              originY: 'center',
          });
      }

      if (object) {
          canvas.add(object);
          canvas.setActiveObject(object);
          canvas.requestRenderAll();
          // Switch to a 'select' pseudo-mode implicitly so they can move it?
          // For now, staying in the shape tool enables selection.
          // But maybe we should switch activeTool to 'select' if we had one.
          // Let's implicitly allow move in Shape modes.
      }
  };


  const clearCanvas = () => {
    if (!fabricRef.current) return;
    fabricRef.current.clear();
    fabricRef.current.backgroundColor = 'rgba(0,0,0,0)'; 
    fabricRef.current.requestRenderAll();
  };

  // Minimized State
  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-[2147483647] p-3 rounded-full bg-white shadow-xl hover:scale-105 transition-transform border border-slate-100 text-indigo-600"
      >
        <PenTool className="w-5 h-5" />
      </button>
    );
  }

  return (
    <>
      <div className={clsx("fixed inset-0 z-[2147483646]", activeTool === 'pointer' ? "pointer-events-none" : "pointer-events-auto")}>
        <canvas ref={canvasRef} />
      </div>

      <div className="fixed top-4 right-4 z-[2147483647] font-sans flex flex-col items-end space-y-2">
        <div className="bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-2xl border border-white/50 flex flex-col space-y-3 w-14 items-center transition-all">
          
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            title="Minimize"
          >
            <X size={20} />
          </button>
          
          <div className="w-8 h-[1px] bg-slate-200"></div>

          {/* Tools */}
          <ToolButton 
            active={activeTool === 'pointer'} 
            onClick={() => setActiveTool('pointer')}
            icon={<MousePointer2 size={20} />}
            title="Pointer (Interact with Page)"
          />
          
          <ToolButton 
            active={activeTool === 'pen'} 
            onClick={() => setActiveTool('pen')}
            icon={<PenTool size={20} />}
            title="Freehand Pen"
          />

          <ToolButton 
            active={activeTool === 'eraser'} 
            onClick={() => setActiveTool('eraser')}
            icon={<Eraser size={20} />}
            title="Eraser"
          />

          <div className="w-8 h-[1px] bg-slate-200"></div>

          {/* Shapes Section for System Design */}
          <ToolButton 
            active={activeTool === 'rectangle'} 
            onClick={() => { setActiveTool('rectangle'); addShape('rectangle'); }}
            icon={<Square size={20} />}
            title="Add Rectangle"
          />

          <ToolButton 
            active={activeTool === 'circle'} 
            onClick={() => { setActiveTool('circle'); addShape('circle'); }}
            icon={<CircleIcon size={20} />}
            title="Add Circle/Node"
          />

          <ToolButton 
            active={activeTool === 'text'} 
            onClick={() => { setActiveTool('text'); addShape('text'); }}
            icon={<Type size={20} />}
            title="Add Text Label"
          />

          <div className="w-8 h-[1px] bg-slate-200"></div>


          {/* Colors (for both Pen and Shapes) */}
          {activeTool !== 'pointer' && activeTool !== 'eraser' && (
              <div className="flex flex-col space-y-2 py-1">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={clsx(
                      "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                      color === c ? "border-slate-600 scale-110" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    title={c}
                  />
                ))}
              </div>
          )}
          
          {/* Actions */}
          <button 
            onClick={clearCanvas}
            className="mt-2 p-2 rounded-xl text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            title="Clear Canvas"
          >
            <Trash2 size={20} />
          </button>

        </div>
      </div>
    </>
  );
};

const ToolButton = ({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title?: string }) => (
  <button 
    onClick={onClick}
    title={title}
    className={clsx(
      "p-2 rounded-xl transition-all duration-200 flex items-center justify-center",
      active 
        ? "bg-indigo-50 text-indigo-600 shadow-sm ring-1 ring-indigo-100" 
        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
    )}
  >
    {icon}
  </button>
);

