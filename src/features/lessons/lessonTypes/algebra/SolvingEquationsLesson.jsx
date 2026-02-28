/**
 * Solving Equations - Lesson Component
 *
 * Five-level progression teaching algebraic equation solving:
 * L1 — One-step equations: Interactive operation selection (x+a=b, ax=b, etc.)
 * L2 — Two-step equations: Sequential button stages (ax+b=c)
 * L3 — Multi-step equations: Distribution and combining like terms
 * L4 — Variables on both sides: ax+b=cx+d
 * L5 — Word problems: Real-world application
 */

import React, { useState, useMemo, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useDispatch, useSelector } from 'react-redux';
import { InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { useLessonState, useWindowDimensions } from '../../../../hooks';
import { setUserAnswer, setAnswerFeedback, recordAnswer } from '../../../../store/lessonSlice';
import { DrawingCanvas } from '../../../../shared/components';
import InputOverlayPanel from '../../../../shared/components/InputOverlayPanel';
import SlimMathKeypad from '../../../../shared/components/SlimMathKeypad';
import EnterAnswerButton from '../../../../shared/components/EnterAnswerButton';
import { useInputOverlay } from '../geometry/hooks/useInputOverlay';
import { validateAnswer } from '../../../../shared/helpers/validateAnswer';

// ==================== LEVEL CONFIG ====================

const LEVEL_INFO = {
  1: { title: 'One-Step Equations', instruction: 'Choose the correct operation to solve for x.' },
  2: { title: 'Two-Step Equations', instruction: 'Select each operation in order to isolate x.' },
  3: { title: 'Multi-Step Equations', instruction: 'Simplify first, then solve for x.' },
  4: { title: 'Variables on Both Sides', instruction: 'Move all variables to one side, then solve.' },
  5: { title: 'Word Problems', instruction: 'Translate the problem into an equation and solve.' },
};

// ==================== LEVEL 1: ONE-STEP OPERATION SELECTOR ====================

function OneStepOperationSelector({ visualData, onOperationSelect, selectedOperation }) {
  const { buttonOptions, correctOperation, equation } = visualData || {};

  if (!buttonOptions) return null;

  return (
    <OperationSelectorContainer>
      <SelectorPrompt>Which operation will isolate x?</SelectorPrompt>
      <ButtonGrid>
        {buttonOptions.map((option, idx) => (
          <OperationButton
            key={idx}
            onClick={() => onOperationSelect(option.operation)}
            selected={selectedOperation === option.operation}
            correct={selectedOperation === option.operation && option.operation === correctOperation}
            incorrect={selectedOperation === option.operation && option.operation !== correctOperation}
          >
            <OperationSymbol>{option.symbol}</OperationSymbol>
            <OperationLabel>{option.label}</OperationLabel>
          </OperationButton>
        ))}
      </ButtonGrid>

      {selectedOperation === correctOperation && (
        <SuccessMessage>
          Correct! {visualData.step1Text}
        </SuccessMessage>
      )}
      {selectedOperation && selectedOperation !== correctOperation && (
        <ErrorMessage>
          Not quite. Think about the inverse operation.
        </ErrorMessage>
      )}
    </OperationSelectorContainer>
  );
}

// ==================== LEVEL 2: TWO-STEP SEQUENTIAL BUTTONS ====================

function TwoStepSequentialButtons({ visualData, onStep1Select, onStep2Select, step1Selected, step2Selected }) {
  const { step1, step2 } = visualData || {};

  if (!step1 || !step2) return null;

  const step1Correct = step1Selected === step1.correctOperation;
  const step2Correct = step2Selected === step2.correctOperation;
  const step2Unlocked = step1Correct;

  return (
    <SequentialContainer>
      {/* Step 1 */}
      <StepSection>
        <StepLabel>Step 1:</StepLabel>
        <ButtonGrid>
          {step1.options.map((option, idx) => (
            <OperationButton
              key={idx}
              onClick={() => onStep1Select(option.operation)}
              selected={step1Selected === option.operation}
              correct={step1Selected === option.operation && option.operation === step1.correctOperation}
              incorrect={step1Selected === option.operation && option.operation !== step1.correctOperation}
              small
            >
              <OperationSymbol small>{option.symbol}</OperationSymbol>
              <OperationLabel small>{option.label}</OperationLabel>
            </OperationButton>
          ))}
        </ButtonGrid>
        {step1Correct && (
          <StepPrompt>{step1.text}</StepPrompt>
        )}
      </StepSection>

      {/* Step 2 (unlocked after step 1) */}
      <StepSection disabled={!step2Unlocked}>
        <StepLabel>Step 2:</StepLabel>
        {!step2Unlocked && (
          <StepPrompt>Complete Step 1 first</StepPrompt>
        )}
        <ButtonGrid>
          {step2.options.map((option, idx) => (
            <OperationButton
              key={idx}
              onClick={() => step2Unlocked && onStep2Select(option.operation)}
              selected={step2Selected === option.operation}
              correct={step2Selected === option.operation && option.operation === step2.correctOperation}
              incorrect={step2Selected === option.operation && option.operation !== step2.correctOperation}
              disabled={!step2Unlocked}
              small
            >
              <OperationSymbol small>{option.symbol}</OperationSymbol>
              <OperationLabel small>{option.label}</OperationLabel>
            </OperationButton>
          ))}
        </ButtonGrid>
        {step2Correct && (
          <StepPrompt>{step2.text}</StepPrompt>
        )}
      </StepSection>

      {step1Correct && step2Correct && (
        <AllStepsSuccessMessage>
          Excellent! Both steps are correct. Now solve for x.
        </AllStepsSuccessMessage>
      )}
    </SequentialContainer>
  );
}

// ==================== LEVEL 3/4: TOKEN DISPLAY ====================

function EquationTokenDisplay({ visualData }) {
  const { tokenDisplay, steps, coefficient1, constant } = visualData || {};
  const [tokens, setTokens] = useState(tokenDisplay?.tokens || []);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [groupingCorrect, setGroupingCorrect] = useState(false);

  // Distribution state
  const [distributedToX, setDistributedToX] = useState(false);
  const [distributedToConstant, setDistributedToConstant] = useState(false);
  const [draggedCoefficient, setDraggedCoefficient] = useState(null);
  const [firstDistributionDone, setFirstDistributionDone] = useState(false);
  const [insideTerms, setInsideTerms] = useState(['x', constant]); // Track order of terms inside parentheses

  // Combining state
  const [showCombineButton, setShowCombineButton] = useState(false);
  const [combinedRow, setCombinedRow] = useState(null);

  // Level 4 drag-down state
  const [draggedTile, setDraggedTile] = useState(null); // {side: 'left'|'right', index: number, value: string}
  const [placedBelow, setPlacedBelow] = useState(null); // {side: 'left'|'right', index: number, value: string}
  const [isNegative, setIsNegative] = useState(false); // Track if placed tile is negative
  const [hasBeenClicked, setHasBeenClicked] = useState(false); // Track if tile has been clicked to change sign
  const [secondPlacement, setSecondPlacement] = useState(null); // {side: 'left'|'right', index: number}
  const [calculatePressed, setCalculatePressed] = useState(false); // Track if calculate button was pressed
  const [resultRow, setResultRow] = useState(null); // {left: [...], right: [...]} - the calculated third row
  const [errorMessage, setErrorMessage] = useState(''); // Error message for invalid placement
  const [showError, setShowError] = useState(false); // Show error animation

  // Result row (Row 3) drag-down state - same pattern as Row 1
  const [resultDraggedTile, setResultDraggedTile] = useState(null);
  const [resultPlacedBelow, setResultPlacedBelow] = useState(null);
  const [resultIsNegative, setResultIsNegative] = useState(false);
  const [resultHasBeenClicked, setResultHasBeenClicked] = useState(false);
  const [resultSecondPlacement, setResultSecondPlacement] = useState(null);
  const [resultCalculatePressed, setResultCalculatePressed] = useState(false);
  const [finalRow, setFinalRow] = useState(null); // Row 4 - final result after second calculation

  const [draggedInsideTerm, setDraggedInsideTerm] = useState(null); // For swapping terms inside parentheses

  // Reset tokens when visualData changes (new question)
  useEffect(() => {
    if (tokenDisplay?.tokens) {
      setTokens(tokenDisplay.tokens);
      setGroupingCorrect(false);
      setDistributedToX(false);
      setDistributedToConstant(false);
      setDraggedCoefficient(null);
      setFirstDistributionDone(false);
      setInsideTerms(['x', constant]);
      setDraggedTile(null);
      setPlacedBelow(null);
      setIsNegative(false);
      setHasBeenClicked(false);
      setSecondPlacement(null);
      setCalculatePressed(false);
      setResultRow(null);
      setErrorMessage('');
      setShowError(false);
      setResultDraggedTile(null);
      setResultPlacedBelow(null);
      setResultIsNegative(false);
      setResultHasBeenClicked(false);
      setResultSecondPlacement(null);
      setResultCalculatePressed(false);
      setFinalRow(null);
      setShowCombineButton(false);
      setCombinedRow(null);
    }
  }, [tokenDisplay?.tokens, constant]);

  // Show combine button after 2 seconds when grouping is correct
  useEffect(() => {
    if (groupingCorrect && !showCombineButton && !combinedRow) {
      const timer = setTimeout(() => {
        setShowCombineButton(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [groupingCorrect, showCombineButton, combinedRow]);

  if (!tokenDisplay) return null;

  // Drag handlers for combining type
  const handleDragStart = (index) => (e) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (dropIndex) => (e) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    // Swap tokens
    const newTokens = [...tokens];
    [newTokens[draggedIndex], newTokens[dropIndex]] = [newTokens[dropIndex], newTokens[draggedIndex]];
    setTokens(newTokens);
    setDraggedIndex(null);

    // Check if grouping is correct (like terms together)
    checkGrouping(newTokens);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const checkGrouping = (currentTokens) => {
    // For combining type: variables should be together, constants together
    // Simple check: if variable terms are adjacent (indices 0,2 or 2,0 adjacent)
    const hasX = (token) => token.includes('x');
    const positions = currentTokens.map((token, idx) => ({ token, idx, hasX: hasX(token) }));

    // Check if all x terms are together
    const xIndices = positions.filter(p => p.hasX).map(p => p.idx);
    const nonXIndices = positions.filter(p => !p.hasX).map(p => p.idx);

    // Correct if x terms are consecutive
    if (xIndices.length === 2) {
      const isGrouped = Math.abs(xIndices[0] - xIndices[1]) === 1;
      setGroupingCorrect(isGrouped);
    }
  };

  // Format token display based on position
  const formatTokenForPosition = (token, index) => {
    // Remove leading "+" and whitespace to get base value
    const baseValue = token.replace(/^\+\s*/, '').trim();

    // First position: never show "+"
    if (index === 0) {
      return baseValue;
    }

    // Other positions: show "+" if it's not a negative number
    if (baseValue.startsWith('-')) {
      return ` ${baseValue}`;
    } else {
      return ` + ${baseValue}`;
    }
  };

  // Distribution drag handlers
  const handleDistributionDragStart = (e) => {
    setDraggedCoefficient(coefficient1);
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleDistributionDragEnd = () => {
    setDraggedCoefficient(null);
  };

  const handleDropOnX = (e) => {
    e.preventDefault();
    if (draggedCoefficient !== null && !distributedToX) {
      setDistributedToX(true);
      setFirstDistributionDone(true);
    }
  };

  const handleDropOnConstant = (e) => {
    e.preventDefault();
    if (draggedCoefficient !== null && !distributedToConstant) {
      setDistributedToConstant(true);
      setFirstDistributionDone(true);
    }
  };

  // Handlers for swapping terms inside parentheses
  const handleInsideTermDragStart = (index) => (e) => {
    setDraggedInsideTerm(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleInsideTermDrop = (dropIndex) => (e) => {
    e.preventDefault();
    if (draggedInsideTerm !== null && draggedInsideTerm !== dropIndex) {
      const newTerms = [...insideTerms];
      [newTerms[draggedInsideTerm], newTerms[dropIndex]] = [newTerms[dropIndex], newTerms[draggedInsideTerm]];
      setInsideTerms(newTerms);
      setDraggedInsideTerm(null);
    }
  };

  const handleInsideTermDragEnd = () => {
    setDraggedInsideTerm(null);
  };

  // Format term inside parentheses with proper sign
  const formatInsideTerm = (term, index) => {
    if (index === 0) {
      // First term: no sign
      return term === 'x' ? 'x' : String(term);
    } else {
      // Second term: include sign
      const value = term === 'x' ? 'x' : String(term);
      return `+${value}`;
    }
  };

  // Level 4 drag handlers for dragging tiles down
  const handleLevel4DragStart = (side, index, value) => (e) => {
    setDraggedTile({ side, index, value });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleLevel4DragEnd = () => {
    setDraggedTile(null);
  };

  const handleLevel4Drop = (side, index) => (e) => {
    e.preventDefault();
    if (draggedTile && draggedTile.side === side && draggedTile.index === index) {
      // Only allow placing below the same tile being dragged
      setPlacedBelow({ side, index, value: draggedTile.value });
      setIsNegative(false);
      setHasBeenClicked(false);
      setSecondPlacement(null);
    }
  };

  // Toggle sign of placed tile (only works once)
  const handleToggleSign = () => {
    if (!hasBeenClicked) {
      setIsNegative(!isNegative);
      setHasBeenClicked(true);
    }
  };

  // Drag placed tile to second position
  const handlePlacedTileDragStart = (e) => {
    if (hasBeenClicked) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', 'duplicate');
    } else {
      e.preventDefault();
    }
  };

  const handleSecondDrop = (side, index) => (e) => {
    e.preventDefault();
    if (hasBeenClicked && placedBelow) {
      // Don't allow dropping on the same position as the original
      if (!(side === placedBelow.side && index === placedBelow.index)) {
        // Update the second placement position (can move multiple times)
        setSecondPlacement({ side, index });
      }
    }
  };

  // Get display value with sign
  const getPlacedTileValue = () => {
    if (!placedBelow) return '';
    // Strip all leading whitespace and signs to get the base value
    const baseValue = placedBelow.value.replace(/^\s*[+-]\s*/, '').trim();
    return isNegative ? `-${baseValue}` : baseValue;
  };

  // Handle calculate button press
  const handleCalculate = () => {
    if (placedBelow && secondPlacement) {
      // Validate placement
      // 1. Check if on opposite sides
      if (placedBelow.side === secondPlacement.side) {
        setErrorMessage('Whatever you do to one side you have to do to the other side');
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
        return;
      }

      // 2. Check if like terms
      const tiles = secondPlacement.side === 'left' ? tokenDisplay.left : tokenDisplay.right;
      const tileUnderDuplicate = formatTokenForPosition(tiles[secondPlacement.index], secondPlacement.index);
      const placedTileValue = getPlacedTileValue();

      // Extract variable parts to check if like terms
      const underMatch = tileUnderDuplicate.trim().match(/^([+-]?\s*\d*)(.*)$/);
      const placedMatch = placedTileValue.trim().match(/^([+-]?\s*\d*)(.*)$/);

      const underVar = underMatch ? underMatch[2] : '';
      const placedVar = placedMatch ? placedMatch[2] : '';

      if (underVar !== placedVar) {
        setErrorMessage('Must be like terms');
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
        return;
      }

      // Validation passed - proceed with calculation
      setCalculatePressed(true);

      // Calculate the result row
      const leftResult = [];
      const rightResult = [];

      // Process left side
      tokenDisplay.left.forEach((token, idx) => {
        if (placedBelow.side === 'left' && placedBelow.index === idx) {
          // This tile is crossed out - skip it
          return;
        } else if (secondPlacement.side === 'left' && secondPlacement.index === idx) {
          // This tile has the duplicate - calculate the result
          const result = calculateCombination(formatTokenForPosition(token, idx), getPlacedTileValue());
          if (result) leftResult.push(result);
        } else {
          // No tile below - keep the original
          leftResult.push(formatTokenForPosition(token, idx));
        }
      });

      // Process right side
      tokenDisplay.right.forEach((token, idx) => {
        if (placedBelow.side === 'right' && placedBelow.index === idx) {
          // This tile is crossed out - skip it
          return;
        } else if (secondPlacement.side === 'right' && secondPlacement.index === idx) {
          // This tile has the duplicate - calculate the result
          const result = calculateCombination(formatTokenForPosition(token, idx), getPlacedTileValue());
          if (result) rightResult.push(result);
        } else {
          // No tile below - keep the original
          rightResult.push(formatTokenForPosition(token, idx));
        }
      });

      setResultRow({ left: leftResult, right: rightResult });
    }
  };

  // Combine like terms in the tokens array
  const handleCombineTerms = () => {
    const combined = [];
    const processed = new Set();

    tokens.forEach((token, idx) => {
      if (processed.has(idx)) return;

      const tokenMatch = token.replace(/^\+\s*/, '').trim().match(/^([+-]?\s*\d*)(.*)$/);
      if (!tokenMatch) {
        combined.push(formatTokenForPosition(token, combined.length));
        processed.add(idx);
        return;
      }

      const tokenVar = tokenMatch[2];
      let sum = 0;
      let foundLikeTerm = false;

      // Find all like terms
      tokens.forEach((otherToken, otherIdx) => {
        if (processed.has(otherIdx)) return;

        const otherMatch = otherToken.replace(/^\+\s*/, '').trim().match(/^([+-]?\s*\d*)(.*)$/);
        if (!otherMatch) return;

        const otherVar = otherMatch[2];

        if (tokenVar === otherVar) {
          foundLikeTerm = true;
          const coeff = tokenMatch[1].replace(/\s/g, '') || '1';
          const coeffNum = coeff === '+' || coeff === '' ? 1 : (coeff === '-' ? -1 : parseInt(coeff));

          const otherCoeff = otherMatch[1].replace(/\s/g, '') || '1';
          const otherCoeffNum = otherCoeff === '+' || otherCoeff === '' ? 1 : (otherCoeff === '-' ? -1 : parseInt(otherCoeff));

          sum += (otherIdx === idx ? coeffNum : otherCoeffNum);
          processed.add(otherIdx);
        }
      });

      if (foundLikeTerm && sum !== 0) {
        const coeffDisplay = Math.abs(sum) === 1 && tokenVar ? '' : Math.abs(sum);
        const result = `${sum > 0 ? '' : '-'}${coeffDisplay}${tokenVar}`;
        combined.push(formatTokenForPosition(result, combined.length));
      }
    });

    setCombinedRow(combined);
  };

  // Calculate the combination of two terms
  const calculateCombination = (topTerm, bottomTerm) => {
    // Extract numbers and variables
    const topMatch = topTerm.trim().match(/^([+-]?\s*\d*)(.*)$/);
    const bottomMatch = bottomTerm.trim().match(/^([+-]?\s*\d*)(.*)$/);

    if (!topMatch || !bottomMatch) return `${topTerm} ${bottomTerm}`;

    const topCoeff = topMatch[1].replace(/\s/g, '') || '1';
    const topVar = topMatch[2];
    const bottomCoeff = bottomMatch[1].replace(/\s/g, '') || '1';
    const bottomVar = bottomMatch[2];

    // Check if they have the same variable part
    if (topVar === bottomVar) {
      // Like terms - combine coefficients
      const topNum = topCoeff === '+' || topCoeff === '' ? 1 : (topCoeff === '-' ? -1 : parseInt(topCoeff));
      const bottomNum = bottomCoeff === '+' || bottomCoeff === '' ? 1 : (bottomCoeff === '-' ? -1 : parseInt(bottomCoeff));
      const result = topNum + bottomNum;

      if (result === 0) return null; // Terms cancel out

      const sign = result > 0 ? '' : '';
      const coeff = Math.abs(result) === 1 && topVar ? '' : Math.abs(result);
      return `${result > 0 ? '' : '-'}${coeff}${topVar}`;
    } else {
      // Unlike terms - just show both
      return `${topTerm} ${bottomTerm}`;
    }
  };

  // Result row (Row 3) drag handlers - same pattern as Row 1
  const handleResultLevel4DragStart = (side, index, value) => (e) => {
    setResultDraggedTile({ side, index, value });
    e.dataTransfer.effectAllowed = 'copy';
  };

  const handleResultLevel4DragEnd = () => {
    setResultDraggedTile(null);
  };

  const handleResultLevel4Drop = (side, index) => (e) => {
    e.preventDefault();
    if (resultDraggedTile && resultDraggedTile.side === side && resultDraggedTile.index === index) {
      setResultPlacedBelow({ side, index, value: resultDraggedTile.value });
      setResultIsNegative(false);
      setResultHasBeenClicked(false);
      setResultSecondPlacement(null);
    }
  };

  const handleResultToggleSign = () => {
    if (!resultHasBeenClicked) {
      setResultIsNegative(!resultIsNegative);
      setResultHasBeenClicked(true);
    }
  };

  const handleResultPlacedTileDragStart = (e) => {
    if (resultHasBeenClicked) {
      e.dataTransfer.effectAllowed = 'copy';
      e.dataTransfer.setData('text/plain', 'duplicate');
    } else {
      e.preventDefault();
    }
  };

  const handleResultSecondDrop = (side, index) => (e) => {
    e.preventDefault();
    if (resultHasBeenClicked && resultPlacedBelow) {
      if (!(side === resultPlacedBelow.side && index === resultPlacedBelow.index)) {
        setResultSecondPlacement({ side, index });
      }
    }
  };

  const getResultPlacedTileValue = () => {
    if (!resultPlacedBelow) return '';
    const baseValue = resultPlacedBelow.value.replace(/^\s*[+-]\s*/, '').trim();
    return resultIsNegative ? `-${baseValue}` : baseValue;
  };

  const handleResultCalculate = () => {
    if (resultPlacedBelow && resultSecondPlacement && resultRow) {
      // Validate placement
      if (resultPlacedBelow.side === resultSecondPlacement.side) {
        setErrorMessage('Whatever you do to one side you have to do to the other side');
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
        return;
      }

      // Check if like terms
      const tiles = resultSecondPlacement.side === 'left' ? resultRow.left : resultRow.right;
      const tileUnderDuplicate = tiles[resultSecondPlacement.index];
      const placedTileValue = getResultPlacedTileValue();

      const underMatch = tileUnderDuplicate.trim().match(/^([+-]?\s*\d*)(.*)$/);
      const placedMatch = placedTileValue.trim().match(/^([+-]?\s*\d*)(.*)$/);

      const underVar = underMatch ? underMatch[2] : '';
      const placedVar = placedMatch ? placedMatch[2] : '';

      if (underVar !== placedVar) {
        setErrorMessage('Must be like terms');
        setShowError(true);
        setTimeout(() => setShowError(false), 1000);
        return;
      }

      // Validation passed - proceed with calculation
      setResultCalculatePressed(true);

      // Calculate the final row
      const leftFinal = [];
      const rightFinal = [];

      // Process left side
      resultRow.left.forEach((token, idx) => {
        if (resultPlacedBelow.side === 'left' && resultPlacedBelow.index === idx) {
          return; // Crossed out - skip
        } else if (resultSecondPlacement.side === 'left' && resultSecondPlacement.index === idx) {
          const result = calculateCombination(token, getResultPlacedTileValue());
          if (result) leftFinal.push(result);
        } else {
          leftFinal.push(token);
        }
      });

      // Process right side
      resultRow.right.forEach((token, idx) => {
        if (resultPlacedBelow.side === 'right' && resultPlacedBelow.index === idx) {
          return; // Crossed out - skip
        } else if (resultSecondPlacement.side === 'right' && resultSecondPlacement.index === idx) {
          const result = calculateCombination(token, getResultPlacedTileValue());
          if (result) rightFinal.push(result);
        } else {
          rightFinal.push(token);
        }
      });

      setFinalRow({ left: leftFinal, right: rightFinal });
    }
  };

  // Get calculated result for the second placement position
  const getCalculatedResult = (side, index) => {
    if (!secondPlacement || secondPlacement.side !== side || secondPlacement.index !== index) {
      return null;
    }

    // Get the tile above this position
    const tiles = side === 'left' ? tokenDisplay.left : tokenDisplay.right;
    const tileAbove = formatTokenForPosition(tiles[index], index);
    const tileBelow = getPlacedTileValue();

    // Combine them (this is a simple version - just show both)
    return `${tileAbove} ${tileBelow}`;
  };

  return (
    <TokenContainer>
      <TokenEquation>
        {tokenDisplay.type === 'distribution' && (
          <>
            {!distributedToX || !distributedToConstant ? (
              <TokensRow>
                <DistributionCoefficient
                  draggable
                  onDragStart={handleDistributionDragStart}
                  onDragEnd={handleDistributionDragEnd}
                  isDragging={draggedCoefficient !== null}
                  isUsedOnce={firstDistributionDone}
                >
                  {coefficient1}
                </DistributionCoefficient>
                <Token type="operator">(</Token>
                {insideTerms.map((term, idx) => {
                  const isXTerm = term === 'x';
                  const isDistributed = isXTerm ? distributedToX : distributedToConstant;
                  const displayValue = isDistributed
                    ? (isXTerm ? `${coefficient1}x` : String(coefficient1 * constant))
                    : formatInsideTerm(term, idx);

                  return (
                    <DistributionInsideTerm
                      key={idx}
                      draggable={!isDistributed}
                      onDragStart={handleInsideTermDragStart(idx)}
                      onDragEnd={handleInsideTermDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={isDistributed ? null : handleInsideTermDrop(idx)}
                      isDistributed={isDistributed}
                      isDropTarget={!isDistributed}
                      onDragOverCapture={(e) => { if (!isDistributed) e.preventDefault(); }}
                      onDropCapture={isXTerm ? handleDropOnX : handleDropOnConstant}
                    >
                      {displayValue}
                    </DistributionInsideTerm>
                  );
                })}
                <Token type="operator">)</Token>
              </TokensRow>
            ) : (
              <TokensRow>
                <Token type="variable">{coefficient1}x</Token>
                <Token type="operator">+</Token>
                <Token type="number">{coefficient1 * constant}</Token>
              </TokensRow>
            )}
            {distributedToX && distributedToConstant && (
              <GroupingSuccess>
                Perfect! Distribution complete.
              </GroupingSuccess>
            )}
          </>
        )}
        {tokenDisplay.type === 'combining' && (
          <TokensRow>
            {tokens.map((token, idx) => (
              <DraggableToken
                key={idx}
                type={getTokenType(token)}
                draggable
                onDragStart={handleDragStart(idx)}
                onDragOver={handleDragOver}
                onDrop={handleDrop(idx)}
                onDragEnd={handleDragEnd}
                isDragging={draggedIndex === idx}
              >
                {formatTokenForPosition(token, idx)}
              </DraggableToken>
            ))}
          </TokensRow>
        )}
        {tokenDisplay.left && tokenDisplay.right && (
          <>
            <RowsContainer calculatePressed={calculatePressed}>
              <BothSidesRow>
              <TokensRow>
                {tokenDisplay.left.map((token, idx) => (
                  <TileColumn key={idx}>
                    <DraggableToken
                      type={getTokenType(token)}
                      draggable
                      onDragStart={handleLevel4DragStart('left', idx, formatTokenForPosition(token, idx))}
                      onDragEnd={handleLevel4DragEnd}
                      isDragging={draggedTile?.side === 'left' && draggedTile?.index === idx}
                    >
                      {formatTokenForPosition(token, idx)}
                    </DraggableToken>
                    <DropZoneBelow
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        handleLevel4Drop('left', idx)(e);
                        handleSecondDrop('left', idx)(e);
                      }}
                      hasPlaced={
                        (placedBelow?.side === 'left' && placedBelow?.index === idx) ||
                        (secondPlacement?.side === 'left' && secondPlacement?.index === idx)
                      }
                    >
                      {placedBelow?.side === 'left' && placedBelow?.index === idx && (
                        <ClickablePlacedTile
                          type={getTokenType(token)}
                          isNegative={isNegative}
                          onClick={handleToggleSign}
                          draggable={hasBeenClicked}
                          onDragStart={handlePlacedTileDragStart}
                          strikethrough={calculatePressed}
                        >
                          {calculatePressed
                            ? `${formatTokenForPosition(token, idx)} ${getPlacedTileValue()}`
                            : getPlacedTileValue()}
                        </ClickablePlacedTile>
                      )}
                      {secondPlacement?.side === 'left' && secondPlacement?.index === idx && (
                        <DraggablePlacedTile
                          type={getTokenType(token)}
                          isNegative={isNegative}
                          draggable={!calculatePressed}
                          onDragStart={calculatePressed ? undefined : handlePlacedTileDragStart}
                        >
                          {calculatePressed ? getCalculatedResult('left', idx) : getPlacedTileValue()}
                        </DraggablePlacedTile>
                      )}
                    </DropZoneBelow>
                  </TileColumn>
                ))}
              </TokensRow>
              <EqualsSign>=</EqualsSign>
              <TokensRow>
                {tokenDisplay.right.map((token, idx) => (
                  <TileColumn key={idx}>
                    <DraggableToken
                      type={getTokenType(token)}
                      draggable
                      onDragStart={handleLevel4DragStart('right', idx, formatTokenForPosition(token, idx))}
                      onDragEnd={handleLevel4DragEnd}
                      isDragging={draggedTile?.side === 'right' && draggedTile?.index === idx}
                    >
                      {formatTokenForPosition(token, idx)}
                    </DraggableToken>
                    <DropZoneBelow
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => {
                        handleLevel4Drop('right', idx)(e);
                        handleSecondDrop('right', idx)(e);
                      }}
                      hasPlaced={
                        (placedBelow?.side === 'right' && placedBelow?.index === idx) ||
                        (secondPlacement?.side === 'right' && secondPlacement?.index === idx)
                      }
                    >
                      {placedBelow?.side === 'right' && placedBelow?.index === idx && (
                        <ClickablePlacedTile
                          type={getTokenType(token)}
                          isNegative={isNegative}
                          onClick={handleToggleSign}
                          draggable={hasBeenClicked}
                          onDragStart={handlePlacedTileDragStart}
                          strikethrough={calculatePressed}
                        >
                          {calculatePressed
                            ? `${formatTokenForPosition(token, idx)} ${getPlacedTileValue()}`
                            : getPlacedTileValue()}
                        </ClickablePlacedTile>
                      )}
                      {secondPlacement?.side === 'right' && secondPlacement?.index === idx && (
                        <DraggablePlacedTile
                          type={getTokenType(token)}
                          isNegative={isNegative}
                          draggable={!calculatePressed}
                          onDragStart={calculatePressed ? undefined : handlePlacedTileDragStart}
                        >
                          {calculatePressed ? getCalculatedResult('right', idx) : getPlacedTileValue()}
                        </DraggablePlacedTile>
                      )}
                    </DropZoneBelow>
                  </TileColumn>
                ))}
              </TokensRow>
            </BothSidesRow>
            {placedBelow && secondPlacement && !calculatePressed && (
              <CalculateButtonContainer>
                <CalculateButton
                  onClick={handleCalculate}
                  disabled={calculatePressed}
                  showError={showError}
                >
                  Calculate
                </CalculateButton>
                {showError && (
                  <ErrorMessage>{errorMessage}</ErrorMessage>
                )}
              </CalculateButtonContainer>
            )}
            {calculatePressed && resultRow && (
              <>
                <ResultRow>
                  <TokensRow>
                    {resultRow.left.map((value, idx) => (
                      <TileColumn key={idx}>
                        <DraggableToken
                          type={getTokenType(value)}
                          draggable
                          onDragStart={handleResultLevel4DragStart('left', idx, value)}
                          onDragEnd={handleResultLevel4DragEnd}
                          isDragging={resultDraggedTile?.side === 'left' && resultDraggedTile?.index === idx}
                        >
                          {value}
                        </DraggableToken>
                        <DropZoneBelow
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            handleResultLevel4Drop('left', idx)(e);
                            handleResultSecondDrop('left', idx)(e);
                          }}
                          hasPlaced={
                            (resultPlacedBelow?.side === 'left' && resultPlacedBelow?.index === idx) ||
                            (resultSecondPlacement?.side === 'left' && resultSecondPlacement?.index === idx)
                          }
                        >
                          {resultPlacedBelow?.side === 'left' && resultPlacedBelow?.index === idx && (
                            <ClickablePlacedTile
                              type={getTokenType(value)}
                              isNegative={resultIsNegative}
                              onClick={handleResultToggleSign}
                              draggable={resultHasBeenClicked}
                              onDragStart={handleResultPlacedTileDragStart}
                              strikethrough={resultCalculatePressed}
                            >
                              {resultCalculatePressed
                                ? `${value} ${getResultPlacedTileValue()}`
                                : getResultPlacedTileValue()}
                            </ClickablePlacedTile>
                          )}
                          {resultSecondPlacement?.side === 'left' && resultSecondPlacement?.index === idx && (
                            <DraggablePlacedTile
                              type={getTokenType(value)}
                              isNegative={resultIsNegative}
                              draggable={!resultCalculatePressed}
                              onDragStart={resultCalculatePressed ? undefined : handleResultPlacedTileDragStart}
                            >
                              {resultCalculatePressed
                                ? calculateCombination(value, getResultPlacedTileValue())
                                : getResultPlacedTileValue()}
                            </DraggablePlacedTile>
                          )}
                        </DropZoneBelow>
                      </TileColumn>
                    ))}
                  </TokensRow>
                  <EqualsSign>=</EqualsSign>
                  <TokensRow>
                    {resultRow.right.map((value, idx) => (
                      <TileColumn key={idx}>
                        <DraggableToken
                          type={getTokenType(value)}
                          draggable
                          onDragStart={handleResultLevel4DragStart('right', idx, value)}
                          onDragEnd={handleResultLevel4DragEnd}
                          isDragging={resultDraggedTile?.side === 'right' && resultDraggedTile?.index === idx}
                        >
                          {value}
                        </DraggableToken>
                        <DropZoneBelow
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            handleResultLevel4Drop('right', idx)(e);
                            handleResultSecondDrop('right', idx)(e);
                          }}
                          hasPlaced={
                            (resultPlacedBelow?.side === 'right' && resultPlacedBelow?.index === idx) ||
                            (resultSecondPlacement?.side === 'right' && resultSecondPlacement?.index === idx)
                          }
                        >
                          {resultPlacedBelow?.side === 'right' && resultPlacedBelow?.index === idx && (
                            <ClickablePlacedTile
                              type={getTokenType(value)}
                              isNegative={resultIsNegative}
                              onClick={handleResultToggleSign}
                              draggable={resultHasBeenClicked}
                              onDragStart={handleResultPlacedTileDragStart}
                              strikethrough={resultCalculatePressed}
                            >
                              {resultCalculatePressed
                                ? `${value} ${getResultPlacedTileValue()}`
                                : getResultPlacedTileValue()}
                            </ClickablePlacedTile>
                          )}
                          {resultSecondPlacement?.side === 'right' && resultSecondPlacement?.index === idx && (
                            <DraggablePlacedTile
                              type={getTokenType(value)}
                              isNegative={resultIsNegative}
                              draggable={!resultCalculatePressed}
                              onDragStart={resultCalculatePressed ? undefined : handleResultPlacedTileDragStart}
                            >
                              {resultCalculatePressed
                                ? calculateCombination(value, getResultPlacedTileValue())
                                : getResultPlacedTileValue()}
                            </DraggablePlacedTile>
                          )}
                        </DropZoneBelow>
                      </TileColumn>
                    ))}
                  </TokensRow>
                </ResultRow>
                {resultPlacedBelow && resultSecondPlacement && !resultCalculatePressed && (
                  <CalculateButtonContainer>
                    <CalculateButton
                      onClick={handleResultCalculate}
                      disabled={resultCalculatePressed}
                      showError={showError}
                    >
                      Calculate
                    </CalculateButton>
                    {showError && (
                      <ErrorMessage>{errorMessage}</ErrorMessage>
                    )}
                  </CalculateButtonContainer>
                )}
                {resultCalculatePressed && finalRow && (
                  <ResultRow>
                    <TokensRow>
                      {finalRow.left.map((value, idx) => (
                        <Token key={idx} type={getTokenType(value)}>
                          {value}
                        </Token>
                      ))}
                    </TokensRow>
                    <EqualsSign>=</EqualsSign>
                    <TokensRow>
                      {finalRow.right.map((value, idx) => (
                        <Token key={idx} type={getTokenType(value)}>
                          {value}
                        </Token>
                      ))}
                    </TokensRow>
                  </ResultRow>
                )}
              </>
            )}
            </RowsContainer>
          </>
        )}
      </TokenEquation>

      {tokenDisplay?.type === 'combining' && groupingCorrect && !showCombineButton && !combinedRow && (
        <GroupingSuccess>
          Great! Like terms are grouped together.
        </GroupingSuccess>
      )}

      {tokenDisplay?.type === 'combining' && showCombineButton && !combinedRow && (
        <CombineButtonContainer>
          <CombineButton onClick={handleCombineTerms}>
            put them together
          </CombineButton>
        </CombineButtonContainer>
      )}

      {tokenDisplay?.type === 'combining' && combinedRow && (
        <CombinedRow>
          <TokensRow>
            {combinedRow.map((value, idx) => (
              <Token key={idx} type={getTokenType(value)}>
                {value}
              </Token>
            ))}
          </TokensRow>
        </CombinedRow>
      )}

      {steps && (
        (tokenDisplay?.type === 'combining' && groupingCorrect) ||
        (tokenDisplay?.type === 'distribution' && distributedToX && distributedToConstant) ||
        (tokenDisplay?.type !== 'combining' && tokenDisplay?.type !== 'distribution' && !tokenDisplay?.left && !tokenDisplay?.right)
      ) && (
        <StepsDisplay>
          <StepsTitle>Solution Steps:</StepsTitle>
          {steps.map((step, idx) => (
            <StepItem key={idx}>{step}</StepItem>
          ))}
        </StepsDisplay>
      )}
    </TokenContainer>
  );
}

function getTokenType(token) {
  if (token.includes('x')) return 'variable';
  if (['+', '−', '×', '÷', '(', ')'].includes(token)) return 'operator';
  return 'number';
}

// ==================== LEVEL 5: KEYWORD HIGHLIGHTER ====================

function KeywordHighlighter({ problemText, keywords }) {
  if (!keywords || keywords.length === 0) {
    return <WordProblemText>{problemText}</WordProblemText>;
  }

  // Highlight keywords in the text
  let highlightedText = problemText;
  const segments = [];
  let lastIndex = 0;

  // Sort keywords by position in text
  const keywordPositions = keywords.map(kw => ({
    keyword: kw,
    index: problemText.toLowerCase().indexOf(kw.toLowerCase())
  })).filter(kw => kw.index >= 0).sort((a, b) => a.index - b.index);

  keywordPositions.forEach((kw, idx) => {
    // Add text before keyword
    if (kw.index > lastIndex) {
      segments.push(
        <span key={`text-${idx}`}>
          {problemText.substring(lastIndex, kw.index)}
        </span>
      );
    }

    // Add highlighted keyword
    segments.push(
      <Keyword key={`kw-${idx}`} color={getKeywordColorFromType(kw.keyword)}>
        {problemText.substring(kw.index, kw.index + kw.keyword.length)}
      </Keyword>
    );

    lastIndex = kw.index + kw.keyword.length;
  });

  // Add remaining text
  if (lastIndex < problemText.length) {
    segments.push(
      <span key="text-end">{problemText.substring(lastIndex)}</span>
    );
  }

  return <WordProblemText>{segments}</WordProblemText>;
}

function getKeywordColorFromType(keyword) {
  const kw = keyword.toLowerCase();
  if (kw.includes('add') || kw.includes('total') || kw.includes('more')) return '#10B981'; // green
  if (kw.includes('subtract') || kw.includes('less') || kw.includes('difference')) return '#EF4444'; // red
  if (kw.includes('multiply') || kw.includes('times')) return '#3B82F6'; // blue
  if (kw.includes('divide') || kw.includes('per')) return '#8B5CF6'; // purple
  return '#F59E0B'; // orange (default)
}

// ==================== MAIN COMPONENT ====================

function SolvingEquationsLesson({ triggerNewProblem }) {
  const dispatch = useDispatch();
  const {
    lessonProps,
    showAnswer,
    revealAnswer,
    hideAnswer,
    questionAnswerArray,
    currentQuestionIndex,
  } = useLessonState();

  // Selectors for canvas submission
  const userAnswer = useSelector((state) => state.lesson.userAnswer);
  const lessonName = useSelector((state) => state.lesson.lessonProps.lessonName);
  const isUsingBatch = useSelector(
    (state) => state.lesson.questionAnswerArray && state.lesson.questionAnswerArray.length > 0
  );

  const [showHint, setShowHint] = useState(false);
  const [selectedOperation, setSelectedOperation] = useState(null);
  const [step1Selected, setStep1Selected] = useState(null);
  const [step2Selected, setStep2Selected] = useState(null);
  const [showVisualHelper, setShowVisualHelper] = useState(true);
  const [resetKey, setResetKey] = useState(0);
  const [showCanvas, setShowCanvas] = useState(false);

  // ========== InputOverlay State ==========
  const { width: windowWidth } = useWindowDimensions();

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

  // Context tracking: 'main' (L3/L4/L5) or 'canvas' (L1/L2)
  const [context, setContext] = useState('main');

  // Calculate slide distance based on context
  const slideDistance = useMemo(() => {
    if (windowWidth <= 768) return 0; // Mobile: no slide
    const panelWidth = Math.min(Math.max(windowWidth * 0.4, 360), 480);

    // Canvas: 75% (fixed size), Main: 60% (flexible + scale)
    return showCanvas ? panelWidth * 0.75 : panelWidth * 0.6;
  }, [windowWidth, showCanvas]);

  // Reset operation selections when question changes
  useEffect(() => {
    setSelectedOperation(null);
    setStep1Selected(null);
    setStep2Selected(null);
    setShowHint(false);
    setShowCanvas(false);
    if (!keepOpen) {
      // Normal mode: close panel and reset everything
      resetAll();
    } else {
      // Keep Open mode: just reset input/state, keep panel open
      setInputValue('');
      setSubmitted(false);
    }
    setContext('main'); // Reset context
  }, [currentQuestionIndex, keepOpen, resetAll, setInputValue, setSubmitted]);

  // Hide visual helper after question 8 (index 7) unless explicitly shown
  useEffect(() => {
    if (currentQuestionIndex >= 8) {
      setShowVisualHelper(false);
    }
  }, [currentQuestionIndex]);

  // Current problem
  const currentProblem = questionAnswerArray?.[currentQuestionIndex] || lessonProps;
  const {
    question,
    answer,
    acceptedAnswers,
    hint,
    explanation,
    visualData,
    level,
    levelNum: levelNumStr
  } = currentProblem;

  // Get level number
  const levelNum = parseInt(levelNumStr || level || '1', 10);

  // Question text
  const questionText = question?.[0]?.text || question || '';

  // Format answer
  const correctAnswer = useMemo(() => {
    if (acceptedAnswers?.length > 0) return acceptedAnswers;
    if (Array.isArray(answer)) return answer;
    return [String(answer)];
  }, [answer, acceptedAnswers]);

  // Show canvas for Level 1 after correct operation selected
  useEffect(() => {
    if (levelNum === 1 && selectedOperation === visualData?.correctOperation) {
      setShowCanvas(true);
    }
  }, [selectedOperation, visualData, levelNum]);

  // Show canvas for Level 2 after both steps correct
  useEffect(() => {
    if (levelNum === 2) {
      const step1Correct = step1Selected === visualData?.step1?.correctOperation;
      const step2Correct = step2Selected === visualData?.step2?.correctOperation;
      if (step1Correct && step2Correct) {
        setShowCanvas(true);
      }
    }
  }, [step1Selected, step2Selected, visualData, levelNum]);

  // Determine if visual helper should be shown (progressive scaffolding)
  const shouldShowVisual = (levelNum === 1 || levelNum === 2) &&
                          (currentQuestionIndex < 8 || showVisualHelper);

  // Event handlers
  const handleTryAnother = () => {
    setShowHint(false);
    setSelectedOperation(null);
    setStep1Selected(null);
    setStep2Selected(null);
    setShowCanvas(false);
    setResetKey(prev => prev + 1);
    hideAnswer();
    triggerNewProblem();
  };

  const handleCorrectAnswer = () => {
    revealAnswer();
  };

  const handleCanvasSubmit = () => {
    if (!userAnswer.trim()) return;

    const isCorrect = validateAnswer(userAnswer, correctAnswer, 'array', lessonName);
    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));

    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect) {
      handleCorrectAnswer();
    }
  };

  // Handle panel submission
  const handlePanelSubmit = () => {
    if (inputValue.trim() === '') return;

    const isCorrect = validateAnswer(inputValue, correctAnswer, 'array', lessonName);
    setSubmitted(true);

    dispatch(setAnswerFeedback(isCorrect ? 'correct' : 'incorrect'));

    if (isUsingBatch) {
      dispatch(recordAnswer({ isCorrect }));
    }

    if (isCorrect) {
      if (keepOpen) {
        // Keep Open mode: Clear input and auto-advance after 1 second
        setTimeout(() => {
          setInputValue('');
          setSubmitted(false);
          handleTryAnother();
        }, 1000);
      } else {
        // Normal mode: Close panel and advance
        closePanel();
        setTimeout(() => {
          handleTryAnother();
        }, 500);
      }
    }
  };

  // Track if answer is correct for button disabled state
  const isCorrect = useMemo(() => {
    if (!submitted || inputValue.trim() === '') return false;
    return validateAnswer(inputValue, correctAnswer, 'array', lessonName);
  }, [submitted, inputValue, correctAnswer, lessonName]);

  const handleShowHint = () => {
    setShowHint(true);
    setShowVisualHelper(true); // Show visual helper when hint is requested
  };

  const handleOperationSelect = (operation) => {
    setSelectedOperation(operation);
  };

  const handleStep1Select = (operation) => {
    setStep1Selected(operation);
  };

  const handleStep2Select = (operation) => {
    setStep2Selected(operation);
  };

  const info = LEVEL_INFO[levelNum] || LEVEL_INFO[1];

  if (!currentProblem) {
    return (
      <Wrapper>
        <LoadingText>Loading...</LoadingText>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      {/* Hint button - fixed top right */}
      {!showAnswer && !showHint && hint && (
        <TopHintButton onClick={handleShowHint}>
          Need a hint?
        </TopHintButton>
      )}

      {/* ========== WRAPPER FOR SLIDE ANIMATION ========== */}
      <SequenceWrapper
        $panelOpen={panelOpen && context === 'main'}
        $slideDistance={slideDistance}
      >
        {/* Level header */}
        <LevelHeader>
          <LevelBadge>Level {levelNum}</LevelBadge>
          <LevelTitle>{info.title}</LevelTitle>
        </LevelHeader>

        <InstructionText>{info.instruction}</InstructionText>

        {/* Question */}
        <QuestionSection>
          {levelNum === 5 ? (
            <KeywordHighlighter
              problemText={questionText}
              keywords={visualData?.keywords || []}
            />
          ) : (
            <QuestionTextKatex>
              <InlineMath math={questionText} />
            </QuestionTextKatex>
          )}
        </QuestionSection>

        {/* Interactive components based on level */}
        {levelNum === 1 && shouldShowVisual && (
          <OneStepOperationSelector
            key={currentQuestionIndex}
            visualData={visualData}
            onOperationSelect={handleOperationSelect}
            selectedOperation={selectedOperation}
          />
        )}

        {levelNum === 2 && shouldShowVisual && (
          <TwoStepSequentialButtons
            key={currentQuestionIndex}
            visualData={visualData}
            onStep1Select={handleStep1Select}
            onStep2Select={handleStep2Select}
            step1Selected={step1Selected}
            step2Selected={step2Selected}
          />
        )}

        {(levelNum === 3 || levelNum === 4) && visualData?.tokenDisplay && (
          <EquationTokenDisplay key={resetKey} visualData={visualData} />
        )}

        {/* Helper card for verification */}
        {!showAnswer && levelNum >= 2 && (
          <HelperSection>
            <HelperCard>
              <HelperTitle>Remember:</HelperTitle>
              <HelperText>Always verify your answer by substituting x back into the original equation!</HelperText>
            </HelperCard>
          </HelperSection>
        )}

        {/* Hint */}
        {showHint && hint && (
          <HintBox>{hint}</HintBox>
        )}

        {/* Static button - only show when panel closed and not on canvas */}
        {!showAnswer && !panelOpen && !showCanvas && (
          <ButtonContainer>
            <EnterAnswerButton
              onClick={() => {
                setContext('main');
                openPanel();
              }}
              disabled={submitted && isCorrect}
              variant="static"
            />
          </ButtonContainer>
        )}
      </SequenceWrapper>
      {/* ========== END WRAPPER ========== */}

      {/* Explanation - shown after correct answer */}
      {showAnswer && !panelOpen && explanation && (
        <ExplanationSection>
          <ExplanationTitle>Explanation</ExplanationTitle>
          <ExplanationText>{explanation}</ExplanationText>
          {visualData?.verificationText && (
            <VerificationText>{visualData.verificationText}</VerificationText>
          )}
          <TryAnotherButton onClick={handleTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ExplanationSection>
      )}

      {/* Drawing Canvas - iPad overlay for Level 1 & 2 */}
      {showCanvas && (levelNum === 1 || levelNum === 2) && (
        <DrawingCanvas
          equation={questionText}
          questionIndex={currentQuestionIndex}
          visible={showCanvas}
          onClose={() => setShowCanvas(false)}
          disabled={showAnswer}
          // NEW PROPS for panel integration
          panelOpen={panelOpen && context === 'canvas'}
          onOpenPanel={() => {
            setContext('canvas');
            openPanel();
          }}
          slideDistance={slideDistance}
        />
      )}

      {/* Shared InputOverlayPanel - works for both main page and canvas */}
      <InputOverlayPanel
        visible={panelOpen}
        onClose={closePanel}
        title="Enter Your Answer"
      >
        <InputLabel>
          Answer (x = ?):
          {submitted && (isCorrect ? ' ✓' : ' ✗')}
        </InputLabel>

        <SlimMathKeypad
          value={inputValue}
          onChange={setInputValue}
          onSubmit={handlePanelSubmit}
          keepOpen={keepOpen}
          onKeepOpenChange={setKeepOpen}
        />

        {submitted && !isCorrect && (
          <FeedbackSection $isWrong>
            Not quite — try again!
          </FeedbackSection>
        )}

        <PanelButtonRow>
          <SubmitButton onClick={handlePanelSubmit} disabled={!inputValue.trim()}>
            Submit Answer
          </SubmitButton>
        </PanelButtonRow>
      </InputOverlayPanel>
    </Wrapper>
  );
}

export default SolvingEquationsLesson;

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

  @media (max-width: 1024px) {
    padding: 16px;
  }
`;

const SequenceWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;

  transition: transform 0.3s ease-in-out;

  /* Desktop + iPad: Slide left and scale when panel opens */
  @media (min-width: 769px) {
    ${props => props.$panelOpen ? css`
      transform: translateX(-${props.$slideDistance}px) scale(0.95);
      transform-origin: left center;
    ` : css`
      transform: translateX(0) scale(1);
      transform-origin: center center;
    `}
  }

  @media (max-width: 768px) {
    transform: translateX(0);
  }

  @media (max-width: 1024px) {
    gap: 16px;
  }
`;

const ButtonContainer = styled.div`
  width: 100%;
  max-width: 500px;
  margin-top: 16px;
`;

const InputLabel = styled.label`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  margin-bottom: 12px;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 10px;
  }
`;

const FeedbackSection = styled.div`
  margin-top: 12px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;

  ${props => props.$isWrong && css`
    background-color: ${props.theme.colors.danger || '#E53E3E'}15;
    color: ${props.theme.colors.danger || '#E53E3E'};
    border: 1px solid ${props.theme.colors.danger || '#E53E3E'};
  `}

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 10px 14px;
  }
`;

const PanelButtonRow = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 16px;
  width: 100%;
`;

const SubmitButton = styled.button`
  flex: 1;
  padding: 14px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  touch-action: manipulation;

  &:hover:not(:disabled) {
    opacity: 0.9;
  }

  &:disabled {
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 12px 20px;
    font-size: 15px;
  }
`;

const LoadingText = styled.p`
  font-size: 16px;
  color: ${(props) => props.theme.colors.textSecondary};
`;

const TopHintButton = styled.button`
  position: fixed;
  top: 15px;
  right: 20px;
  z-index: 100;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  padding: 10px 20px;
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.theme.colors.hoverBackground};
  }

  @media (max-width: 1024px) {
    top: 12px;
    right: 16px;
    padding: 6px 12px;
    font-size: 13px;
  }
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
  margin: 0 0 12px 0;
  max-width: 700px;
