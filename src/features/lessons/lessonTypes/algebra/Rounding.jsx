import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { Stage, Layer, Rect, Line, Circle, Text as KonvaText } from 'react-konva';
import { useLessonState, useWindowDimensions, useKonvaTheme } from '../../../../hooks';
import { InputOverlayPanel, UnifiedMathKeypad, EnterAnswerButton } from '../../../../shared/components';
import { useInputOverlay } from '../geometry/hooks/useInputOverlay';
import TouchDragHandle from '../../../../shared/helpers/TouchDragHandle';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: {
    title: 'Drag to the Rounded Value',
    instruction: 'Drag the blue dot to where the number rounds to.',
  },
  2: {
    title: 'Round Up or Round Down?',
    instruction: 'Decide whether the number will round up or down.',
  },
  3: {
    title: 'Find the Key Digit',
    instruction: 'Tap the digit that tells us whether to round up or down.',
  },
  4: {
    title: 'Type the Answer',
    instruction: 'Round the number to the given place value.',
  },
  5: {
    title: 'Type the Answer',
    instruction: 'Round the number to the given place value.',
  },
  6: {
    title: 'Word Problems',
    instruction: 'Solve the real-world rounding problem.',
  },
};

// Context icons for word problems
const CONTEXT_ICONS = {
  money: '💵',
  distance: '📏',
  population: '👥',
  science: '🔬',
  temperature: '🌡️',
};

// ==================== HELPERS ====================

function formatNumber(num) {
  const parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  return parts.join('.');
}

// ==================== ANIMATIONS ====================

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

// ==================== LEVEL 1: DRAGGABLE NUMBER LINE ====================

