import React, { useState, useMemo } from "react";
import styled, { keyframes } from "styled-components";
import { Stage, Layer, Rect, Text, Line, Arc, Circle } from "react-konva";
import { useLessonState, useWindowDimensions, useKonvaTheme } from "../../../../hooks";

// ==================== ANIMATIONS ====================

const fadeInAnim = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

// ==================== VISUAL COMPONENTS ====================

function LadderVisualization({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const { ladderLength, wallHeight, groundDist, angle, showAngle } = visualData;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";
  const ladderColor = "#8B5CF6"; // purple
  const wallColor = "#9CA3AF";  // gray
  const groundColor = "#9CA3AF";

  const padding = 60;
  const scale = Math.min((canvasWidth - padding * 2) / (groundDist || ladderLength),
                         (canvasHeight - padding * 2) / (wallHeight || ladderLength),
                         20);

  // Calculate actual dimensions
  const actualGroundDist = groundDist || Math.sqrt(ladderLength * ladderLength - wallHeight * wallHeight);
  const actualWallHeight = wallHeight || Math.sqrt(ladderLength * ladderLength - groundDist * groundDist);

  // Wall (vertical line on left)
  const wallX = padding;
  const wallBottom = canvasHeight - padding;
  const wallTop = wallBottom - actualWallHeight * scale;

  // Ground (horizontal line at bottom)
  const groundY = wallBottom;
  const groundLeft = wallX;
  const groundRight = wallX + actualGroundDist * scale;

  // Ladder (hypotenuse)
  const ladderX1 = groundRight;
  const ladderY1 = groundY;
  const ladderX2 = wallX;
  const ladderY2 = wallTop;

  const fontSize = Math.max(12, Math.min(14, canvasWidth / 35));

  return (
    <Stage width={canvasWidth} height={canvasHeight}>
      <Layer>
        <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

        {/* Ground */}
        <Line
          points={[groundLeft, groundY, groundRight + 20, groundY]}
          stroke={groundColor}
          strokeWidth={3}
          listening={false}
        />

        {/* Wall */}
        <Line
          points={[wallX, wallBottom, wallX, wallTop - 20]}
          stroke={wallColor}
          strokeWidth={3}
          listening={false}
        />

        {/* Ladder */}
        <Line
          points={[ladderX1, ladderY1, ladderX2, ladderY2]}
          stroke={ladderColor}
          strokeWidth={4}
          listening={false}
        />

        {/* Right angle indicator */}
        <Line
          points={[wallX, wallTop, wallX + 12, wallTop, wallX + 12, wallTop + 12, wallX, wallTop + 12]}
          stroke={textColor}
          strokeWidth={1.5}
          listening={false}
          closed
        />

        {/* Angle arc at ground */}
        {showAngle && angle && (() => {
          // Dynamic angle arc - works for any ladder orientation
          const vertex = { x: ladderX1, y: ladderY1 };
          const point1 = { x: groundRight + 20, y: groundY }; // Along ground
          const point2 = { x: ladderX2, y: ladderY2 }; // Up the ladder

          const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
          const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
          const sweep = ((theta2 - theta1) % 360 + 360) % 360;
          const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
          const arcRotation = sweep <= 180 ? theta1 : theta2;

          return (
            <Arc
              x={vertex.x}
              y={vertex.y}
              innerRadius={0}
              outerRadius={30}
              angle={arcAngle}
              rotation={arcRotation}
              fill={`${ladderColor}20`}
              stroke={ladderColor}
              strokeWidth={1.5}
              listening={false}
            />
          );
        })()}

        {/* Labels */}
        <Text
          x={wallX - 50}
          y={(wallTop + wallBottom) / 2 - fontSize / 2}
          text={wallHeight ? `${wallHeight} ft` : "?"}
          fontSize={fontSize}
          fontStyle="bold"
          fill={textColor}
          listening={false}
        />

        <Text
          x={(wallX + groundRight) / 2 - 20}
          y={groundY + 20}
          text={groundDist ? `${groundDist} ft` : "?"}
          fontSize={fontSize}
          fontStyle="bold"
          fill={textColor}
          listening={false}
        />

        <Text
          x={(ladderX1 + ladderX2) / 2 + 10}
          y={(ladderY1 + ladderY2) / 2 - 10}
          text={`${ladderLength} ft`}
          fontSize={fontSize}
          fontStyle="bold"
          fill={ladderColor}
          listening={false}
        />

        {showAngle && angle && (
          <Text
            x={ladderX1 - 55}
            y={ladderY1 - 25}
            text={`${angle}°`}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={ladderColor}
            listening={false}
          />
        )}
      </Layer>
    </Stage>
  );
}

function ElevationVisualization({ visualData, konvaTheme, canvasWidth, canvasHeight }) {
  const { scenario, distance, angle, eyeLevel, objectHeight, totalHeight, height, objectType } = visualData;

  const bgColor = konvaTheme.canvasBackground || "#ffffff";
  const textColor = konvaTheme.labelText || "#333333";
  const objectColor = "#3B82F6"; // blue
  const personColor = "#10B981"; // green
  const sightLineColor = "#F59E0B"; // orange

  const padding = 60;

  if (scenario === "depression") {
    // Cliff with boat below
    const cliffHeight = visualData.height;
    const horizDist = visualData.distance;
    const scale = Math.min((canvasWidth - padding * 2) / horizDist,
                           (canvasHeight - padding * 2) / cliffHeight,
                           15);

    const cliffX = padding;
    const groundY = canvasHeight - padding;
    const cliffTop = groundY - cliffHeight * scale;
    const boatX = cliffX + horizDist * scale;

    const fontSize = Math.max(12, Math.min(14, canvasWidth / 35));

    return (
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

          {/* Ground/water */}
          <Line
            points={[0, groundY, canvasWidth, groundY]}
            stroke="#9CA3AF"
            strokeWidth={2}
            listening={false}
          />

          {/* Cliff */}
          <Line
            points={[cliffX, groundY, cliffX, cliffTop]}
            stroke={objectColor}
            strokeWidth={4}
            listening={false}
          />

          {/* Sight line */}
          <Line
            points={[cliffX, cliffTop, boatX, groundY]}
            stroke={sightLineColor}
            strokeWidth={2}
            strokeDash={[5, 5]}
            listening={false}
          />

          {/* Boat */}
          <Circle
            x={boatX}
            y={groundY}
            radius={8}
            fill={personColor}
            listening={false}
          />

          {/* Angle arc */}
          {(() => {
            // Dynamic angle arc - angle of depression from horizontal
            const vertex = { x: cliffX, y: cliffTop };
            const point1 = { x: cliffX + 100, y: cliffTop }; // Horizontal to the right
            const point2 = { x: boatX, y: groundY }; // Sight line to boat

            const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
            const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
            const sweep = ((theta2 - theta1) % 360 + 360) % 360;
            const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
            const arcRotation = sweep <= 180 ? theta1 : theta2;

            return (
              <Arc
                x={vertex.x}
                y={vertex.y}
                innerRadius={0}
                outerRadius={40}
                angle={arcAngle}
                rotation={arcRotation}
                fill={`${sightLineColor}20`}
                stroke={sightLineColor}
                strokeWidth={1.5}
                listening={false}
              />
            );
          })()}

          {/* Labels */}
          <Text
            x={cliffX - 50}
            y={(cliffTop + groundY) / 2}
            text={`${cliffHeight} ft`}
            fontSize={fontSize}
            fontStyle="bold"
            fill={objectColor}
            listening={false}
          />

          <Text
            x={(cliffX + boatX) / 2 - 20}
            y={groundY + 20}
            text={`${horizDist} ft`}
            fontSize={fontSize}
            fontStyle="bold"
            fill={textColor}
            listening={false}
          />

          <Text
            x={cliffX + 45}
            y={cliffTop + 10}
            text={`${angle}°`}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={sightLineColor}
            listening={false}
          />
        </Layer>
      </Stage>
    );
  } else if (scenario === "elevation_kite") {
    // Person with kite
    const stringLen = visualData.stringLength;
    const kiteHeight = visualData.height;
    const horizDist = visualData.distance;
    const scale = Math.min((canvasWidth - padding * 2) / horizDist,
                           (canvasHeight - padding * 2) / kiteHeight,
                           18);

    const personX = padding;
    const personY = canvasHeight - padding;
    const kiteX = personX + horizDist * scale;
    const kiteY = personY - kiteHeight * scale;

    const fontSize = Math.max(12, Math.min(14, canvasWidth / 35));

    return (
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

          {/* Ground */}
          <Line
            points={[0, personY, canvasWidth, personY]}
            stroke="#9CA3AF"
            strokeWidth={2}
            listening={false}
          />

          {/* Person */}
          <Circle
            x={personX}
            y={personY - 10}
            radius={8}
            fill={personColor}
            listening={false}
          />

          {/* String */}
          <Line
            points={[personX, personY - 10, kiteX, kiteY]}
            stroke={sightLineColor}
            strokeWidth={2}
            listening={false}
          />

          {/* Kite */}
          <Line
            points={[kiteX, kiteY - 10, kiteX + 8, kiteY, kiteX, kiteY + 10, kiteX - 8, kiteY]}
            stroke={objectColor}
            strokeWidth={2}
            fill={`${objectColor}40`}
            closed
            listening={false}
          />

          {/* Angle arc */}
          {(() => {
            // Dynamic angle arc - angle of elevation from horizontal
            const vertex = { x: personX, y: personY - 10 };
            const point1 = { x: personX + 100, y: personY - 10 }; // Horizontal to the right
            const point2 = { x: kiteX, y: kiteY }; // String to kite

            const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
            const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
            const sweep = ((theta2 - theta1) % 360 + 360) % 360;
            const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
            const arcRotation = sweep <= 180 ? theta1 : theta2;

            return (
              <Arc
                x={vertex.x}
                y={vertex.y}
                innerRadius={0}
                outerRadius={35}
                angle={arcAngle}
                rotation={arcRotation}
                fill={`${sightLineColor}20`}
                stroke={sightLineColor}
                strokeWidth={1.5}
                listening={false}
              />
            );
          })()}

          {/* Labels */}
          <Text
            x={(personX + kiteX) / 2 + 10}
            y={(personY + kiteY) / 2 - 10}
            text={`${stringLen} ft`}
            fontSize={fontSize}
            fontStyle="bold"
            fill={sightLineColor}
            listening={false}
          />

          <Text
            x={personX + 40}
            y={personY - 35}
            text={`${angle}°`}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={sightLineColor}
            listening={false}
          />
        </Layer>
      </Stage>
    );
  } else {
    // Building elevation
    const scale = Math.min((canvasWidth - padding * 2) / distance,
                           (canvasHeight - padding * 2) / (totalHeight || objectHeight || 50),
                           15);

    const personX = padding;
    const groundY = canvasHeight - padding;
    const personEyeY = groundY - (eyeLevel || 5) * scale;
    const buildingX = personX + distance * scale;
    const buildingTop = groundY - (totalHeight || objectHeight) * scale;

    const fontSize = Math.max(12, Math.min(14, canvasWidth / 35));

    return (
      <Stage width={canvasWidth} height={canvasHeight}>
        <Layer>
          <Rect x={0} y={0} width={canvasWidth} height={canvasHeight} fill={bgColor} />

          {/* Ground */}
          <Line
            points={[0, groundY, canvasWidth, groundY]}
            stroke="#9CA3AF"
            strokeWidth={2}
            listening={false}
          />

          {/* Building */}
          <Rect
            x={buildingX - 15}
            y={buildingTop}
            width={30}
            height={(totalHeight || objectHeight) * scale}
            fill={`${objectColor}40`}
            stroke={objectColor}
            strokeWidth={2}
            listening={false}
          />

          {/* Person */}
          <Circle
            x={personX}
            y={personEyeY}
            radius={8}
            fill={personColor}
            listening={false}
          />

          {/* Sight line */}
          <Line
            points={[personX, personEyeY, buildingX, buildingTop]}
            stroke={sightLineColor}
            strokeWidth={2}
            strokeDash={[5, 5]}
            listening={false}
          />

          {/* Horizontal reference line */}
          <Line
            points={[personX, personEyeY, buildingX, personEyeY]}
            stroke="#9CA3AF"
            strokeWidth={1}
            strokeDash={[3, 3]}
            listening={false}
          />

          {/* Angle arc */}
          {(() => {
            // Dynamic angle arc - angle of elevation from horizontal
            const vertex = { x: personX, y: personEyeY };
            const point1 = { x: personX + 100, y: personEyeY }; // Horizontal to the right
            const point2 = { x: buildingX, y: buildingTop }; // Sight line to building top

            const theta1 = Math.atan2(point1.y - vertex.y, point1.x - vertex.x) * (180 / Math.PI);
            const theta2 = Math.atan2(point2.y - vertex.y, point2.x - vertex.x) * (180 / Math.PI);
            const sweep = ((theta2 - theta1) % 360 + 360) % 360;
            const arcAngle = sweep <= 180 ? sweep : 360 - sweep;
            const arcRotation = sweep <= 180 ? theta1 : theta2;

            return (
              <Arc
                x={vertex.x}
                y={vertex.y}
                innerRadius={0}
                outerRadius={40}
                angle={arcAngle}
                rotation={arcRotation}
                fill={`${sightLineColor}20`}
                stroke={sightLineColor}
                strokeWidth={1.5}
                listening={false}
              />
            );
          })()}

          {/* Labels */}
          <Text
            x={buildingX + 20}
            y={(buildingTop + groundY) / 2}
            text={totalHeight ? `${totalHeight} ft` : "?"}
            fontSize={fontSize}
            fontStyle="bold"
            fill={objectColor}
            listening={false}
          />

          <Text
            x={(personX + buildingX) / 2 - 20}
            y={groundY + 20}
            text={`${distance} ft`}
            fontSize={fontSize}
            fontStyle="bold"
            fill={textColor}
            listening={false}
          />

          <Text
            x={personX + 45}
            y={personEyeY - 20}
            text={`${angle}°`}
            fontSize={fontSize + 1}
            fontStyle="bold"
            fill={sightLineColor}
            listening={false}
          />

          {eyeLevel && (
            <Text
              x={personX - 45}
              y={personEyeY}
              text={`${eyeLevel} ft`}
              fontSize={fontSize - 1}
              fill={personColor}
              listening={false}
            />
          )}
        </Layer>
      </Stage>
    );
  }
}

// ==================== MAIN COMPONENT ====================

function TrigWordProblemsLesson({ triggerNewProblem }) {
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  const [selectedChoice, setSelectedChoice] = useState(null);
  const konvaTheme = useKonvaTheme();
  const { width } = useWindowDimensions();

  // Get current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const visualData = currentProblem?.visualData || {};
  const { level = 1 } = visualData;

  const questionText = currentProblem?.question?.[0]?.text || '';
  const answerText = currentProblem?.answer?.[0] || '';
  const explanation = currentProblem?.explanation || '';
  const hint = currentProblem?.hint || '';

  const choices = visualData.choices || [];

  // Canvas dimensions
  const canvasWidth = useMemo(() => Math.min(width - 100, 500), [width]);
  const canvasHeight = useMemo(() => Math.min(canvasWidth * 0.8, 400), [canvasWidth]);

  // Event handlers
  const handleTryAnother = () => {
    setSelectedChoice(null);
    triggerNewProblem();
    hideAnswer();
  };

  const handleChoiceClick = (choiceText) => {
    if (showAnswer) return;

    setSelectedChoice(choiceText);
    const isCorrect = choiceText === answerText;

    if (isCorrect) {
      setTimeout(() => {
        revealAnswer();
        // Auto-advance after 1.5 seconds
        setTimeout(() => {
          handleTryAnother();
        }, 1500);
      }, 300);
    } else {
      setTimeout(() => {
        revealAnswer();
      }, 300);
    }
  };

  // Fallback if no data
  if (!currentProblem?.visualData) {
    return (
      <Container>
        <Title>Trigonometry: Word Problems</Title>
        <Question>Loading lesson data...</Question>
      </Container>
    );
  }

  // Determine if this level has visuals
  const hasVisuals = level === 1 || level === 2;

  return (
    <Container>
      <Title>Trig Word Problems - Level {level}</Title>

      <QuestionSection>
        <Question>{questionText}</Question>
      </QuestionSection>

      {hasVisuals && (
        <VisualizationContainer>
          {level === 1 && visualData.scenario && visualData.scenario.includes("ladder") && (
            <LadderVisualization
              visualData={visualData}
              konvaTheme={konvaTheme}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          )}
          {level === 2 && (
            <ElevationVisualization
              visualData={visualData}
              konvaTheme={konvaTheme}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          )}
        </VisualizationContainer>
      )}

      <ChoicesGrid>
        {choices.map((choice, idx) => {
          const choiceText = choice.text || choice;
          const isSelected = selectedChoice === choiceText;
          const isCorrect = choiceText === answerText;

          return (
            <ChoiceButton
              key={idx}
              onClick={() => handleChoiceClick(choiceText)}
              $isSelected={isSelected}
              $showAnswer={showAnswer}
              $isCorrect={isCorrect}
              disabled={showAnswer}
            >
              {choiceText}
            </ChoiceButton>
          );
        })}
      </ChoicesGrid>

      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>
            {selectedChoice === answerText ? '✓ Correct!' : '✗ Incorrect'}
          </ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          {selectedChoice !== answerText && (
            <TryAgainButton onClick={handleTryAnother}>
              Try Another Problem
            </TryAgainButton>
          )}
        </ExplanationSection>
      )}

      {!showAnswer && hint && (
        <HintSection>
          <HintTitle>💡 Hint:</HintTitle>
          <HintText>{hint}</HintText>
        </HintSection>
      )}
    </Container>
  );
}

