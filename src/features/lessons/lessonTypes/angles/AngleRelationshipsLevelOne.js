import React, { useState } from "react";
import styled from "styled-components";
import numbers from "../../../../shared/helpers/numbers";
import { useParams } from "react-router-dom";
import { AnswerInput } from "../../../../shared/components";

const angleTypesArray = [
  "supplementary_angles",
  "same_side_interior_angles",
  "vertical_angles",
  "corresponding_angles",
  "complementary_angles",
  "alternate_interior_angles",
];

/**
 * AngleRelationShipsLevelOne - Interactive angle relationship word problems
 * Students solve for x in various angle relationship scenarios
 * Supports multiple angle relationship types with algebraic expressions
 */
function AngleRelationShipsLevelOne({ triggerNewProblem }) {
  const params = useParams();

  const generateProblem = () => {
    let angleType = params.lesson;
    if (angleType === "all_angles") {
      angleType = angleTypesArray[numbers(1, angleTypesArray.length)[0]];
    }

    let numberOne;
    if (angleType === "complementary_angles") {
      numberOne = numbers(1, 89)[0];
    } else if (angleType === "triangle_sum") {
      numberOne = [];
      numberOne[0] = numbers(1, 178)[0];
      numberOne[1] = numbers(1, 179 - numberOne[0])[0];
    } else {
      numberOne = numbers(1, 179)[0];
    }

    return {
      angleType,
      numberOne,
      constant: numbers(3, 100, 1),
      positive: numbers(3, 100),
    };
  };

  const [problem, setProblem] = useState(generateProblem);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const handlePractice = () => {
    setProblem(generateProblem());
    setShowAnswer(false);
    setShowHint(false);
  };

  const handleCorrect = () => {
    setShowAnswer(true);
  };

  // Calculate correct answer based on angle type
  const getCorrectAnswer = () => {
    const { angleType, numberOne, constant, positive } = problem;

    if (angleType !== "triangle_sum") {
      return positive[0] > 50
        ? numberOne - constant[0]
        : constant[0] + numberOne;
    } else {
      return Math.round(
        ((180 -
          (positive[0] > 50 ? constant[0] : -1 * constant[0]) -
          (positive[1] > 50 ? constant[1] : -1 * constant[1]) -
          (positive[2] > 50 ? constant[2] : -1 * constant[2])) /
          3) *
          100
      ) / 100;
    }
  };

  // Generate problem text
  const getProblemText = () => {
    const { angleType, numberOne, constant, positive } = problem;
    const friendlyName = angleType.replaceAll("_", " ");

    if (angleType !== "triangle_sum") {
      const angleB =
        angleType === "supplementary_angles" || angleType === "same_side_interior_angles"
          ? 180 - numberOne
          : angleType === "vertical_angles" ||
            angleType === "corresponding_angles" ||
            angleType === "alternate_interior_angles"
          ? numberOne
          : 90 - numberOne;

      return `Angle A and Angle B are ${friendlyName}. If Angle A = x ${
        positive[0] > 50 ? `+ ${constant[0]}` : `- ${constant[0]}`
      } and Angle B is ${angleB}, find the value of x.`;
    } else {
      return `In a triangle where Angle A = ${
        positive[0] > 50 ? `x + ${constant[0]}` : `x - ${constant[0]}`
      }, Angle B = ${
        positive[1] > 50 ? `x + ${constant[1]}` : `x - ${constant[1]}`
      }, and Angle C = ${
        positive[2] > 50 ? `x + ${constant[2]}` : `x - ${constant[2]}`
      }, find the value of x.`;
    }
  };

  // Get explanation content based on angle type
  const getExplanation = () => {
    const { angleType } = problem;

    const explanations = {
      supplementary_angles: {
        title: "Supplementary Angles",
        definition: "Two angles are supplementary if they add up to 180°.",
        formula: "Angle A + Angle B = 180°",
        example: "If Angle A = 120°, then Angle B = 60° (because 120° + 60° = 180°)",
      },
      complementary_angles: {
        title: "Complementary Angles",
        definition: "Two angles are complementary if they add up to 90°.",
        formula: "Angle A + Angle B = 90°",
        example: "If Angle A = 30°, then Angle B = 60° (because 30° + 60° = 90°)",
      },
      vertical_angles: {
        title: "Vertical Angles",
        definition: "When two lines intersect, the opposite angles are equal (vertical angles).",
        formula: "Angle A = Angle B",
        example: "Vertical angles are always congruent (equal in measure)",
      },
      corresponding_angles: {
        title: "Corresponding Angles",
        definition: "When a transversal crosses parallel lines, corresponding angles are equal.",
        formula: "Angle A = Angle B",
        example: "Corresponding angles are in the same relative position at each intersection",
      },
      alternate_interior_angles: {
        title: "Alternate Interior Angles",
        definition: "When a transversal crosses parallel lines, alternate interior angles are equal.",
        formula: "Angle A = Angle B",
        example: "These angles are on opposite sides of the transversal, between the parallel lines",
      },
      same_side_interior_angles: {
        title: "Same-Side Interior Angles",
        definition: "When a transversal crosses parallel lines, same-side interior angles are supplementary.",
        formula: "Angle A + Angle B = 180°",
        example: "These angles are on the same side of the transversal, between the parallel lines",
      },
      triangle_sum: {
        title: "Triangle Angle Sum",
        definition: "The sum of all angles in any triangle is always 180°.",
        formula: "Angle A + Angle B + Angle C = 180°",
        example: "If two angles are 60° and 70°, the third angle must be 50°",
      },
    };

    return explanations[angleType] || explanations.supplementary_angles;
  };

  const correctAnswer = getCorrectAnswer();
  const explanation = getExplanation();
  const hint = getProblemText();

  return (
    <Wrapper>
      {/* TopHintButton - Fixed position top-right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={() => setShowHint(true)}>
          Need a hint?
        </TopHintButton>
      )}

      {/* 1. QuestionSection - Problem statement */}
      <QuestionSection>
        {/* Question text now hidden - shown in hint */}
      </QuestionSection>

      {/* 2. VisualSection - Not needed for text-based problems */}

      {/* 3. InteractionSection - Answer input */}
      <InteractionSection>
        {!showAnswer && showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        <AnswerInput
          correctAnswer={correctAnswer}
          answerType="number"
          onCorrect={handleCorrect}
          onTryAnother={handlePractice}
          disabled={showAnswer}
          placeholder="x = ?"
        />
      </InteractionSection>

      {/* 4. ExplanationSection - Educational content (shown after correct answer) */}
      {showAnswer && (
        <ExplanationSection>
          <ExplanationTitle>Understanding {explanation.title}</ExplanationTitle>
          <ExplanationText>
            <strong>Definition:</strong> {explanation.definition}
          </ExplanationText>
          <FormulaBox>
            {explanation.formula}
          </FormulaBox>
          <ExplanationText>
            <strong>Example:</strong> {explanation.example}
          </ExplanationText>
          <ExplanationText>
            <strong>Steps to solve:</strong>
          </ExplanationText>
          <PropertyList>
            <li>
              <strong>Step 1:</strong> Write the equation based on the angle relationship
            </li>
            <li>
              <strong>Step 2:</strong> Substitute the given expressions for each angle
            </li>
            <li>
              <strong>Step 3:</strong> Simplify and solve for x
            </li>
            <li>
              <strong>Step 4:</strong> Check your answer by substituting back
            </li>
          </PropertyList>
          <ExplanationText>
            <strong>Your answer:</strong> x = {correctAnswer}
          </ExplanationText>
        </ExplanationSection>
      )}
    </Wrapper>
  );
}

export default AngleRelationShipsLevelOne;

// Styled Components - TangentLesson 5-section layout standard

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
  box-sizing: border-box;

  @media (min-width: 768px) {
    padding: 30px;
  }

  @media (min-width: 1024px) {
    padding: 40px;
  }
`;

const QuestionSection = styled.div`
  width: 100%;
  text-align: center;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    margin-bottom: 30px;
  }