function Level1DraggableNumberLine({ visualData, onCorrect }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const {
    originalNumber,
    lowerBound,
    upperBound,
    midpoint,
    numberLinePositions,
  } = visualData;

  const canvasWidth = Math.min(windowWidth - 40, 700);
  const canvasHeight = 200;
  const padding = 60;
  const lineY = canvasHeight / 2;
  const lineStart = padding;
  const lineEnd = canvasWidth - padding;
  const lineLength = lineEnd - lineStart;

  // Convert percentage to pixel position
  const percentToX = (percent) => lineStart + (lineLength * percent) / 100;

  const [draggedDotX, setDraggedDotX] = useState(null);
  const [snapFeedback, setSnapFeedback] = useState(null); // "correct" | "wrong" | null
  const [isDragging, setIsDragging] = useState(false);

  const originalX = percentToX(numberLinePositions.originalX);
  const correctX = percentToX(numberLinePositions.correctX);
  const midpointX = percentToX(numberLinePositions.midpointX);

  const currentDotX = draggedDotX !== null ? draggedDotX : originalX;

  // Reset state when new problem loads
  useEffect(() => {
    setDraggedDotX(null);
    setSnapFeedback(null);
    setIsDragging(false);
  }, [originalNumber]);

  const handleDragStart = () => {
    setIsDragging(true);
  };

  const handleDragMove = (e) => {
    const newX = e.target.x();
    setDraggedDotX(newX);
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    const finalX = e.target.x();
    setDraggedDotX(finalX);

    // Check if within snap tolerance (20px)
    const tolerance = 20;
    if (Math.abs(finalX - correctX) < tolerance) {
      // Correct! Snap to exact position
      setDraggedDotX(correctX);
      setSnapFeedback('correct');
      setTimeout(() => {
        onCorrect();
      }, 800);
    } else {
      // Wrong - show red feedback
      setSnapFeedback('wrong');
      setTimeout(() => {
        setSnapFeedback(null);
      }, 600);
    }
  };

  // Constrain drag to horizontal only
  const dragBoundFunc = (pos) => {
    return {
      x: Math.max(lineStart, Math.min(lineEnd, pos.x)),
      y: lineY,
    };
  };

  return (
    <CanvasContainer>
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={canvasWidth}
            height={canvasHeight}
            fill={konvaTheme.canvasBackground}
          />

          {/* Number line track - white for visibility in dark mode */}
          <Line
            points={[lineStart, lineY, lineEnd, lineY]}
            stroke="#FFFFFF"
            strokeWidth={6}
          />

          {/* Lower bound marker */}
          <Circle
            x={lineStart}
            y={lineY}
            radius={8}
            fill="#FFFFFF"
          />
          <KonvaText
            x={lineStart - 40}
            y={lineY + 20}
            text={formatNumber(lowerBound)}
            fontSize={16}
            fontFamily="system-ui"
            fill="#FFFFFF"
            fontStyle="bold"
          />

          {/* Upper bound marker */}
          <Circle
            x={lineEnd}
            y={lineY}
            radius={8}
            fill="#FFFFFF"
          />
          <KonvaText
            x={lineEnd - 40}
            y={lineY + 20}
            text={formatNumber(upperBound)}
            fontSize={16}
            fontFamily="system-ui"
            fill="#FFFFFF"
            fontStyle="bold"
          />

          {/* Midpoint marker - more visible */}
          <Line
            points={[midpointX, lineY - 15, midpointX, lineY + 15]}
            stroke="#F59E0B"
            strokeWidth={3}
            dash={[6, 4]}
          />
          <KonvaText
            x={midpointX - 30}
            y={lineY - 38}
            text={formatNumber(midpoint)}
            fontSize={14}
            fontFamily="system-ui"
            fill="#F59E0B"
            fontStyle="bold"
          />

          {/* Original number position (static red dot) */}
          <Circle
            x={originalX}
            y={lineY - 30}
            radius={5}
            fill="#EF4444"
          />
          <KonvaText
            x={originalX - 35}
            y={lineY - 54}
            text={formatNumber(originalNumber)}
            fontSize={14}
            fontFamily="system-ui"
            fill="#EF4444"
            fontStyle="bold"
          />

          {/* Draggable blue dot */}
          <TouchDragHandle
            x={currentDotX}
            y={lineY}
            radius={10}
            hitRadius={22}
            fill={
              snapFeedback === 'correct'
                ? '#10B981'
                : snapFeedback === 'wrong'
                ? '#EF4444'
                : isDragging
                ? '#8B5CF6'
                : '#3B82F6'
            }
            stroke={konvaTheme.pageBackground}
            strokeWidth={3}
            draggable={true}
            onDragStart={handleDragStart}
            onDragMove={handleDragMove}
            onDragEnd={handleDragEnd}
            dragBoundFunc={dragBoundFunc}
          />

          {/* Feedback text */}
          {snapFeedback === 'correct' && (
            <KonvaText
              x={canvasWidth / 2 - 50}
              y={20}
              text="✓ Correct!"
              fontSize={20}
              fontFamily="system-ui"
              fill="#10B981"
              fontStyle="bold"
            />
          )}
          {snapFeedback === 'wrong' && (
            <KonvaText
              x={canvasWidth / 2 - 50}
              y={20}
              text="Try again"
              fontSize={18}
              fontFamily="system-ui"
              fill="#EF4444"
              fontStyle="bold"
            />
          )}
        </Layer>
      </Stage>
      <HintText>Drag the blue dot horizontally to the rounded answer.</HintText>
    </CanvasContainer>
  );
}

// ==================== LEVEL 2: BINARY CHOICE BUTTONS ====================

