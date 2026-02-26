/**
 * DrawingCanvas Component
 *
 * iPad-optimized drawing canvas for solving equations lessons.
 * Allows students to work out problems by hand before submitting answers.
 *
 * Features:
 * - Touch/mouse drawing with 60fps performance
 * - Pen and eraser tools
 * - Color and thickness selection
 * - localStorage persistence (last 10 drawings)
 * - Theme-aware (dark mode support)
 * - Retina display optimization
 * - Accessibility support
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { InlineMath } from 'react-katex';

const MAX_UNDO_STACK = 50; // Memory management
const THROTTLE_MS = 16; // 60fps = 16.67ms

// Throttle utility for performance
function throttle(func, wait) {
  let timeout;
  let previous = 0;

  return function executedFunction(...args) {
    const now = Date.now();
    const remaining = wait - (now - previous);

    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        previous = Date.now();
        timeout = null;
        func.apply(this, args);
      }, remaining);
    }
  };
}

// localStorage helper
const STORAGE_PREFIX = 'canvas_solving_equations_';
const MAX_STORED_DRAWINGS = 10;

function saveDrawing(questionIndex, imageData) {
  try {
    const key = `${STORAGE_PREFIX}${questionIndex}`;
    const stored = JSON.parse(localStorage.getItem(STORAGE_PREFIX + 'index') || '[]');

    // Add to index
    if (!stored.includes(questionIndex)) {
      stored.push(questionIndex);

      // LRU eviction: keep only last 10
      if (stored.length > MAX_STORED_DRAWINGS) {
        const removed = stored.shift();
        localStorage.removeItem(`${STORAGE_PREFIX}${removed}`);
      }

      localStorage.setItem(STORAGE_PREFIX + 'index', JSON.stringify(stored));
    }

    localStorage.setItem(key, imageData);
  } catch (e) {
    console.warn('Failed to save drawing to localStorage:', e);
  }
}

function loadDrawing(questionIndex) {
  try {
    const key = `${STORAGE_PREFIX}${questionIndex}`;
    return localStorage.getItem(key);
  } catch (e) {
    console.warn('Failed to load drawing from localStorage:', e);
    return null;
  }
}

function DrawingCanvas({ equation, questionIndex, visible, onClose, disabled, theme }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState('pen');
  const [color, setColor] = useState(theme?.colors?.textPrimary || '#000000');
  const [lineWidth, setLineWidth] = useState(3);
  const [paths, setPaths] = useState([]);
  const lastPosRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Setup canvas with retina display support
  const setupCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    // Set display size
    canvas.style.width = rect.width + 'px';
    canvas.style.height = (rect.height - 120) + 'px'; // Account for toolbar

    // Set actual size in memory (scaled for retina)
    canvas.width = rect.width * dpr;
    canvas.height = (rect.height - 120) * dpr;

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    // Set background
    ctx.fillStyle = theme?.colors?.cardBackground || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Load saved drawing if exists
    const saved = loadDrawing(questionIndex);
    if (saved) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = saved;
    }
  }, [theme, questionIndex]);

  // Initialize canvas
  useEffect(() => {
    if (visible) {
      setupCanvas();

      // Handle window resize/orientation change
      const handleResize = () => {
        const currentData = canvasRef.current?.toDataURL();
        setupCanvas();
        if (currentData) {
          const img = new Image();
          img.onload = () => {
            const ctx = canvasRef.current.getContext('2d');
            ctx.drawImage(img, 0, 0);
          };
          img.src = currentData;
        }
      };

      window.addEventListener('resize', handleResize);
      window.addEventListener('orientationchange', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', handleResize);
      };
    }
  }, [visible, setupCanvas]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Save before cleanup
      if (canvasRef.current && visible) {
        const imageData = canvasRef.current.toDataURL();
        saveDrawing(questionIndex, imageData);
      }

      // Clear canvas memory
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        canvasRef.current.width = 0;
        canvasRef.current.height = 0;
      }
    };
  }, [visible, questionIndex]);

  // Get coordinates relative to canvas
  const getCanvasCoordinates = useCallback((clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }, []);

  // Drawing logic with RAF
  const drawLine = useCallback((x, y) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    animationFrameRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas || !lastPosRef.current) return;

      const ctx = canvas.getContext('2d');

      ctx.beginPath();
      ctx.moveTo(lastPosRef.current.x, lastPosRef.current.y);
      ctx.lineTo(x, y);

      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.lineWidth = 20;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = color;
        ctx.lineWidth = lineWidth;
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.stroke();

      lastPosRef.current = { x, y };
    });
  }, [tool, color, lineWidth]);

  // Throttled draw function
  const throttledDraw = useCallback(
    throttle(drawLine, THROTTLE_MS),
    [drawLine]
  );

  // Touch/Mouse event handlers
  const handlePointerDown = useCallback((e) => {
    if (disabled) return;
    e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    const coords = getCanvasCoordinates(point.clientX, point.clientY);

    setIsDrawing(true);
    lastPosRef.current = coords;

    // Save state for undo
    const canvas = canvasRef.current;
    if (canvas && paths.length < MAX_UNDO_STACK) {
      setPaths(prev => [...prev, canvas.toDataURL()]);
    }
  }, [disabled, getCanvasCoordinates, paths.length]);

  const handlePointerMove = useCallback((e) => {
    if (!isDrawing || disabled) return;
    e.preventDefault();

    const point = e.touches ? e.touches[0] : e;
    const coords = getCanvasCoordinates(point.clientX, point.clientY);

    throttledDraw(coords.x, coords.y);
  }, [isDrawing, disabled, getCanvasCoordinates, throttledDraw]);

  const handlePointerUp = useCallback((e) => {
    e.preventDefault();
    setIsDrawing(false);
    lastPosRef.current = null;

    // Save to localStorage after drawing
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL();
      saveDrawing(questionIndex, imageData);
    }
  }, [questionIndex]);

  // Tool handlers
  const handleClear = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = theme?.colors?.cardBackground || '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    setPaths([]);
    saveDrawing(questionIndex, canvas.toDataURL());
  }, [theme, questionIndex]);

  const handleUndo = useCallback(() => {
    if (paths.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const previousState = paths[paths.length - 1];
    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = theme?.colors?.cardBackground || '#FFFFFF';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = previousState;

    setPaths(prev => prev.slice(0, -1));
    saveDrawing(questionIndex, canvas.toDataURL());
  }, [paths, theme, questionIndex]);

  const handleClose = useCallback(() => {
    // Save before closing
    if (canvasRef.current) {
      const imageData = canvasRef.current.toDataURL();
      saveDrawing(questionIndex, imageData);
    }
    onClose();
  }, [onClose, questionIndex]);

  if (!visible) return null;

  return (
    <Overlay>
      <CanvasContainer ref={containerRef}>
        {/* Accessibility */}
        <SkipButton onClick={handleClose}>
          Skip Drawing (Enter Answer Directly)
        </SkipButton>

        {/* Equation Display */}
        <EquationDisplay>
          <InlineMath math={equation} />
        </EquationDisplay>

        {/* Toolbar */}
        <Toolbar>
          <ToolButton
            active={tool === 'pen'}
            onClick={() => setTool('pen')}
            title="Pen tool"
            aria-label="Pen tool"
          >
            ✏️
          </ToolButton>
          <ToolButton
            active={tool === 'eraser'}
            onClick={() => setTool('eraser')}
            title="Eraser tool"
            aria-label="Eraser tool"
          >
            🧹
          </ToolButton>

          <Separator />

          <ColorButton
            color="#000000"
            active={color === '#000000' && tool === 'pen'}
            onClick={() => { setColor('#000000'); setTool('pen'); }}
            title="Black"
            aria-label="Black pen"
          />
          <ColorButton
            color={theme?.colors?.info || '#3B82F6'}
            active={color === (theme?.colors?.info || '#3B82F6') && tool === 'pen'}
            onClick={() => { setColor(theme?.colors?.info || '#3B82F6'); setTool('pen'); }}
            title="Blue"
            aria-label="Blue pen"
          />
          <ColorButton
            color={theme?.colors?.error || '#EF4444'}
            active={color === (theme?.colors?.error || '#EF4444') && tool === 'pen'}
            onClick={() => { setColor(theme?.colors?.error || '#EF4444'); setTool('pen'); }}
            title="Red"
            aria-label="Red pen"
          />

          <Separator />

          <ThicknessButton
            active={lineWidth === 2}
            onClick={() => { setLineWidth(2); setTool('pen'); }}
            title="Thin line"
            aria-label="Thin line width"
          >
            ━
          </ThicknessButton>
          <ThicknessButton
            active={lineWidth === 4}
            onClick={() => { setLineWidth(4); setTool('pen'); }}
            title="Medium line"
            aria-label="Medium line width"
          >
            <strong>━</strong>
          </ThicknessButton>
          <ThicknessButton
            active={lineWidth === 6}
            onClick={() => { setLineWidth(6); setTool('pen'); }}
            title="Thick line"
            aria-label="Thick line width"
          >
            <strong style={{ fontSize: '20px' }}>━</strong>
          </ThicknessButton>

          <Separator />

          <ToolButton onClick={handleUndo} disabled={paths.length === 0} title="Undo" aria-label="Undo last action">
            ↶ Undo
          </ToolButton>
          <ToolButton onClick={handleClear} title="Clear canvas" aria-label="Clear all drawing">
            🗑️ Clear
          </ToolButton>

          <CloseButton onClick={handleClose} title="Close canvas" aria-label="Close drawing canvas">
            ✕ Close
          </CloseButton>
        </Toolbar>

        {/* Canvas */}
        <Canvas
          ref={canvasRef}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
          tool={tool}
          role="application"
          aria-label="Drawing canvas for solving equation"
          aria-describedby="canvas-instructions"
        />

        {/* Screen reader instructions */}
        <SrOnly id="canvas-instructions">
          Draw your work to solve the equation. Use toolbar buttons to change pen color and thickness.
          Your drawing is automatically saved.
        </SrOnly>
      </CanvasContainer>
    </Overlay>
  );
}