`;

const QuestionText = styled.p`
  font-size: 18px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.8;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }
`;

const InteractionSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  margin-bottom: 20px;

  @media (min-width: 768px) {
    gap: 20px;
    margin-bottom: 30px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background-color: #f0fff4;
  border-left: 4px solid #68d391;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;

  @media (min-width: 768px) {
    padding: 25px;
    margin-top: 30px;
  }

  @media (min-width: 1024px) {
    padding: 30px;
  }
`;

const ExplanationTitle = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #2f855a;
  margin: 0 0 15px 0;

  @media (min-width: 768px) {
    font-size: 22px;
    margin-bottom: 20px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  color: #2d3748;
  line-height: 1.6;
  margin: 0 0 12px 0;

  &:last-child {
    margin-bottom: 0;
  }

  @media (min-width: 768px) {
    font-size: 17px;
    margin-bottom: 15px;
  }

  @media (min-width: 1024px) {
    font-size: 18px;
  }
`;

const FormulaBox = styled.div`
  background-color: #e6fffa;
  border: 2px solid #4299e1;
  border-radius: 8px;
  padding: 15px;
  margin: 15px 0;
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  color: #2c5282;

  @media (min-width: 768px) {
    font-size: 22px;
    padding: 18px;
  }

  @media (min-width: 1024px) {
    font-size: 24px;
    padding: 20px;
  }
`;

const PropertyList = styled.ul`
  margin: 15px 0;
  padding-left: 20px;

  li {
    font-size: 16px;
    color: #2d3748;
    line-height: 1.8;
    margin-bottom: 8px;

    @media (min-width: 768px) {
      font-size: 17px;
      margin-bottom: 10px;
    }

    @media (min-width: 1024px) {
      font-size: 18px;
    }
  }
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  margin-bottom: 0;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

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

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
    border-color: ${props => props.theme.colors.borderDark};
  }
`;

const HintBox = styled.div`
  background: #fff5e6;
  border-left: 4px solid #f6ad55;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  font-size: 15px;
  color: #744210;

  @media (max-width: 1024px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 14px;
  }
`;
