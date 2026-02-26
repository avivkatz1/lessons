/**
 * Level 4: Dual Calculator Component
 *
 * Calculate BOTH area and perimeter for shapes
 * Features:
 * - Two input fields with individual validation
 * - DrawingCanvas integration for showing work
 * - Partial success feedback (checkmarks per field)
 * - Formula reference always visible
 *
 * Learning Objective: Understand and apply both area and perimeter formulas
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useDispatch, useSelector } from 'react-redux';
import { useWindowDimensions, useKonvaTheme } from '../../../../../hooks';
import { setUserAnswer } from '../../../../../store/lessonSlice';
import ShapeVisualizer from './ShapeVisualizer';

function Level4DualCalculator({ visualData, questionText, questionIndex, correctAnswer, onCorrect, disabled }) {
  const dispatch = useDispatch();
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [areaInput, setAreaInput] = useState('');
  const [perimeterInput, setPerimeterInput] = useState('');
  const [areaCorrect, setAreaCorrect] = useState(null);
  const [perimeterCorrect, setPerimeterCorrect] = useState(null);
  const [showCanvas, setShowCanvas] = useState(false);

  const { shapeType, area, perimeter } = visualData || {};

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 600);
    if (width <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [width]);

  const canvasHeight = 400;

  // Validate individual fields
  const validateField = (input, expected) => {
    const cleanInput = input.replace(/[^0-9.]/g, '');
    const cleanExpected = String(expected).replace(/[^0-9.]/g, '');
    return cleanInput === cleanExpected;
  };

  // Handle area input change
  const handleAreaChange = (e) => {
    const value = e.target.value;
    setAreaInput(value);

    if (value.trim()) {
      const isCorrect = validateField(value, area);
      setAreaCorrect(isCorrect);
    } else {
      setAreaCorrect(null);
    }
  };

  // Handle perimeter input change
  const handlePerimeterChange = (e) => {
    const value = e.target.value;
    setPerimeterInput(value);

    if (value.trim()) {
      const isCorrect = validateField(value, perimeter);
      setPerimeterCorrect(isCorrect);
    } else {
      setPerimeterCorrect(null);
    }
  };

  // Check if both are correct
  useEffect(() => {
    if (areaCorrect && perimeterCorrect) {
      // Update Redux state
      dispatch(setUserAnswer(`${areaInput}, ${perimeterInput}`));

      // Trigger success after a short delay
      setTimeout(() => {
        onCorrect();
      }, 500);
    }
  }, [areaCorrect, perimeterCorrect, areaInput, perimeterInput, dispatch, onCorrect]);

  // Reset on new problem
  useEffect(() => {
    setAreaInput('');
    setPerimeterInput('');
    setAreaCorrect(null);
    setPerimeterCorrect(null);
    setShowCanvas(false);
  }, [questionIndex]);

  return (
    <Container>
      {/* Visual representation */}
      <CanvasWrapper>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer listening={false}>
            <Rect
              x={0}
              y={0}
              width={canvasWidth}
              height={canvasHeight}
              fill={konvaTheme.canvasBackground}
            />
          </Layer>
          <Layer>
            <ShapeVisualizer
              visualData={visualData}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
              showGrid={false}
              showDimensions={true}
            />
          </Layer>
        </Stage>
      </CanvasWrapper>

      {/* Dual input fields */}
      <InputSection>
        <InputRow>
          <InputLabel>Area:</InputLabel>
          <InputWrapper>
            <InputField
              type="text"
              value={areaInput}
              onChange={handleAreaChange}
              placeholder="Enter area"
              disabled={disabled}
              $correct={areaCorrect}
              $incorrect={areaCorrect === false}
            />
            {areaCorrect && <Checkmark>✓</Checkmark>}
          </InputWrapper>
          <UnitLabel>cm²</UnitLabel>
        </InputRow>

        <InputRow>
          <InputLabel>Perimeter:</InputLabel>
          <InputWrapper>
            <InputField
              type="text"
              value={perimeterInput}
              onChange={handlePerimeterChange}
              placeholder="Enter perimeter"
              disabled={disabled}
              $correct={perimeterCorrect}
              $incorrect={perimeterCorrect === false}
            />
            {perimeterCorrect && <Checkmark>✓</Checkmark>}
          </InputWrapper>
          <UnitLabel>cm</UnitLabel>
        </InputRow>
      </InputSection>

      {/* Open Canvas Button */}
      <OpenCanvasButton onClick={() => setShowCanvas(true)} disabled={disabled}>
        Open Canvas to Show Work
      </OpenCanvasButton>

      {/* Canvas Overlay */}
      {showCanvas && (
        <CanvasOverlay onClick={() => setShowCanvas(false)}>
          <CanvasContent onClick={(e) => e.stopPropagation()}>
            <CanvasHeader>
              <CanvasTitle>Show Your Work</CanvasTitle>
              <CloseButton onClick={() => setShowCanvas(false)}>×</CloseButton>
            </CanvasHeader>
            <CanvasBody>
              <DrawingArea>
                <DrawingInstructions>
                  Use this space to calculate area and perimeter
                </DrawingInstructions>
                {/* Simple text area for work */}
                <WorkTextArea
                  placeholder="Write your calculations here..."
                  rows={10}
                />
              </DrawingArea>
            </CanvasBody>
          </CanvasContent>
        </CanvasOverlay>
      )}

      {/* Success feedback */}
      {areaCorrect && perimeterCorrect && (
        <SuccessMessage>
          ✓ Both answers are correct! Great work!
        </SuccessMessage>
      )}
    </Container>
  );
}

