/**
 * Level 5: Word Problems Component
 *
 * Real-world application with:
 * - Keyword highlighting (color-coded by type)
 * - Translation Helper (auto-shows Q1-5 after 10sec)
 * - Context Clue Card (toggleable reference)
 * - DrawingCanvas for sketching problem
 *
 * Learning Objective: Translate real-world scenarios into mathematical problems
 */

import React, { useState, useEffect, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import { Stage, Layer, Rect } from 'react-konva';
import { useWindowDimensions, useKonvaTheme } from '../../../../../hooks';
import ShapeVisualizer from './ShapeVisualizer';

// Keyword color mapping
const KEYWORD_COLORS = {
  shape: '#3B82F6', // Blue
  dimension: '#10B981', // Green
  perimeter: '#8B5CF6', // Purple
  area: '#F59E0B', // Orange
  question: '#EF4444', // Red
};

function Level5WordProblem({
  visualData,
  questionText,
  questionIndex,
  currentQuestionIndex,
  onCanvasOpen,
  disabled,
}) {
  const { width } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();

  const [showTranslationHelper, setShowTranslationHelper] = useState(false);
  const [showContextClues, setShowContextClues] = useState(false);
  const [autoShowTimer, setAutoShowTimer] = useState(null);

  const { context, keywords = [], keywordTypes = {} } = visualData || {};

  // Calculate canvas dimensions
  const canvasWidth = useMemo(() => {
    const baseMax = Math.min(width - 40, 600);
    if (width <= 1024) return Math.min(baseMax, 400);
    return baseMax;
  }, [width]);

  const canvasHeight = 400;

  // Auto-show translation helper for Q1-5 after 10 seconds
  useEffect(() => {
    if (currentQuestionIndex < 5 && !showTranslationHelper) {
      const timer = setTimeout(() => {
        setShowTranslationHelper(true);
      }, 10000); // 10 seconds

      setAutoShowTimer(timer);

      return () => clearTimeout(timer);
    }
  }, [currentQuestionIndex, showTranslationHelper]);

  // Reset on new problem
  useEffect(() => {
    setShowTranslationHelper(false);
    setShowContextClues(false);
    if (autoShowTimer) {
      clearTimeout(autoShowTimer);
    }
  }, [questionIndex]);

  // Highlight keywords in text
  const renderHighlightedText = () => {
    if (!keywords || keywords.length === 0) {
      return <span>{questionText}</span>;
    }

    let highlightedText = questionText;
    const segments = [];
    let lastIndex = 0;

    // Sort keywords by position in text
    const keywordPositions = keywords
      .map((kw) => ({
        keyword: kw,
        index: questionText.toLowerCase().indexOf(kw.toLowerCase()),
        type: keywordTypes[kw] || 'default',
      }))
      .filter((kw) => kw.index >= 0)
      .sort((a, b) => a.index - b.index);

    keywordPositions.forEach((kw, idx) => {
      // Add text before keyword
      if (kw.index > lastIndex) {
        segments.push(
          <span key={`text-${idx}`}>{questionText.substring(lastIndex, kw.index)}</span>
        );
      }

      // Add highlighted keyword
      const color = KEYWORD_COLORS[kw.type] || KEYWORD_COLORS.area;
      segments.push(
        <Keyword key={`kw-${idx}`} $color={color}>
          {questionText.substring(kw.index, kw.index + kw.keyword.length)}
        </Keyword>
      );

      lastIndex = kw.index + kw.keyword.length;
    });

    // Add remaining text
    if (lastIndex < questionText.length) {
      segments.push(<span key="text-end">{questionText.substring(lastIndex)}</span>);
    }

    return segments;
  };

  // Extract problem components for translation helper
  const extractProblemComponents = () => {
    const components = [];

    // Shape type
    if (questionText.toLowerCase().includes('rectangular')) {
      components.push({ label: 'Shape', value: 'Rectangle', icon: '▭' });
    } else if (questionText.toLowerCase().includes('square')) {
      components.push({ label: 'Shape', value: 'Square', icon: '▢' });
    }

    // Dimensions - extract numbers
    const numbers = questionText.match(/\d+/g) || [];
    if (numbers.length >= 2) {
      components.push({ label: 'Length', value: `${numbers[0]} units`, icon: '↔' });
      components.push({ label: 'Width', value: `${numbers[1]} units`, icon: '↕' });
    }

    // What to find
    if (questionText.toLowerCase().includes('fence') || questionText.toLowerCase().includes('around')) {
      components.push({ label: 'Find', value: 'Perimeter (distance around)', icon: '⬚' });
    } else if (questionText.toLowerCase().includes('area') || questionText.toLowerCase().includes('cover')) {
      components.push({ label: 'Find', value: 'Area (space inside)', icon: '▦' });
    }

    return components;
  };

  return (
    <Container>
      {/* Highlighted question text */}
      <QuestionDisplay>{renderHighlightedText()}</QuestionDisplay>

      {/* Visual representation (if available) */}
      {visualData && visualData.shapeType && (
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
      )}

      {/* Translation Helper */}
      {showTranslationHelper && (
        <TranslationHelper>
          <HelperTitle>Problem Translation ✓</HelperTitle>
          <ComponentsList>
            {extractProblemComponents().map((comp, idx) => (
              <ComponentItem key={idx}>
                <ComponentIcon>{comp.icon}</ComponentIcon>
                <ComponentLabel>{comp.label}:</ComponentLabel>
                <ComponentValue>{comp.value}</ComponentValue>
              </ComponentItem>
            ))}
          </ComponentsList>
          <CloseHelperButton onClick={() => setShowTranslationHelper(false)}>
            Hide Translation
          </CloseHelperButton>
        </TranslationHelper>
      )}

      {/* Context Clue Card Toggle */}
      <ToggleButton onClick={() => setShowContextClues(!showContextClues)}>
        {showContextClues ? 'Hide' : 'Show'} Context Clues
      </ToggleButton>

      {/* Context Clue Card */}
      {showContextClues && (
        <ContextClueCard>
          <ClueSection>
            <ClueSectionTitle>AREA Keywords:</ClueSectionTitle>
            <ClueKeywords>
              surface • floor • carpet • paint • cover • fill • space inside • square units
            </ClueKeywords>
          </ClueSection>
          <ClueSection>
            <ClueSectionTitle>PERIMETER Keywords:</ClueSectionTitle>
            <ClueKeywords>
              fence • frame • border • edge • around • distance around • outline • trim
            </ClueKeywords>
          </ClueSection>
          <ClueSection>
            <ClueSectionTitle>Shape Clues:</ClueSectionTitle>
            <ClueKeywords>
              rectangular • square • length • width • side • dimensions
            </ClueKeywords>
          </ClueSection>
        </ContextClueCard>
      )}

      {/* Open Canvas Button */}
      <OpenCanvasButton onClick={onCanvasOpen} disabled={disabled}>
        Open Canvas to Sketch Problem
      </OpenCanvasButton>

      {/* Show translation helper button (Q1-5) */}
      {!showTranslationHelper && currentQuestionIndex < 5 && (
        <ShowHelperButton onClick={() => setShowTranslationHelper(true)}>
          Need Help Translating?
        </ShowHelperButton>
      )}
    </Container>
  );
}

export default Level5WordProblem;

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

const QuestionDisplay = styled.div`
  font-size: 18px;
  line-height: 1.8;
  color: ${(props) => props.theme.colors.textPrimary};
  padding: 20px;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  border-left: 4px solid ${(props) => props.theme.colors.primary};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    font-size: 16px;
    padding: 16px;
  }
`;

const Keyword = styled.span`
  background-color: ${(props) => props.$color}20;
  color: ${(props) => props.$color};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
  border: 1px solid ${(props) => props.$color}40;
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

const TranslationHelper = styled.div`
  width: 100%;
  background: ${(props) => props.theme.colors.buttonSuccess}15;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const HelperTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 17px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

const ComponentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ComponentItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  background: ${(props) => props.theme.colors.cardBackground};
  border-radius: 8px;

  @media (max-width: 1024px) {
    padding: 8px;
  }
`;

const ComponentIcon = styled.span`
  font-size: 24px;

  @media (max-width: 1024px) {
    font-size: 20px;
  }
`;

const ComponentLabel = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  min-width: 60px;

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const ComponentValue = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const CloseHelperButton = styled.button`
  width: 100%;
  padding: 10px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  background: transparent;
  color: ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.buttonSuccess}20;
  }

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px;
  }
`;

const ContextClueCard = styled.div`
  width: 100%;
  background: ${(props) => props.theme.colors.info}12;
  border: 2px solid ${(props) => props.theme.colors.info};
  border-radius: 12px;
  padding: 20px;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const ClueSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 1024px) {
    margin-bottom: 12px;
  }
`;

const ClueSectionTitle = styled.h5`
  margin: 0 0 8px 0;
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.info};

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const ClueKeywords = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 13px;
  }
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid ${(props) => props.theme.colors.border};
  background: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textSecondary};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px 16px;
  }
`;

const OpenCanvasButton = styled.button`
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.primary};
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

const ShowHelperButton = styled.button`
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: 2px solid ${(props) => props.theme.colors.warning};
  background: ${(props) => props.theme.colors.warning}15;
  color: ${(props) => props.theme.colors.warning};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => props.theme.colors.warning}25;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    font-size: 13px;
    padding: 8px 16px;
  }
`;