`;

const QuestionSection = styled.div`
  margin-bottom: 24px;
  text-align: center;
  width: 100%;
  max-width: 700px;

  @media (max-width: 1024px) {
    margin-bottom: 20px;
  }
`;

const QuestionTextKatex = styled.div`
  font-size: 26px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
  margin: 0;

  @media (min-width: 768px) {
    font-size: 30px;
  }

  @media (max-width: 1024px) {
    font-size: 24px;
  }
`;

const WordProblemText = styled.div`
  font-size: 20px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.6;
  margin: 0;
  max-width: 100%;
  word-wrap: break-word;
  white-space: normal;

  @media (min-width: 768px) {
    font-size: 22px;
  }

  @media (max-width: 1024px) {
    font-size: 18px;
  }
`;

const Keyword = styled.span`
  background-color: ${props => props.color}20;
  color: ${props => props.color};
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 700;
`;

const HelperSection = styled.div`
  width: 100%;
  max-width: 650px;
  margin-bottom: 20px;
`;

const HelperCard = styled.div`
  background-color: ${props => props.theme.colors.info}15;
  border-left: 4px solid ${props => props.theme.colors.info};
  border-radius: 8px;
  padding: 14px 18px;
`;

const HelperTitle = styled.h4`
  margin: 0 0 6px 0;
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.info};
`;

const HelperText = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${props => props.theme.colors.textPrimary};
  line-height: 1.5;
`;