export default Level4DualCalculator;

// ==================== STYLED COMPONENTS ====================

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

const CanvasWrapper = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const InputSection = styled.div`
  width: 100%;
  max-width: 500px;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1024px) {
    padding: 18px;
    gap: 16px;
  }
`;

const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const InputLabel = styled.label`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  min-width: 90px;

  @media (max-width: 1024px) {
    font-size: 15px;
    min-width: 80px;
  }
`;

const InputWrapper = styled.div`
  position: relative;
  flex: 1;
`;

const InputField = styled.input`
  width: 100%;
  padding: 12px 40px 12px 12px;
  font-size: 16px;
  border: 2px solid ${(props) => {
    if (props.$correct) return props.theme.colors.buttonSuccess;
    if (props.$incorrect) return props.theme.colors.error;
    return props.theme.colors.border;
  }};
  background: ${(props) => {
    if (props.$correct) return `${props.theme.colors.buttonSuccess}10`;
    if (props.$incorrect) return `${props.theme.colors.error}10`;
    return props.theme.colors.inputBackground;
  }};
  color: ${(props) => props.theme.colors.textPrimary};
  border-radius: 8px;
  outline: none;
  transition: all 0.2s;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 10px 36px 10px 10px;
  }
`;

const Checkmark = styled.span`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-size: 24px;
  font-weight: 700;
  animation: ${fadeIn} 0.3s ease-out;
`;

const UnitLabel = styled.span`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  min-width: 40px;

  @media (max-width: 1024px) {
    font-size: 14px;
    min-width: 35px;
  }
`;

const OpenCanvasButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info};
  color: ${(props) => props.theme.colors.textInverted};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 12px 24px;
    font-size: 15px;
  }
`;

const SuccessMessage = styled.div`
  padding: 16px 24px;
  background: ${(props) => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${(props) => props.theme.colors.buttonSuccess};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 12px 20px;
  }
`;

// Canvas Overlay Components
const CanvasOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
  animation: ${fadeIn} 0.3s ease-out;
`;

const CanvasContent = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 16px;
  width: 90%;
  max-width: 700px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
`;

const CanvasHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 2px solid ${(props) => props.theme.colors.border};

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const CanvasTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const CloseButton = styled.button`
  background: transparent;
  border: none;
  font-size: 36px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
    transform: scale(1.1);
  }
`;

const CanvasBody = styled.div`
  padding: 20px;
  overflow-y: auto;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const DrawingArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const DrawingInstructions = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  margin: 0;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const WorkTextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  font-family: 'Courier New', monospace;
  border: 2px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.inputBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  border-radius: 8px;
  outline: none;
  resize: vertical;
  min-height: 200px;

  &:focus {
    border-color: ${(props) => props.theme.colors.primary};
  }

  @media (max-width: 1024px) {
    font-size: 15px;
    padding: 12px;
  }
`;
