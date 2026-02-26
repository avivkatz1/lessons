import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import GridBackground from './GridBackground';
import DimensionLabel from './DimensionLabel';
import { useWindowDimensions, useKonvaTheme } from '../../../../../../hooks';

/**
 * Level 8: Word Problems
 * Real-world applications with keyword highlighting and context clues
 */
function Level8WordProblems({ visualData, onComplete, questionIndex = 0 }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const {
    shapeType = 'rectangle',
    length,
    width,
    side,
    area,
    perimeter,
    context = 'garden', // 'garden', 'fencing', 'room', 'carpet', 'painting'
    askingFor = 'area', // 'area', 'perimeter', 'both'
    keywords = [],
    keywordTypes = {}, // Maps keywords to types: 'shape', 'dimension', 'area', 'perimeter'
  } = visualData;

  const [areaInput, setAreaInput] = useState('');
  const [perimeterInput, setPerimeterInput] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Canvas sizing (iPad optimized)
  const canvasSize = useMemo(() => {
    const baseMax = Math.min(windowWidth - 40, 500);
    if (windowWidth <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [windowWidth]);

  const gridSize = 10;
  const cellSize = canvasSize / gridSize;

  // Position shape
  const startX = cellSize * 2;
  const startY = cellSize * 3;
  const displayLength = (length || side) * (cellSize * 0.4);
  const displayWidth = (width || side) * (cellSize * 0.4);

  // Validate answer
  const handleSubmit = () => {
    if (submitted) return;

    let isCorrect = false;
    if (askingFor === 'area') {
      isCorrect = parseInt(areaInput) === area;
    } else if (askingFor === 'perimeter') {
      isCorrect = parseInt(perimeterInput) === perimeter;
    } else if (askingFor === 'both') {
      isCorrect = parseInt(areaInput) === area && parseInt(perimeterInput) === perimeter;
    }

    setSubmitted(true);
    if (isCorrect && onComplete) {
      setTimeout(() => onComplete(true), 500);
    }
  };

  // Reset
  const handleReset = () => {
    setAreaInput('');
    setPerimeterInput('');
    setSubmitted(false);
  };

  // Check correctness
  const areaCorrect = parseInt(areaInput) === area;
  const perimeterCorrect = parseInt(perimeterInput) === perimeter;
  const allCorrect = askingFor === 'area' ? areaCorrect :
                     askingFor === 'perimeter' ? perimeterCorrect :
                     areaCorrect && perimeterCorrect;

  // Get context emoji
  const contextEmoji = {
    garden: '🌱',
    fencing: '🚧',
    room: '🏫',
    carpet: '🏠',
    painting: '🎨',
  }[context] || '📐';

  return (
    <Container>
      {/* Context banner */}
      <ContextBanner>
        <ContextEmoji>{contextEmoji}</ContextEmoji>
        <ContextLabel>Real-World Problem</ContextLabel>
      </ContextBanner>

      {/* Keyword legend */}
      <KeywordLegend>
        <LegendTitle>Look for these clues:</LegendTitle>
        <LegendRow>
          <LegendItem $color="#3B82F6">Shape info</LegendItem>
          <LegendItem $color="#F59E0B">Dimensions</LegendItem>
          <LegendItem $color="#4ade80">Area clue</LegendItem>
          <LegendItem $color="#EC4899">Perimeter clue</LegendItem>
        </LegendRow>
      </KeywordLegend>

      {/* Canvas with shape */}
      <CanvasContainer>
        <Stage width={canvasSize} height={canvasSize}>
          <Layer>
            {/* Background */}
            <Rect
              x={0}
              y={0}
              width={canvasSize}
              height={canvasSize}
              fill={konvaTheme.canvasBackground}
            />

            {/* Grid */}
            <GridBackground
              width={canvasSize}
              height={canvasSize}
              gridSize={gridSize}
              konvaTheme={konvaTheme}
            />

            {/* Rectangle/Square shape */}
            <Rect
              x={startX}
              y={startY}
              width={displayLength}
              height={displayWidth}
              fill={konvaTheme.shapeFill || '#3B82F6'}
              fillOpacity={0.4}
              stroke={konvaTheme.shapeStroke}
              strokeWidth={3}
              listening={false}
            />

            {/* Dimensions */}
            <DimensionLabel
              x1={startX}
              y1={startY + displayWidth}
              x2={startX + displayLength}
              y2={startY + displayWidth}
              label={`${length || side} ${context === 'garden' ? 'm' : 'ft'}`}
              orientation="horizontal"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={15}
            />
            <DimensionLabel
              x1={startX}
              y1={startY}
              x2={startX}
              y2={startY + displayWidth}
              label={`${width || side} ${context === 'garden' ? 'm' : 'ft'}`}
              orientation="vertical"
              offset={20}
              konvaTheme={konvaTheme}
              fontSize={15}
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Helper hint */}
      <HintBox>
        <HintTitle>Remember:</HintTitle>
        <HintText>
          <strong>Area</strong> = covering a surface (square units)
          <br />
          <strong>Perimeter</strong> = distance around edges (linear units)
        </HintText>
      </HintBox>

      {/* Input fields */}
      <InputSection>
        {(askingFor === 'area' || askingFor === 'both') && (
          <InputRow>
            <InputLabel>Area:</InputLabel>
            <InputField
              type="number"
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              placeholder="?"
              disabled={submitted}
              $isCorrect={submitted && areaCorrect}
              $isWrong={submitted && !areaCorrect}
            />
            <UnitLabel>{context === 'garden' ? 'm²' : 'sq ft'}</UnitLabel>
          </InputRow>
        )}

        {(askingFor === 'perimeter' || askingFor === 'both') && (
          <InputRow>
            <InputLabel>Perimeter:</InputLabel>
            <InputField
              type="number"
              value={perimeterInput}
              onChange={(e) => setPerimeterInput(e.target.value)}
              placeholder="?"
              disabled={submitted}
              $isCorrect={submitted && perimeterCorrect}
              $isWrong={submitted && !perimeterCorrect}
            />
            <UnitLabel>{context === 'garden' ? 'm' : 'ft'}</UnitLabel>
          </InputRow>
        )}
      </InputSection>

      {/* Feedback */}
      {submitted && (
        <FeedbackSection $isCorrect={allCorrect}>
          {allCorrect ? (
            <FeedbackText>
              Correct!
              {askingFor === 'area' && ` Area = ${area} ${context === 'garden' ? 'm²' : 'sq ft'}`}
              {askingFor === 'perimeter' && ` Perimeter = ${perimeter} ${context === 'garden' ? 'm' : 'ft'}`}
              {askingFor === 'both' && ` Area = ${area} ${context === 'garden' ? 'm²' : 'sq ft'}, Perimeter = ${perimeter} ${context === 'garden' ? 'm' : 'ft'}`}
            </FeedbackText>
          ) : (
            <FeedbackText>
              Not quite. Re-read the problem carefully and check which measurement is being asked for.
            </FeedbackText>
          )}
        </FeedbackSection>
      )}

      {/* Action buttons */}
      <ButtonRow>
        <ResetButton onClick={handleReset}>
          Reset
        </ResetButton>
        <SubmitButton
          onClick={handleSubmit}
          disabled={submitted || (askingFor === 'area' ? !areaInput : askingFor === 'perimeter' ? !perimeterInput : !areaInput || !perimeterInput)}
          $isActive={askingFor === 'area' ? !!areaInput : askingFor === 'perimeter' ? !!perimeterInput : !!(areaInput && perimeterInput)}
        >
          {submitted ? (allCorrect ? 'Correct ✓' : 'Try Again') : 'Submit'}
        </SubmitButton>
      </ButtonRow>
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 16px;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const ContextBanner = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 28px;
  background: linear-gradient(135deg, ${props => props.theme.colors.info || '#3B82F6'} 0%, ${props => props.theme.colors.buttonSuccess || '#4ade80'} 100%);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  @media (max-width: 1024px) {
    padding: 12px 24px;
    gap: 8px;
  }
`;

const ContextEmoji = styled.span`
  font-size: 32px;

  @media (max-width: 1024px) {
    font-size: 28px;
  }
`;

const ContextLabel = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: white;

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const KeywordLegend = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  width: 100%;
  max-width: 600px;

  @media (max-width: 1024px) {
    padding: 10px 16px;
  }
`;

const LegendTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 4px;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const LegendRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const LegendItem = styled.div`
  padding: 6px 12px;
  background-color: ${props => props.$color + '20'};
  border-left: 4px solid ${props => props.$color};
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const HintBox = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.theme.colors.info + '15'};
  border-left: 4px solid ${props => props.theme.colors.info || '#3B82F6'};
  border-radius: 8px;
  width: 100%;
  max-width: 600px;

  @media (max-width: 1024px) {
    padding: 12px 20px;
  }
`;

const HintTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.info || '#3B82F6'};
  margin-bottom: 8px;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const HintText = styled.div`
  font-size: 14px;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;

  strong {
    color: ${props => props.theme.colors.info || '#3B82F6'};
  }

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const InputSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
  max-width: 500px;
  padding: 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border: 2px solid ${props => props.theme.colors.border};

  @media (max-width: 1024px) {
    gap: 12px;
    padding: 16px;
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
  color: ${props => props.theme.colors.textPrimary};
  min-width: 100px;

  @media (max-width: 1024px) {
    font-size: 15px;
    min-width: 90px;
  }
`;

const InputField = styled.input`
  flex: 1;
  padding: 12px 16px;
  font-size: 18px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props =>
    props.$isCorrect ? props.theme.colors.buttonSuccess :
    props.$isWrong ? props.theme.colors.buttonDanger :
    props.theme.colors.border
  };
  background-color: ${props => props.theme.colors.pageBackground};
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  min-height: 44px;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.info || '#3B82F6'};
  }

  &:disabled {
    opacity: 0.7;
  }

  @media (max-width: 1024px) {
    padding: 10px 14px;
    font-size: 16px;
  }
`;

const UnitLabel = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textSecondary};
  min-width: 60px;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess + '20'
    : props.theme.colors.buttonDanger + '20'
  };
  border-radius: 8px;
  border: 2px solid ${props => props.$isCorrect
    ? props.theme.colors.buttonSuccess
    : props.theme.colors.buttonDanger
  };

  @media (max-width: 1024px) {
    padding: 12px 20px;
  }
`;

const FeedbackText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  background-color: ${props => props.theme.colors.cardBackground};
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.$isActive
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.buttonNeutral || '#9CA3AF'
  };
  color: ${props => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

export default Level8WordProblems;