const HintBox = styled.div`
  width: 100%;
  background-color: ${props => props.theme.colors.warning}18;
  border-left: 4px solid ${props => props.theme.colors.warning};
  padding: 16px;
  border-radius: 8px;
  font-size: 15px;
  color: ${props => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 12px;
    font-size: 14px;
  }
`;

const ExplanationSection = styled.div`
  width: 100%;
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 12px;
  padding: 24px;

  @media (max-width: 1024px) {
    padding: 20px;
  }
`;

const ExplanationTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 18px;
  color: ${props => props.theme.colors.buttonSuccess};
  font-weight: 700;

  @media (max-width: 1024px) {
    font-size: 16px;
  }
`;

const ExplanationText = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 12px 0;
  text-align: center;
  white-space: pre-line;

  @media (max-width: 1024px) {
    font-size: 15px;
  }
`;

const VerificationText = styled.p`
  font-size: 15px;
  line-height: 1.6;
  color: ${props => props.theme.colors.info};
  margin: 0 0 20px 0;
  text-align: center;
  font-style: italic;

  @media (max-width: 1024px) {
    font-size: 14px;
    margin-bottom: 16px;
  }
`;

const TryAnotherButton = styled.button`
  background: ${props => props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;

  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
  }

  @media (max-width: 1024px) {
    padding: 10px 20px;
    font-size: 15px;
  }
`;