export default DrawingCanvas;

// ==================== STYLED COMPONENTS ====================

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const slideUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.3s ease-out;
  padding: 20px;

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const CanvasContainer = styled.div`
  width: 100%;
  max-width: 900px;
  max-height: 90vh;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: ${slideUp} 0.3s ease-out;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1024px) {
    max-width: 95vw;
    max-height: 95vh;
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
  }
`;

const SkipButton = styled.button`
  align-self: flex-start;
  padding: 8px 16px;
  font-size: 14px;
  background: transparent;
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 12px;
  }
`;

const EquationDisplay = styled.div`
  font-size: 24px;
  text-align: center;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground};
  border-radius: 8px;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 12px;
  }
`;

const Toolbar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: ${props => props.theme.colors.inputBackground};
  border-radius: 8px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
    padding: 10px;
  }
`;

const ToolButton = styled.button`
  min-width: 44px;
  height: 44px;
  padding: 0 12px;
  border-radius: 8px;
  border: 2px solid ${props =>
    props.active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props =>
    props.active ? props.theme.colors.primary : props.theme.colors.cardBackground};
  color: ${props =>
    props.active ? props.theme.colors.textInverted : props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  opacity: ${props => props.disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${props =>
      props.active ? props.theme.colors.primary : props.theme.colors.hoverBackground};
    transform: translateY(-1px);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    min-width: 40px;
    height: 40px;
    font-size: 13px;
  }
`;

const ColorButton = styled.button`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  border: 2px solid ${props =>
    props.active ? props.theme.colors.primary : props.theme.colors.border};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  ${props => props.active && `
    &::after {
      content: '✓';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      color: white;
      font-size: 20px;
      font-weight: bold;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }
  `}

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const ThicknessButton = styled(ToolButton)`
  min-width: 44px;
  font-size: 16px;
`;

const Separator = styled.div`
  width: 2px;
  height: 32px;
  background: ${props => props.theme.colors.border};
  margin: 0 4px;

  @media (max-width: 768px) {
    display: none;
  }
`;

const CloseButton = styled(ToolButton)`
  margin-left: auto;
  background: ${props => props.theme.colors.error};
  border-color: ${props => props.theme.colors.error};
  color: ${props => props.theme.colors.textInverted};

  &:hover {
    background: ${props => props.theme.colors.error};
    opacity: 0.9;
  }
`;

const Canvas = styled.canvas`
  width: 100%;
  flex: 1;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  background: ${props => props.theme.colors.pageBackground};
  cursor: ${props => props.tool === 'eraser' ? 'not-allowed' : 'crosshair'};
  touch-action: none;
  -webkit-tap-highlight-color: transparent;

  @media (max-width: 1024px) {
    min-height: 300px;
  }

  @media (max-width: 768px) {
    min-height: 250px;
  }
`;

const SrOnly = styled.div`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;