export default TrigWordProblemsLesson;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 24px;
  color: ${props => props.theme.colors.textPrimary};
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 24px;
  text-align: center;
  color: ${props => props.theme.colors.textPrimary};
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  border-left: 4px solid ${props => props.theme.colors.primary || '#3B82F6'};
`;

const Question = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
`;

const VisualizationContainer = styled.div`
  margin: 32px auto;
  display: flex;
  justify-content: center;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 12px;
  padding: 16px;
  animation: ${fadeInAnim} 0.4s ease-out;
`;

const ChoicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin: 32px 0;
`;

const ChoiceButton = styled.button`
  padding: 20px;
  border: 2px solid ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.buttonSuccess || '#4ade80'
        : props.theme.colors.buttonError || '#ef4444';
    }
    if (props.$isSelected) {
      return props.theme.colors.borderDark || props.theme.colors.border;
    }
    return props.theme.colors.border;
  }};
  background: ${props => {
    if (props.$isSelected && props.$showAnswer) {
      return props.$isCorrect
        ? props.theme.colors.successBackground || '#4ade8020'
        : props.theme.colors.errorBackground || '#ef444420';
    }
    if (props.$isSelected) {
      return props.theme.colors.hoverBackground;
    }
    return props.theme.colors.cardBackground;
  }};
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: ${props => props.theme.colors.textPrimary};
  transition: all 0.2s;
  text-align: center;

  &:hover:not(:disabled) {
    border-color: ${props => props.theme.colors.borderDark || props.theme.colors.border};
    background: ${props => props.theme.colors.hoverBackground};
    transform: translateY(-2px);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
`;

const ExplanationSection = styled.div`
  margin-top: 32px;
  padding: 24px;
  background: ${props => props.theme.colors.cardBackground};
  border-left: 4px solid ${props => props.theme.colors.buttonSuccess || '#4ade80'};
  border-radius: 8px;
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 12px;
  color: ${props => props.theme.colors.textPrimary};
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 16px;
`;

const TryAgainButton = styled.button`
  padding: 12px 24px;
  background: ${props => props.theme.colors.primary || '#3B82F6'};
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
`;

const HintSection = styled.div`
  margin-top: 24px;
  padding: 16px;
  background: ${props => props.theme.colors.inputBackground || '#f1efef'};
  border-left: 4px solid ${props => props.theme.colors.borderDark || '#cbd5e0'};
  border-radius: 8px;
`;

const HintTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 8px;
  color: ${props => props.theme.colors.textPrimary};
`;

const HintText = styled.p`
  font-size: 14px;
  line-height: 1.5;
  color: ${props => props.theme.colors.textSecondary};
`;