// ==================== OPERATION SELECTOR STYLED COMPONENTS ====================

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

const OperationSelectorContainer = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const SelectorPrompt = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.theme.colors.textPrimary};
  text-align: center;
  margin: 0 0 20px 0;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ButtonGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  width: 100%;

  @media (min-width: 600px) {
    grid-template-columns: repeat(4, 1fr);
  }

  @media (max-width: 768px) {
    gap: 10px;
  }
`;

const OperationButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: ${props => props.small ? '12px' : '16px'};
  background: ${props => {
    if (props.correct) return props.theme.colors.buttonSuccess;
    if (props.incorrect) return props.theme.colors.error;
    if (props.selected) return props.theme.colors.info;
    return props.theme.colors.inputBackground;
  }};
  color: ${props => (props.selected || props.correct || props.incorrect)
    ? props.theme.colors.textInverted
    : props.theme.colors.textPrimary};
  border: 2px solid ${props => {
    if (props.correct) return props.theme.colors.buttonSuccess;
    if (props.incorrect) return props.theme.colors.error;
    if (props.selected) return props.theme.colors.info;
    return props.theme.colors.border;
  }};
  border-radius: 12px;
  font-size: ${props => props.small ? '14px' : '16px'};
  font-weight: 600;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.2s;
  opacity: ${props => props.disabled ? 0.5 : 1};
  min-height: ${props => props.small ? '70px' : '80px'};

  &:hover {
    ${props => !props.disabled && !props.selected && `
      background: ${props.theme.colors.hoverBackground};
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    `}
  }

  &:active {
    transform: ${props => !props.disabled && 'translateY(0)'};
  }

  @media (max-width: 768px) {
    padding: ${props => props.small ? '10px' : '14px'};
    min-height: ${props => props.small ? '65px' : '75px'};
  }
`;

