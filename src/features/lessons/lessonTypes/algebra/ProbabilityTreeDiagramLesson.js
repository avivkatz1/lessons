import React, { useState, useMemo, useCallback } from "react";
import styled, { keyframes, css } from "styled-components";
import { Stage, Layer, Rect, Text, Line, Circle } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";
import { AnswerInput } from "../../../../shared/components";

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: "Read the Tree" },
  2: { title: "Fill in Missing Branch" },
  3: { title: "Find P(A and B)" },
  4: { title: "Multiple Paths" },
  5: { title: "Word Problem" },
};

// ==================== ANIMATIONS ====================

const shakeAnim = keyframes`
  0%, 100% { transform: translateX(0); }
  20% { transform: translateX(-8px); }
  40% { transform: translateX(8px); }
  60% { transform: translateX(-6px); }
  80% { transform: translateX(6px); }
`;

const fadeInAnim = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== HELPERS ====================

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
}

function fractionStr(num, den) {
  const g = gcd(num, den);
  const sn = num / g;
  const sd = den / g;
  if (sd === 1) return String(sn);
  return `${sn}/${sd}`;
}

// ==================== TREE DIAGRAM ====================

function TreeDiagram({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const {
    tree,
    events,
    highlightedPath,
    highlightedPaths,
    showLeafProbs,
  } = visualData;

  if (!tree || !tree.nodes) return null;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const strokeColor = konvaTheme.shapeStroke || "#3B82F6";
  const textColor = konvaTheme.labelText || "#333333";
  const highlightColor = konvaTheme.shapeHighlight || "#00BF63";
  const accentColor = konvaTheme.shapeDilated || "#8B5CF6";

  // Convert relative positions to absolute
  const padX = 30;
  const padY = 25;
  const usableW = canvasWidth - padX * 2;
  const usableH = canvasHeight - padY * 2;

  const absNodes = tree.nodes.map((n) => ({
    ...n,
    x: padX + n.relX * usableW,
    y: padY + n.relY * usableH,
  }));

  const nodeById = {};
  absNodes.forEach((n) => { nodeById[n.id] = n; });

  // Determine which branches are highlighted
  const highlightedBranchSet = new Set();
  const pathIndices = highlightedPaths || (highlightedPath != null ? [highlightedPath] : []);
  pathIndices.forEach((pi) => {
    const path = tree.paths[pi];
    if (path) {
      for (let i = 0; i < path.nodeIds.length - 1; i++) {
        highlightedBranchSet.add(`${path.nodeIds[i]}-${path.nodeIds[i + 1]}`);
      }
    }
  });

  const fontSize = Math.max(10, Math.min(13, canvasWidth / 42));
  const nodeRadius = Math.max(4, Math.min(6, canvasWidth / 90));
  const labelFontSize = Math.max(9, fontSize - 1);

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        {/* Background */}
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Event labels at top */}
        <Text
          x={padX + usableW * 0.15}
          y={6}
          text={events.a.label}
          fontSize={fontSize}
          fontStyle="bold"
          fill={accentColor}
          listening={false}
        />
        <Text
          x={padX + usableW * 0.52}
          y={6}
          text={events.b.label}
          fontSize={fontSize}
          fontStyle="bold"
          fill={strokeColor}
          listening={false}
        />

        {/* Branches (Lines) */}
        {tree.branches.map((branch, i) => {
          const fromNode = nodeById[branch.from];
          const toNode = nodeById[branch.to];
          if (!fromNode || !toNode) return null;
          const isHighlighted = highlightedBranchSet.has(`${branch.from}-${branch.to}`);

          // Label position: midpoint, offset above the line
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          // Offset label above or below based on whether branch goes up or down
          const goesUp = toNode.y < fromNode.y;
          const labelOffsetY = goesUp ? -fontSize - 4 : 4;

          return (
            <React.Fragment key={`branch-${i}`}>
              <Line
                points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                stroke={isHighlighted ? highlightColor : strokeColor}
                strokeWidth={isHighlighted ? 3 : 1.5}
                opacity={isHighlighted ? 1 : 0.6}
                listening={false}
              />
              {/* Branch probability label */}
              <Text
                x={midX - 25}
                y={midY + labelOffsetY}
                width={50}
                align="center"
                text={branch.missing ? "?" : branch.label}
                fontSize={fontSize}
                fontStyle={branch.missing || isHighlighted ? "bold" : "normal"}
                fill={branch.missing ? highlightColor : isHighlighted ? highlightColor : textColor}
                listening={false}
              />
            </React.Fragment>
          );
        })}

        {/* Nodes (Circles) */}
        {absNodes.map((node) => (
          <Circle
            key={`node-${node.id}`}
            x={node.x}
            y={node.y}
            radius={nodeRadius}
            fill={node.isRoot ? accentColor : strokeColor}
            listening={false}
          />
        ))}

        {/* Node labels */}
        {absNodes.map((node) => {
          if (node.isRoot) {
            return (
              <Text
                key={`lbl-${node.id}`}
                x={node.x - 30}
                y={node.y - nodeRadius - fontSize - 4}
                width={60}
                align="center"
                text={node.label}
                fontSize={fontSize}
                fontStyle="bold"
                fill={accentColor}
                listening={false}
              />
            );
          }
          if (node.isLeaf) {
            // Leaf: show outcome label to the right of node
            // Split "A & B" into two lines for readability
            const parts = node.label.split(" & ");
            return (
              <Text
                key={`lbl-${node.id}`}
                x={node.x + nodeRadius + 6}
                y={node.y - labelFontSize + 1}
                text={parts.join(" &\n")}
                fontSize={labelFontSize}
                fill={textColor}
                lineHeight={1.3}
                listening={false}
              />
            );
          }
          // Intermediate node: label below
          return (
            <Text
              key={`lbl-${node.id}`}
              x={node.x - 30}
              y={node.y + nodeRadius + 3}
              width={60}
              align="center"
              text={node.label}
              fontSize={fontSize}
              fontStyle="bold"
              fill={accentColor}
              listening={false}
            />
          );
        })}

        {/* Leaf probability labels (when showLeafProbs is true) */}
        {showLeafProbs && tree.paths.map((path, pi) => {
          const leafNode = nodeById[path.nodeIds[path.nodeIds.length - 1]];
          if (!leafNode) return null;
          const isHighlighted = pathIndices.includes(pi);
          return (
            <Text
              key={`prob-${pi}`}
              x={leafNode.x + nodeRadius + 6}
              y={leafNode.y + labelFontSize + 4}
              text={`= ${fractionStr(path.probability.num, path.probability.den)}`}
              fontSize={labelFontSize}
              fill={isHighlighted ? highlightColor : textColor}
              fontStyle={isHighlighted ? "bold" : "normal"}
              listening={false}
            />
          );
        })}
      </Layer>
    </Stage>
  );
}

