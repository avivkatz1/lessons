/**
 * DrawingCanvas Component - react-konva version
 *
 * iPad-optimized drawing canvas for solving equations lessons.
 * Matches visual style of symmetry lessons with full dark mode support.
 *
 * Features:
 * - react-konva drawing with smooth strokes
 * - Marker and eraser tools
 * - localStorage persistence (last 10 drawings)
 * - Dark mode via useKonvaTheme
 * - Touch/mouse support
 * - KaTeX equation overlay
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect, Line } from 'react-konva';
import { InlineMath } from 'react-katex';
import { useKonvaTheme, useWindowDimensions } from '../../hooks';
import EnterAnswerButton from './EnterAnswerButton';

// localStorage helper
const STORAGE_PREFIX = 'canvas_solving_equations_';
const MAX_STORED_DRAWINGS = 10;

function saveDrawing(questionIndex, strokes) {
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

    localStorage.setItem(key, JSON.stringify(strokes));
  } catch (e) {
    console.warn('Failed to save drawing to localStorage:', e);
  }
}

function loadDrawing(questionIndex) {
  try {
    const key = `${STORAGE_PREFIX}${questionIndex}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.warn('Failed to load drawing from localStorage:', e);
    return [];
  }
}

function DrawingCanvas({
  equation,
  questionIndex,
  visible,
  onClose,
  disabled,
  onAnswerRecognized,  // Keep but won't be used
  onSubmit,            // Keep but won't be used
  // NEW PROPS
  panelOpen = false,       // From parent - is InputOverlayPanel open?
  onOpenPanel = () => {},  // Callback to parent to open panel
  slideDistance = 0,       // From parent - how far to slide
}) {
  const konvaTheme = useKonvaTheme();
  const { width: windowWidth } = useWindowDimensions();
  const [strokes, setStrokes] = useState([]);
  const [tool, setTool] = useState('marker');
  // Answer handling now delegated to parent's InputOverlayPanel
  const isDrawing = useRef(false);

  // Canvas dimensions
  const canvasWidth = Math.min(windowWidth - 80, 800);
  const canvasHeight = Math.min(500, window.innerHeight * 0.6);

  // Answer box dimensions (bottom-right corner)
  const answerBoxBounds = {
    x: 20,
    y: canvasHeight - 100,
    width: Math.min(280, canvasWidth - 40),
    height: 80
  };

  // Clear canvas and answer text when opening
  useEffect(() => {
    if (visible) {
      setStrokes([]); // Start with blank canvas
    }
  }, [visible, questionIndex]);

  // Save drawing on unmount or when strokes change
  useEffect(() => {
    if (visible && strokes.length > 0) {
      const timeoutId = setTimeout(() => {
        saveDrawing(questionIndex, strokes);
      }, 500); // Debounce saves

      return () => clearTimeout(timeoutId);
    }
  }, [visible, questionIndex, strokes]);

  // Get pointer position
  const getPointerPos = useCallback((e) => {
    const stage = e.target.getStage();
    return stage.getPointerPosition();
  }, []);

  // Handle pointer down (start drawing or erase)
  const handlePointerDown = useCallback((e) => {
    if (disabled) return;

    const pos = getPointerPos(e);
    if (!pos) return;

    if (tool === 'marker') {
      isDrawing.current = true;
      setStrokes((prev) => [...prev, { points: [pos.x, pos.y] }]);
    } else if (tool === 'eraser') {
      // Find and remove stroke near click
      const hitRadius = 15;
      let hitIndex = -1;
      let minDist = hitRadius;

      strokes.forEach((stroke, si) => {
        const pts = stroke.points;
        for (let i = 0; i < pts.length - 1; i += 2) {
          const dx = pts[i] - pos.x;
          const dy = pts[i + 1] - pos.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < minDist) {
            minDist = dist;
            hitIndex = si;
          }
        }
      });

      if (hitIndex >= 0) {
        setStrokes((prev) => prev.filter((_, i) => i !== hitIndex));
      }
    }
  }, [disabled, tool, getPointerPos, strokes]);

  // Handle pointer move (continue drawing)
  const handlePointerMove = useCallback((e) => {
    if (!isDrawing.current || tool !== 'marker' || disabled) return;

    const pos = getPointerPos(e);
    if (!pos) return;

    setStrokes((prev) => {
      const updated = [...prev];
      const last = { ...updated[updated.length - 1] };
      last.points = [...last.points, pos.x, pos.y];
      updated[updated.length - 1] = last;
      return updated;
    });
  }, [tool, disabled, getPointerPos]);

  // Handle pointer up (stop drawing)
  const handlePointerUp = useCallback(() => {
    isDrawing.current = false;
  }, []);

  // Tool handlers
  const handleClear = useCallback(() => {
    setStrokes([]);
    saveDrawing(questionIndex, []);
  }, [questionIndex]);

  const handleClose = useCallback(() => {
    if (strokes.length > 0) {
      saveDrawing(questionIndex, strokes);
    }
    onClose();
  }, [onClose, questionIndex, strokes]);

  // Handle answer input change
  // Answer handling removed - now uses parent's InputOverlayPanel

  if (!visible) return null;

  return (
    <Overlay $panelOpen={panelOpen}>
      <CanvasContainer $panelOpen={panelOpen} $slideDistance={slideDistance}>
        {/* Skip button for accessibility */}
        <SkipButton onClick={handleClose}>
          Skip Drawing (Enter Answer Directly)
        </SkipButton>

        {/* Canvas with equation overlay */}
        <VisualSection>
          {/* Equation positioned inside canvas area */}
          <EquationOverlay>
            <InlineMath math={equation} />
          </EquationOverlay>

          {/* Konva Stage */}
          <Stage
            width={canvasWidth}
            height={canvasHeight}
            onMouseDown={handlePointerDown}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onTouchStart={handlePointerDown}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
            style={{ cursor: tool === 'marker' ? 'crosshair' : 'pointer' }}
          >
            <Layer>
              {/* Background with dark mode support */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                fill={konvaTheme.canvasBackground}
              />

              {/* Drawing strokes - orange like symmetry lessons */}
              {strokes.map((stroke, i) => (
                <Line
                  key={`stroke-${i}`}
                  points={stroke.points}
                  stroke="#F97316"
                  strokeWidth={3}
                  lineCap="round"
                  lineJoin="round"
                  tension={0.3}
                />
              ))}
            </Layer>
          </Stage>

          {/* Enter answer button - opens parent's InputOverlayPanel */}
          {!panelOpen && (
            <AnswerButtonOverlay
              style={{
                left: `${answerBoxBounds.x + 16}px`,
                top: `${answerBoxBounds.y + 16}px`,
              }}
            >
              <EnterAnswerButton
                onClick={onOpenPanel}
                disabled={disabled}
                variant="static"
              />
            </AnswerButtonOverlay>
          )}
        </VisualSection>

        {/* Toolbar matching symmetry lesson style */}
        <ToolRow>
          <ToolButton
            $active={tool === 'marker'}
            onClick={() => setTool('marker')}
            title="Marker tool"
            aria-label="Marker tool"
          >
            Marker
          </ToolButton>
          <ToolButton
            $active={tool === 'eraser'}
            $isEraser
            onClick={() => setTool('eraser')}
            title="Eraser tool"
            aria-label="Eraser tool"
          >
            Eraser
          </ToolButton>
          {strokes.length > 0 && (
            <ClearAllButton onClick={handleClear} title="Clear all" aria-label="Clear all drawing">
              Clear All
            </ClearAllButton>
          )}
          <CloseButton onClick={handleClose} title="Close canvas" aria-label="Close drawing canvas">
            Close
          </CloseButton>
        </ToolRow>

        {/* Screen reader instructions */}
        <SrOnly id="canvas-instructions">
          Draw your work to solve the equation. Use marker to draw, eraser to remove strokes.
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

  /* Allow clicks to pass through to InputOverlayPanel when panel is open */
  pointer-events: ${props => props.$panelOpen ? 'none' : 'auto'};

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
  gap: 16px;

  /* Ensure canvas remains clickable even when Overlay has pointer-events: none */
  pointer-events: auto;

  /* NEW: Slide animation when InputOverlayPanel opens */
  transition: transform 0.3s ease-in-out;

  @media (min-width: 769px) {
    transform: translateX(${props => props.$panelOpen ? `-${props.$slideDistance}px` : '0'});
  }

  @media (max-width: 768px) {
    transform: translateX(0); /* Mobile: no slide */
  }

  @media (max-width: 1024px) {
    max-width: 95vw;
    max-height: 95vh;
    padding: 16px;
  }

  @media (max-width: 768px) {
    padding: 12px;
    gap: 12px;
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

const VisualSection = styled.div`
  position: relative;
  width: 100%;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const EquationOverlay = styled.div`
  position: absolute;
  top: 30px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  background: transparent;
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 24px;
  color: ${props => props.theme.colors.textPrimary};
  pointer-events: none;

  @media (max-width: 768px) {
    font-size: 20px;
    padding: 10px 20px;
    top: 20px;
  }
`;

const ToolRow = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const ToolButton = styled.button`
  padding: 8px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props =>
    props.$active
      ? (props.$isEraser ? '#EF4444' : '#F97316')
      : props.theme.colors.border
  };
  cursor: pointer;
  background-color: ${props =>
    props.$active
      ? (props.$isEraser ? '#EF4444' : '#F97316')
      : 'transparent'
  };
  color: ${props =>
    props.$active ? 'white' : props.theme.colors.textSecondary
  };
  transition: all 0.2s;

  &:hover {
    opacity: 0.85;
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 6px 16px;
    font-size: 13px;
  }
`;

const ClearAllButton = styled.button`
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 500;
  border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: transparent;
  color: ${props => props.theme.colors.textSecondary};
  transition: all 0.2s;

  &:hover {
    background-color: ${props => props.theme.colors.hoverBackground};
  }

  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
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

const AnswerButtonOverlay = styled.div`
  position: absolute;
  z-index: 20;
  display: flex;
  justify-content: center;
  pointer-events: auto;
`;