function Level2BinaryChoice({ visualData, onCorrect }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const {
    originalNumber,
    lowerBound,
    upperBound,
    numberLinePositions,
    roundDirection,
  } = visualData;

  const [shakingIdx, setShakingIdx] = useState(null);
  const [phase, setPhase] = useState('interact'); // "interact" | "complete"

  // Reset state when new problem loads
  useEffect(() => {
    setShakingIdx(null);
    setPhase('interact');
  }, [originalNumber]);

  const canvasWidth = Math.min(windowWidth - 40, 600);
  const canvasHeight = 150;
  const padding = 60;
  const lineY = canvasHeight / 2;
  const lineStart = padding;
  const lineEnd = canvasWidth - padding;
  const lineLength = lineEnd - lineStart;

  const percentToX = (percent) => lineStart + (lineLength * percent) / 100;

  const originalX = percentToX(numberLinePositions.originalX);
  const midpointX = percentToX(numberLinePositions.midpointX);

  const handleChoiceClick = (choice, index) => {
    if (phase !== 'interact' || shakingIdx !== null) return;

    if (choice === roundDirection) {
      // Correct
      setPhase('complete');
      setTimeout(() => {
        onCorrect();
      }, 800);
    } else {
      // Wrong
      setShakingIdx(index);
      setTimeout(() => setShakingIdx(null), 600);
    }
  };

  return (
    <div>
      {/* Static number line for reference */}
      <CanvasContainer>
        <Stage width={canvasWidth} height={canvasHeight}>
          <Layer>
            <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

            {/* Number line - white for visibility */}
            <Line points={[lineStart, lineY, lineEnd, lineY]} stroke="#FFFFFF" strokeWidth={5} />

            {/* Bounds */}
            <Circle x={lineStart} y={lineY} radius={7} fill="#FFFFFF" />
            <KonvaText
              x={lineStart - 30}
              y={lineY + 16}
              text={formatNumber(lowerBound)}
              fontSize={14}
              fontFamily="system-ui"
              fill="#FFFFFF"
              fontStyle="bold"
            />

            <Circle x={lineEnd} y={lineY} radius={7} fill="#FFFFFF" />
            <KonvaText
              x={lineEnd - 30}
              y={lineY + 16}
              text={formatNumber(upperBound)}
              fontSize={14}
              fontFamily="system-ui"
              fill="#FFFFFF"
              fontStyle="bold"
            />

            {/* Midpoint */}
            <Line
              points={[midpointX, lineY - 12, midpointX, lineY + 12]}
              stroke="#F59E0B"
              strokeWidth={3}
              dash={[5, 3]}
            />

            {/* Original number */}
            <Circle x={originalX} y={lineY} radius={8} fill="#3B82F6" stroke={konvaTheme.pageBackground} strokeWidth={2} />
            <KonvaText
              x={originalX - 30}
              y={lineY - 28}
              text={formatNumber(originalNumber)}
              fontSize={14}
              fontFamily="system-ui"
              fill="#3B82F6"
              fontStyle="bold"
            />
          </Layer>
        </Stage>
      </CanvasContainer>

      {/* Binary choice buttons */}
      <ButtonRow>
        <ChoiceButton
          $borderColor="#EF4444"
          $shake={shakingIdx === 0}
          onClick={() => handleChoiceClick('down', 0)}
          disabled={phase === 'complete'}
        >
          Round Down ↓
        </ChoiceButton>
        <ChoiceButton
          $borderColor="#10B981"
          $shake={shakingIdx === 1}
          onClick={() => handleChoiceClick('up', 1)}
          disabled={phase === 'complete'}
        >
          Round Up ↑
        </ChoiceButton>
      </ButtonRow>
    </div>
  );
}

// ==================== LEVEL 3: TAP THE DIGIT ====================

function Level3TapDigit({ visualData, onCorrect }) {
  const { digits, digitLabels, determiningDigitIdx, placeDisplayName } = visualData;

  const [selectedDigitIdx, setSelectedDigitIdx] = useState(null);
  const [shakeIdx, setShakeIdx] = useState(null);
  const [phase, setPhase] = useState('interact');

  // Reset state when new problem loads
  useEffect(() => {
    setSelectedDigitIdx(null);
    setShakeIdx(null);
    setPhase('interact');
  }, [digits.join('')]);

  const handleDigitTap = (idx) => {
    if (phase !== 'interact' || shakeIdx !== null || digits[idx] === '.') return;

    if (idx === determiningDigitIdx) {
      // Correct
      setSelectedDigitIdx(idx);
      setPhase('complete');
      setTimeout(() => {
        onCorrect();
      }, 600);
    } else {
      // Wrong
      setShakeIdx(idx);
      setTimeout(() => setShakeIdx(null), 600);
    }
  };

  return (
    <TapDigitContainer>
      <HintText>Look for the digit to the RIGHT of the {placeDisplayName} place.</HintText>

      <DigitContainer>
        {digits.map((digit, idx) => (
          <DigitButton
            key={idx}
            onClick={() => handleDigitTap(idx)}
            $selected={selectedDigitIdx === idx}
            $shake={shakeIdx === idx}
            $isPeriod={digit === '.'}
            disabled={digit === '.' || phase === 'complete'}
          >
            {digit}
            <PlaceLabel $isPeriod={digit === '.'}>{digitLabels[idx]}</PlaceLabel>
          </DigitButton>
        ))}
      </DigitContainer>
    </TapDigitContainer>
  );
}