const OperationSymbol = styled.div`
  font-size: ${props => props.small ? '24px' : '32px'};
  font-weight: 700;

  @media (max-width: 768px) {
    font-size: ${props => props.small ? '20px' : '28px'};
  }
`;

const OperationLabel = styled.div`
  font-size: ${props => props.small ? '12px' : '14px'};
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: ${props => props.small ? '11px' : '13px'};
  }
`;

const SuccessMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${props => props.theme.colors.buttonSuccess};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
  }
`;

const ErrorMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${props => props.theme.colors.error}18;
  border: 2px solid ${props => props.theme.colors.error};
  border-radius: 8px;
  color: ${props => props.theme.colors.error};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
  }
`;

// ==================== TWO-STEP SEQUENTIAL STYLED COMPONENTS ====================

const SequentialContainer = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const StepSection = styled.div`
  margin-bottom: 24px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
  }
`;

const StepLabel = styled.h4`
  font-size: 16px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 8px 0;

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const StepPrompt = styled.p`
  font-size: 15px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const AllStepsSuccessMessage = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${props => props.theme.colors.buttonSuccess};
  font-size: 16px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 12px;
  }
`;

// ==================== TOKEN DISPLAY STYLED COMPONENTS ====================

const TokenContainer = styled.div`
  width: 100%;
  max-width: 700px;
  background: ${props => props.theme.colors.cardBackground};
  border-radius: 16px;
  padding: 24px;
  margin: 20px 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 18px;
  }