// ==================== MAIN COMPONENT ====================

function ProbabilityTreeDiagramLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const { width: windowWidth } = useWindowDimensions();
  const konvaTheme = useKonvaTheme();
  const [showHint, setShowHint] = useState(false);

  // Phase state for MC levels (L1, L2)
  const [phase, setPhase] = useState("interact");
  const [selectedChoice, setSelectedChoice] = useState(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [shakingIdx, setShakingIdx] = useState(null);

  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const {
    level = 1,
    choices = [],
    educationalNote = "",
  } = visualData;

  const hint = currentProblem?.hint || "";
  const explanation = currentProblem?.explanation || "";
  const questionText = currentProblem?.question?.[0]?.text || "";

  const correctAnswer = useMemo(() => {
    if (currentProblem?.acceptedAnswers?.length > 0) return currentProblem.acceptedAnswers;
    if (Array.isArray(currentProblem?.answer)) return currentProblem.answer;
    return [String(currentProblem?.answer || "")];
  }, [currentProblem?.answer, currentProblem?.acceptedAnswers]);

  const levelInfo = LEVEL_INFO[level] || LEVEL_INFO[1];
  const isMCLevel = level <= 2;

  // Canvas sizing
  const canvasWidth = Math.min(windowWidth - 40, 550);
  const canvasHeight = canvasWidth * 0.7;

  // Reset on problem change
  const problemKey = `${level}-${currentQuestionIndex}-${JSON.stringify(visualData.events?.a?.probs?.[0] || {})}`;
  const [lastProblemKey, setLastProblemKey] = useState(null);
  if (problemKey !== lastProblemKey) {
    setLastProblemKey(problemKey);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    setShowHint(false);
  }

  const handleTryAnother = useCallback(() => {
    setShowHint(false);
    setPhase("interact");
    setSelectedChoice(null);
    setWrongAttempts(0);
    setShakingIdx(null);
    hideAnswer();
    triggerNewProblem();
  }, [hideAnswer, triggerNewProblem]);

  // MC choice handler (L1, L2)
  const handleChoiceClick = useCallback((choice, idx) => {
    if (phase !== "interact" || shakingIdx !== null) return;

    if (choice.correct) {
      setSelectedChoice(idx);
      setTimeout(() => {
        setPhase("complete");
        revealAnswer();
      }, 800);
    } else {
      setShakingIdx(idx);
      setWrongAttempts((prev) => prev + 1);
      setTimeout(() => setShakingIdx(null), 600);
    }
  }, [phase, shakingIdx, revealAnswer]);

  if (!currentProblem?.visualData) {
    return <Wrapper><LoadingText>Loading...</LoadingText></Wrapper>;
  }

  return (
    <Wrapper>
      {/* Hint Button */}
      {!showAnswer && phase !== "complete" && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* Level Header */}
      <LevelHeader>
        <LevelBadge>Level {level}</LevelBadge>
        <LevelTitle>{levelInfo.title}</LevelTitle>
      </LevelHeader>

      {/* Question */}
      <QuestionSection>
        <QuestionText>{questionText}</QuestionText>
      </QuestionSection>

      {/* Konva Tree Diagram */}
      <VisualSection>
        <TreeDiagram
          visualData={visualData}
          konvaTheme={konvaTheme}
          canvasWidth={canvasWidth}
          canvasHeight={canvasHeight}
        />
      </VisualSection>

      {/* Hint */}
      {showHint && hint && <HintBox>{hint}</HintBox>}

      {/* ===== MC Levels (L1, L2) ===== */}
      {isMCLevel && phase === "interact" && choices.length > 0 && (
        <ChooseSection>
          {wrongAttempts > 0 && shakingIdx === null && (
            <FeedbackText $isWrong>Not quite — try again!</FeedbackText>
          )}
          <ChoiceGrid>
            {choices.map((choice, idx) => {
              const isSelected = selectedChoice === idx;
              const isCorrectSelected = isSelected && choice.correct;
              const isShaking = shakingIdx === idx;
              const isFaded = selectedChoice !== null && !isSelected;
              return (
                <ChoiceButton
                  key={idx}
                  $correct={isCorrectSelected}
                  $wrong={isShaking}
                  $fadeOut={isFaded}
                  onClick={() => handleChoiceClick(choice, idx)}
                  disabled={selectedChoice !== null || isShaking}
                >
                  {choice.text}
                  {isCorrectSelected && " \u2713"}
                </ChoiceButton>
              );
            })}
          </ChoiceGrid>
        </ChooseSection>
      )}

      {/* ===== Input Levels (L3, L4, L5) ===== */}
      {!isMCLevel && !showAnswer && (
        <InteractionSection>
          <AnswerInput
            correctAnswer={correctAnswer}
            answerType="array"
            onCorrect={revealAnswer}
            onTryAnother={handleTryAnother}
            disabled={showAnswer}
            placeholder="Enter fraction (e.g. 1/6)"
          />
        </InteractionSection>
      )}

      {/* ===== MC Complete Phase ===== */}
      {isMCLevel && phase === "complete" && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another
          </TryAnotherButton>
        </ExplanationSection>
      )}

      {/* ===== Input Answer Revealed ===== */}
      {!isMCLevel && showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Correct!</ExplanationTitle>
          <EducationalNote>{educationalNote}</EducationalNote>
          {explanation && <ExplanationDetail>{explanation}</ExplanationDetail>}
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default ProbabilityTreeDiagramLesson;

// ==================== STYLED COMPONENTS ====================

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 900px;
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

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 12px;
`;

const QuestionText = styled.p`
  font-size: 17px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;

  @media (min-width: 768px) {
    font-size: 20px;
  }
`;

const VisualSection = styled.div`
  width: 100%;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ChooseSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  animation: ${fadeInAnim} 0.3s ease;
`;

const ChoiceGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  max-width: 420px;
  margin-top: 4px;
`;

const ChoiceButton = styled.button`
  width: 100%;
  padding: 13px 20px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 10px;
  border: 2px solid ${(props) => props.theme.colors.border};
  background-color: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  cursor: pointer;
  transition: all 0.25s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;

  &:hover:not(:disabled) {
    background-color: ${(props) => props.theme.colors.hoverBackground};
    border-color: ${(props) => props.theme.colors.info || "#3B82F6"};
  }

  ${(props) =>
    props.$correct &&
    css`
      background-color: ${props.theme.colors.buttonSuccess}20;
      border-color: ${props.theme.colors.buttonSuccess};
      color: ${props.theme.colors.buttonSuccess};
      cursor: default;
    `}

  ${(props) =>
    props.$wrong &&
    css`
      animation: ${shakeAnim} 0.5s ease;
      background-color: ${props.theme.colors.danger || "#E53E3E"}15;
      border-color: ${props.theme.colors.danger || "#E53E3E"};
    `}

  ${(props) =>
    props.$fadeOut &&
    css`
      opacity: 0;
      transform: scale(0.95);
      pointer-events: none;
      transition: all 0.4s ease;
    `}

  &:disabled {
    cursor: default;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
`;

const FeedbackText = styled.p`
  font-size: 14px;
  font-weight: 600;
  color: ${(props) =>
    props.$isWrong
      ? props.theme.colors.danger || "#E53E3E"
      : props.theme.colors.buttonSuccess};
  margin: 0;
`;

const ExplanationSection = styled.div`
  width: 100%;
  max-width: 600px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  animation: ${fadeInAnim} 0.4s ease;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;
`;

const EducationalNote = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textPrimary};
  text-align: center;
  line-height: 1.6;
  margin: 0;
  max-width: 500px;
`;

const ExplanationDetail = styled.p`
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  text-align: center;
  line-height: 1.5;
  margin: 0;
  max-width: 500px;
`;

const TryAnotherButton = styled.button`
  padding: 12px 28px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  touch-action: manipulation;

  &:hover {
    opacity: 0.9;
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${(props) => props.theme.colors.cardBackground};
  border: 2px solid ${(props) => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;
  touch-action: manipulation;

  &:hover {
    background: ${(props) => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }

  @media (max-width: 768px) {
    top: 10px;
    right: 12px;
    padding: 5px 10px;
    font-size: 12px;
  }
`;

const HintBox = styled.div`
  width: 100%;
  max-width: 500px;
  background-color: ${(props) => props.theme.colors.cardBackground};
  border-left: 4px solid ${(props) => props.theme.colors.warning || "#f6ad55"};
  padding: 14px 16px;
  border-radius: 4px;
  font-size: 15px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};
  margin-bottom: 12px;
`;