// ==================== LEVELS 4-5: TYPE ANSWER WITH INPUT PANEL ====================

function Level4TypeAnswerFull({ visualData, onCorrect, onNextProblem, modalClosedWithX }) {
  return (
    <TypeAnswerWithPanel
      visualData={visualData}
      onCorrect={onCorrect}
      onNextProblem={onNextProblem}
      modalClosedWithX={modalClosedWithX}
      showNumberLine={true}
      level={4}
    />
  );
}

function Level5TypeAnswerMinimal({ visualData, onCorrect, onNextProblem, modalClosedWithX }) {
  return (
    <TypeAnswerWithPanel
      visualData={visualData}
      onCorrect={onCorrect}
      onNextProblem={onNextProblem}
      modalClosedWithX={modalClosedWithX}
      showNumberLine={false} // Can be toggled by student
      level={5}
    />
  );
}

function TypeAnswerWithPanel({ visualData, onCorrect, onNextProblem, modalClosedWithX, showNumberLine: initialShowNumberLine, level }) {
  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const {
    originalNumber,
    lowerBound,
    upperBound,
    numberLinePositions,
    roundedAnswer,
  } = visualData;

  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
    keepOpen,
    setKeepOpen,
  } = useInputOverlay();

  const [showNumberLine, setShowNumberLine] = useState(initialShowNumberLine);

  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0;
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75;
  }, [windowWidth]);

  const canvasWidth = Math.min(windowWidth - 40, 600);
  const canvasHeight = 150;
  const padding = 60;
  const lineY = canvasHeight / 2;
  const lineStart = padding;
  const lineEnd = canvasWidth - padding;
  const lineLength = lineEnd - lineStart;

  const percentToX = (percent) => lineStart + (lineLength * percent) / 100;

  const originalX = percentToX(numberLinePositions.originalX);
  const midpointX = percentToX(numberLinePositions.midpointX);
  const correctX = percentToX(numberLinePositions.correctX);

  // Parse input and check correctness
  const inputNumeric = parseFloat(inputValue.replace(/,/g, ''));
  const isCorrect = !isNaN(inputNumeric) && inputNumeric === roundedAnswer;

  // Reset on problem change
  useEffect(() => {
    if (!keepOpen) {
      resetAll();
      setShowNumberLine(initialShowNumberLine);
    } else {
      setInputValue('');
      setSubmitted(false);
    }
  }, [visualData.originalNumber, keepOpen, resetAll, setInputValue, setSubmitted, initialShowNumberLine]);

  const handleSubmit = () => {
    if (inputValue.trim() === '') return;

    setSubmitted(true);

    if (isCorrect) {
      if (keepOpen) {
        // Keep Open mode: auto-advance
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          onNextProblem?.();
        }, 1000);
      } else {
        // Normal mode: close panel and show modal
        closePanel();
        setTimeout(() => {
          onCorrect(true);
        }, 500);
      }
    }
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleNextProblem = () => {
    resetAll();
    setShowNumberLine(initialShowNumberLine);
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
        {/* Number line (optional for Level 5) */}
        {showNumberLine && (
          <CanvasContainer>
            <Stage width={canvasWidth} height={canvasHeight}>
              <Layer>
                <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={konvaTheme.canvasBackground} />

                <Line points={[lineStart, lineY, lineEnd, lineY]} stroke="#FFFFFF" strokeWidth={5} />

                <Circle x={lineStart} y={lineY} radius={7} fill="#FFFFFF" />
                <KonvaText
                  x={lineStart - 30}
                  y={lineY + 16}
                  text={formatNumber(lowerBound)}
                  fontSize={14}
                  fontFamily="system-ui"
                  fill="#FFFFFF"
                  fontStyle="bold"
                />

                <Circle x={lineEnd} y={lineY} radius={7} fill="#FFFFFF" />
                <KonvaText
                  x={lineEnd - 30}
                  y={lineY + 16}
                  text={formatNumber(upperBound)}
                  fontSize={14}
                  fontFamily="system-ui"
                  fill="#FFFFFF"
                  fontStyle="bold"
                />

                <Line
                  points={[midpointX, lineY - 12, midpointX, lineY + 12]}
                  stroke="#F59E0B"
                  strokeWidth={3}
                  dash={[5, 3]}
                />

                <Circle x={originalX} y={lineY} radius={8} fill="#3B82F6" stroke={konvaTheme.pageBackground} strokeWidth={2} />
                <KonvaText
                  x={originalX - 30}
                  y={lineY - 28}
                  text={formatNumber(originalNumber)}
                  fontSize={14}
                  fontFamily="system-ui"
                  fill="#3B82F6"
                  fontStyle="bold"
                />

                {/* Show correct answer if submitted and correct */}
                {submitted && isCorrect && (
                  <Circle x={correctX} y={lineY} radius={10} fill="#10B981" stroke={konvaTheme.pageBackground} strokeWidth={3} />
                )}
              </Layer>
            </Stage>
          </CanvasContainer>
        )}

        {/* Toggle helper button (Level 5 only) */}
        {level === 5 && (
          <ToggleHelperButton onClick={() => setShowNumberLine(!showNumberLine)}>
            {showNumberLine ? 'Hide' : 'Show'} Number Line
          </ToggleHelperButton>
        )}

        {/* Enter Answer button (static) */}
        {!panelOpen && (
          <ButtonContainer>
            {modalClosedWithX ? (
              <TryAnotherButton onClick={handleNextProblem}>Try Another Problem</TryAnotherButton>
            ) : (
              <EnterAnswerButton onClick={openPanel} disabled={submitted && isCorrect} variant="static" />
            )}
          </ButtonContainer>
        )}
      </CanvasWrapper>

      {/* Input Overlay Panel */}
      <InputOverlayPanel visible={panelOpen} onClose={closePanel} title="Enter Rounded Number">
        <PanelInputLabel>Rounded answer:</PanelInputLabel>

        <UnifiedMathKeypad
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          layout="inline"
          buttonSet="basic"
          showKeepOpen={true}
          keepOpen={keepOpen}
          onKeepOpenChange={setKeepOpen}
        />

        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>✓ Correct! {formatNumber(roundedAnswer)}</FeedbackText>
            ) : (
              <FeedbackText>Not quite. Try again!</FeedbackText>
            )}
          </FeedbackSection>
        )}

        <PanelButtonRow>
          <ResetButton
            onClick={() => {
              setInputValue('');
              setSubmitted(false);
            }}
          >
            Clear
          </ResetButton>
          {!submitted || !isCorrect ? (
            <SubmitButton onClick={handleSubmit} disabled={!inputValue.trim()}>
              Submit
            </SubmitButton>
          ) : (
            <NextButton onClick={handleNextProblem}>Next Problem</NextButton>
          )}
        </PanelButtonRow>
      </InputOverlayPanel>
    </Container>
  );
}