`;

const TokenEquation = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
`;

const TokensRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  min-width: 200px;
  justify-content: flex-end;

  &:last-child {
    justify-content: flex-start;
  }
`;

const RowsContainer = styled.div`
  transition: transform 0.6s ease-out;
  transform: ${props => props.calculatePressed ? 'translateY(-40px)' : 'translateY(0)'};
`;

const BothSidesRow = styled.div`
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

const ResultRow = styled(BothSidesRow)`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.colors.border};
  animation: ${fadeIn} 0.4s ease-out;
`;

const Token = styled.div`
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  background: ${props => {
    if (props.type === 'variable') return props.theme.colors.info;
    if (props.type === 'operator') return props.theme.colors.textSecondary;
    return props.theme.colors.warning;
  }};
  color: ${props => props.type === 'operator' ? props.theme.colors.textPrimary : props.theme.colors.textInverted};
  border: 2px solid ${props => {
    if (props.type === 'variable') return props.theme.colors.info;
    if (props.type === 'operator') return props.theme.colors.border;
    return props.theme.colors.warning;
  }};

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 6px 10px;
  }
`;

const DraggableToken = styled(Token)`
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: all 0.2s ease;
  user-select: none;
  touch-action: none;
  text-decoration: ${props => props.strikethrough ? 'line-through' : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    cursor: grabbing;
  }
`;