// ==================== LEVEL 6: WORD PROBLEMS ====================

function Level6WordProblems({ visualData, onCorrect, onNextProblem, modalClosedWithX }) {
  const { width: windowWidth } = useWindowDimensions();
  const { roundedAnswer, wordProblemContext } = visualData;

  const {
    panelOpen,
    inputValue,
    submitted,
    setInputValue,
    setSubmitted,
    openPanel,
    closePanel,
    resetAll,
    keepOpen,
    setKeepOpen,
  } = useInputOverlay();

  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0;
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);
    return panelWidth * 0.75;
  }, [windowWidth]);

  const inputNumeric = parseFloat(inputValue.replace(/,/g, ''));
  const isCorrect = !isNaN(inputNumeric) && inputNumeric === roundedAnswer;

  useEffect(() => {
    if (!keepOpen) {
      resetAll();
    } else {
      setInputValue('');
      setSubmitted(false);
    }
  }, [visualData.originalNumber, keepOpen, resetAll, setInputValue, setSubmitted]);

  const handleSubmit = () => {
    if (inputValue.trim() === '') return;

    setSubmitted(true);

    if (isCorrect) {
      if (keepOpen) {
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          onNextProblem?.();
        }, 1000);
      } else {
        closePanel();
        setTimeout(() => {
          onCorrect(true);
        }, 500);
      }
    }
  };

  const handleInputChange = (value) => {
    setInputValue(value);
    if (submitted) {
      setSubmitted(false);
    }
  };

  const handleNextProblem = () => {
    resetAll();
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <Container>
      <CanvasWrapper $panelOpen={panelOpen} $slideDistance={slideDistance}>
        {/* Context icon */}
        <ContextIconDisplay>{CONTEXT_ICONS[wordProblemContext] || '📝'}</ContextIconDisplay>

        {/* Enter Answer button */}
        {!panelOpen && (
          <ButtonContainer>
            {modalClosedWithX ? (
              <TryAnotherButton onClick={handleNextProblem}>Try Another Problem</TryAnotherButton>
            ) : (
              <EnterAnswerButton onClick={openPanel} disabled={submitted && isCorrect} variant="static" />
            )}
          </ButtonContainer>
        )}
      </CanvasWrapper>

      <InputOverlayPanel visible={panelOpen} onClose={closePanel} title="Enter Your Answer">
        <PanelInputLabel>Rounded answer:</PanelInputLabel>

        <UnifiedMathKeypad
          value={inputValue}
          onChange={handleInputChange}
          onSubmit={handleSubmit}
          layout="inline"
          buttonSet="basic"
          showKeepOpen={true}
          keepOpen={keepOpen}
          onKeepOpenChange={setKeepOpen}
        />

        {submitted && (
          <FeedbackSection $isCorrect={isCorrect}>
            {isCorrect ? (
              <FeedbackText>✓ Correct! {formatNumber(roundedAnswer)}</FeedbackText>
            ) : (
              <FeedbackText>Not quite. Try again!</FeedbackText>
            )}
          </FeedbackSection>
        )}

        <PanelButtonRow>
          <ResetButton
            onClick={() => {
              setInputValue('');
              setSubmitted(false);
            }}
          >
            Clear
          </ResetButton>
          {!submitted || !isCorrect ? (
            <SubmitButton onClick={handleSubmit} disabled={!inputValue.trim()}>
              Submit
            </SubmitButton>
          ) : (
            <NextButton onClick={handleNextProblem}>Next Problem</NextButton>
          )}
        </PanelButtonRow>
      </InputOverlayPanel>
    </Container>
  );
}

// ==================== EXPLANATION MODAL ====================

function ExplanationModal({ visualData, onClose, onNextProblem }) {
  const { roundedAnswer, placeDisplayName } = visualData;

  const handleNext = () => {
    onClose();
    if (onNextProblem) {
      onNextProblem();
    }
  };

  return (
    <ModalBackdrop onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Excellent Work! ✓</ModalTitle>
        <ModalText>
          <strong>Answer:</strong> {formatNumber(roundedAnswer)}
        </ModalText>
        <ModalText>
          You correctly rounded to the nearest {placeDisplayName}!
        </ModalText>
        <CloseButton onClick={handleNext}>Try Another Problem</CloseButton>
      </ModalContent>
    </ModalBackdrop>
  );
}

// ==================== MAIN COMPONENT ====================

function Rounding({ triggerNewProblem }) {
  const { lessonProps, revealAnswer, hideAnswer, questionAnswerArray, currentQuestionIndex } = useLessonState();

  const [showModal, setShowModal] = useState(false);
  const [modalClosedWithX, setModalClosedWithX] = useState(false);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const level = visualData?.level || 1;

  const info = LEVEL_INFO[level] || LEVEL_INFO[1];

  // Reset state on question change
  useEffect(() => {
    setShowModal(false);
    setModalClosedWithX(false);
    hideAnswer();
  }, [currentQuestionIndex, hideAnswer]);

  const handleCorrect = () => {
    revealAnswer();
    setShowModal(true);
  };

  const handleNextProblem = () => {
    setShowModal(false);
    setModalClosedWithX(false);
    hideAnswer();
    triggerNewProblem();
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalClosedWithX(true);
  };

  if (!currentProblem || !visualData?.level) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  const questionText = currentProblem?.question?.[0]?.text || '';

  return (
    <Wrapper>
      {/* Level header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{info.title}</LevelTitle>
      </LevelHeader>

      <InstructionText>{info.instruction}</InstructionText>

      {/* Question */}
      <QuestionText>{questionText}</QuestionText>

      {/* Render level-specific content */}
      {level === 1 && <Level1DraggableNumberLine visualData={visualData} onCorrect={handleCorrect} />}
      {level === 2 && <Level2BinaryChoice visualData={visualData} onCorrect={handleCorrect} />}
      {level === 3 && <Level3TapDigit visualData={visualData} onCorrect={handleCorrect} />}
      {level === 4 && (
        <Level4TypeAnswerFull
          visualData={visualData}
          onCorrect={handleCorrect}
          onNextProblem={handleNextProblem}
          modalClosedWithX={modalClosedWithX}
        />
      )}
      {level === 5 && (
        <Level5TypeAnswerMinimal
          visualData={visualData}
          onCorrect={handleCorrect}
          onNextProblem={handleNextProblem}
          modalClosedWithX={modalClosedWithX}
        />
      )}
      {level === 6 && (
        <Level6WordProblems
          visualData={visualData}
          onCorrect={handleCorrect}
          onNextProblem={handleNextProblem}
          modalClosedWithX={modalClosedWithX}
        />
      )}

      {/* Explanation modal */}
      {showModal && <ExplanationModal visualData={visualData} onClose={handleModalClose} onNextProblem={handleNextProblem} />}
    </Wrapper>
  );
}