const DropZone = styled(Token)`
  border: ${props => props.isDistributed
    ? `2px solid ${props.theme.colors.buttonSuccess}`
    : `2px dashed ${props.theme.colors.textSecondary}50`};
  background: ${props => props.isDistributed
    ? `${props.theme.colors.buttonSuccess}18`
    : 'transparent'};
  min-width: 60px;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.isDistributed
      ? props.theme.colors.buttonSuccess
      : props.theme.colors.primary};
  }
`;

const DistributionCoefficient = styled(Token)`
  background: ${props => props.isUsedOnce
    ? props.theme.colors.error
    : props.theme.colors.buttonSuccess};
  border: 2px solid ${props => props.isUsedOnce
    ? props.theme.colors.error
    : props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
  cursor: ${props => props.isDragging ? 'grabbing' : 'grab'};
  opacity: ${props => props.isDragging ? 0.5 : 1};
  transition: all 0.3s ease;
  user-select: none;
  touch-action: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    cursor: grabbing;
  }
`;

const DistributionInsideTerm = styled(Token)`
  background: ${props => {
    if (props.isDistributed) return `${props.theme.colors.buttonSuccess}18`;
    return props.theme.colors.warning;
  }};
  border: 2px solid ${props => {
    if (props.isDistributed) return props.theme.colors.buttonSuccess;
    return props.theme.colors.warning;
  }};
  color: ${props => props.isDistributed
    ? props.theme.colors.textPrimary
    : props.theme.colors.textInverted};
  cursor: ${props => props.isDistributed ? 'default' : 'grab'};
  transition: all 0.3s ease;
  user-select: none;
  min-width: 60px;

  &:hover {
    ${props => !props.isDistributed && `
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    `}
  }
`;

const TileColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
`;

const DropZoneBelow = styled.div`
  min-height: 50px;
  min-width: 80px;
  border: ${props => props.hasPlaced
    ? `2px solid ${props.theme.colors.buttonSuccess}`
    : `2px dashed ${props.theme.colors.textSecondary}40`};
  border-radius: 8px;
  background: ${props => props.hasPlaced
    ? `${props.theme.colors.buttonSuccess}10`
    : 'transparent'};
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    border-color: ${props => props.hasPlaced
      ? props.theme.colors.buttonSuccess
      : props.theme.colors.primary};
    background: ${props => props.hasPlaced
      ? `${props.theme.colors.buttonSuccess}18`
      : `${props.theme.colors.primary}08`};
  }
`;

const PlacedTile = styled(Token)`
  animation: ${fadeIn} 0.3s ease-out;
  background: ${props => props.isNegative
    ? props.theme.colors.error
    : props.theme.colors.buttonSuccess};
  border: 2px solid ${props => props.isNegative
    ? props.theme.colors.error
    : props.theme.colors.buttonSuccess};
  color: ${props => props.theme.colors.textInverted};
`;

const ClickablePlacedTile = styled(PlacedTile)`
  cursor: ${props => props.draggable ? 'grab' : 'pointer'};
  transition: all 0.2s ease;
  user-select: none;
  text-decoration: ${props => props.strikethrough ? 'line-through' : 'none'};

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: scale(0.98);
  }
`;

const DraggablePlacedTile = styled(PlacedTile)`
  cursor: grab;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }

  &:active {
    cursor: grabbing;
    opacity: 0.7;
  }
`;

const shake = keyframes`
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
  20%, 40%, 60%, 80% { transform: translateX(5px); }
`;

const CalculateButtonContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const CalculateButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textInverted};
  background: ${props => {
    if (props.showError) return props.theme.colors.error;
    if (props.disabled) return props.theme.colors.textSecondary;
    return props.theme.colors.primary;
  }};
  border: none;
  border-radius: 8px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: background 0.2s ease;
  animation: ${props => props.showError ? shake : 'none'} 0.5s;

  &:hover {
    ${props => !props.disabled && !props.showError && `
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    `}
  }

  &:active {
    ${props => !props.disabled && !props.showError && `
      transform: translateY(0);
    `}
  }
`;

const GroupingSuccess = styled.div`
  margin-top: 16px;
  padding: 12px;
  background: ${props => props.theme.colors.buttonSuccess}18;
  border: 2px solid ${props => props.theme.colors.buttonSuccess};
  border-radius: 8px;
  color: ${props => props.theme.colors.buttonSuccess};
  font-size: 15px;
  font-weight: 600;
  text-align: center;
  animation: ${fadeIn} 0.4s ease-out;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 10px;
  }
`;

const CombineButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  animation: ${fadeIn} 0.4s ease-out;
`;

const CombineButton = styled.button`
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.theme.colors.textInverted};
  background: ${props => props.theme.colors.primary};
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 10px 24px;
    font-size: 15px;
  }
`;

const CombinedRow = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 2px solid ${props => props.theme.colors.border};
  animation: ${fadeIn} 0.4s ease-out;
  display: flex;
  justify-content: center;
`;

const EqualsSign = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const StepsDisplay = styled.div`
  background: ${props => props.theme.colors.inputBackground};
  border-radius: 8px;
  padding: 16px;
`;

const StepsTitle = styled.h4`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.textPrimary};
  margin: 0 0 12px 0;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const StepItem = styled.p`
  font-size: 14px;
  color: ${props => props.theme.colors.textSecondary};
  margin: 0 0 8px 0;
  line-height: 1.5;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;