export default Rounding;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const LevelHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 6px;
  width: 100%;
  justify-content: center;
`;

const LevelBadge = styled.span`
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  padding: 3px 12px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
`;

const LevelTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const InstructionText = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 0 0 20px 0;
  max-width: 700px;

  @media (min-width: 768px) {
    font-size: 16px;
  }
`;

const QuestionText = styled.p`
  font-size: 20px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  margin: 0 0 24px 0;
  line-height: 1.6;
  max-width: 650px;

  @media (min-width: 768px) {
    font-size: 22px;
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  gap: 20px;

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

const CanvasWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  transition: transform 0.3s ease-in-out;

  @media (min-width: 769px) {
    transform: translateX(${(props) => (props.$panelOpen ? `-${props.$slideDistance}px` : '0')});
  }

  @media (max-width: 768px) {
    transform: translateX(0);
  }

  @media (max-width: 1024px) {
    gap: 12px;
  }
`;

const CanvasContainer = styled.div`
  display: flex;
  justify-content: center;
  padding: 16px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 1024px) {
    padding: 12px;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  max-width: 600px;
  display: flex;
  justify-content: center;
  padding: 0 16px;

  @media (max-width: 1024px) {
    padding: 0 12px;
  }
`;

const HintText = styled.p`
  font-size: 14px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  margin: 8px 0 0 0;
  font-style: italic;
`;

// Level 2: Binary Choice Buttons
const ButtonRow = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  margin-top: 20px;

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

const ChoiceButton = styled.button`
  flex: 1;
  min-width: 140px;
  min-height: 56px;
  padding: 14px 40px;
  font-size: 18px;
  font-weight: 700;
  border-radius: 10px;
  border: 3px solid ${(props) => props.$borderColor};
  background-color: transparent;
  color: ${(props) => props.$borderColor};
  cursor: pointer;
  transition: all 0.2s;
  animation: ${(props) => (props.$shake ? shakeAnim : 'none')} 0.6s;

  &:disabled {
    opacity: 0.5;
    cursor: default;
  }

  &:hover:not(:disabled) {
    background-color: ${(props) => props.$borderColor};
    color: white;
  }

  @media (max-width: 1024px) {
    min-width: 120px;
    padding: 12px 24px;
    font-size: 17px;
  }

  @media (max-width: 768px) {
    min-height: 48px;
    font-size: 16px;
  }
`;

// Level 3: Tap Digit
const TapDigitContainer = styled.div`
  width: 100%;
  max-width: 700px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const DigitContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
  max-width: 600px;
  margin: 20px auto;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const DigitButton = styled.button`
  position: relative;
  font-size: 36px;
  font-weight: 700;
  padding: 16px 14px 36px 14px;
  min-height: 44px;
  min-width: 44px;
  border-radius: 8px;
  border: 2px solid
    ${(props) => (props.$selected ? '#00BF63' : props.$shake ? '#EF4444' : '#e5e7eb')};
  background-color: ${(props) =>
    props.$selected ? '#00BF6320' : props.$shake ? '#EF444420' : '#f3f4f6'};
  color: ${(props) => (props.$selected ? '#00BF63' : props.$shake ? '#EF4444' : '#000000')};
  cursor: ${(props) => (props.$isPeriod ? 'default' : 'pointer')};
  transition: all 0.15s ease;

  ${(props) =>
    props.$shake &&
    css`
      animation: ${shakeAnim} 0.5s ease;
    `}

  &:hover:not(:disabled):not([data-period]) {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: ${(props) => (props.$isPeriod ? 1 : 0.5)};
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    font-size: 28px;
    padding: 12px 10px 32px 10px;
    min-height: 44px;
    min-width: 40px;
  }
`;

const PlaceLabel = styled.span`
  position: absolute;
  bottom: 4px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 10px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textSecondary};
  white-space: nowrap;
  opacity: ${(props) => (props.$isPeriod ? 0 : 1)};

  @media (max-width: 768px) {
    font-size: 9px;
  }
`;

// Levels 4-6: Input Panel
const ToggleHelperButton = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 6px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    font-size: 13px;
    padding: 6px 12px;
  }
`;

const PanelInputLabel = styled.label`
  font-size: 18px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: -8px;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const FeedbackSection = styled.div`
  padding: 16px 24px;
  background-color: ${(props) =>
    props.$isCorrect
      ? props.theme.colors.buttonSuccess + '20'
      : props.theme.colors.buttonDanger + '20'};
  border-radius: 8px;
  border: 2px solid
    ${(props) => (props.$isCorrect ? props.theme.colors.buttonSuccess : props.theme.colors.buttonDanger)};

  @media (max-width: 1024px) {
    padding: 12px 20px;
  }
`;

const FeedbackText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  width: 100%;

  @media (max-width: 1024px) {
    gap: 10px;
  }
`;

const ResetButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid ${(props) => props.theme.colors.border};
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
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
  background-color: ${(props) => props.theme.colors.info || '#3b82f6'};
  color: ${(props) => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover:not(:disabled) {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

const NextButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess || '#4ade80'};
  color: ${(props) => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 10px 28px;
    font-size: 15px;
  }
`;

const TryAnotherButton = styled.button`
  width: 100%;
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || '#3B82F6'};
  color: ${(props) => props.theme.colors.textInverted || '#FFFFFF'};
  transition: all 0.2s;
  min-height: 56px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 12px 28px;
    font-size: 16px;
    min-height: 52px;
  }
`;

// Level 6: Word Problems
const ContextIconDisplay = styled.div`
  font-size: 64px;
  margin: 20px 0;

  @media (max-width: 768px) {
    font-size: 48px;
  }
`;

// Explanation Modal
const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: ${fadeIn} 0.2s ease-out;
`;

const ModalContent = styled.div`
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 32px 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: ${fadeIn} 0.3s ease-out;
`;

const ModalTitle = styled.h3`
  font-size: 24px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0 0 16px 0;
  text-align: center;
`;

const ModalText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  margin: 8px 0;
  line-height: 1.6;
  text-align: center;
`;

const CloseButton = styled.button`
  width: 100%;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.info || '#3B82F6'};
  color: ${(props) => props.theme.colors.textInverted || '#FFFFFF'};
  margin-top: 20px;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;
