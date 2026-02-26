/**
 * Formula Helper Component
 *
 * Displays formula reference card for area and perimeter
 * Used in Levels 2-4 as a visual aid
 */

import React from 'react';
import styled from 'styled-components';

function FormulaHelper({ shapeType }) {
  const getFormulas = () => {
    switch (shapeType) {
      case 'rectangle':
        return {
          area: 'A = length × width',
          perimeter: 'P = 2(length + width)',
        };
      case 'square':
        return {
          area: 'A = side × side',
          perimeter: 'P = 4 × side',
        };
      case 'triangle':
        return {
          area: 'A = ½ × base × height',
          perimeter: 'P = side₁ + side₂ + side₃',
        };
      default:
        return {
          area: 'A = length × width',
          perimeter: 'P = 2(length + width)',
        };
    }
  };

  const formulas = getFormulas();

  return (
    <Container>
      <Title>Formula Reference</Title>
      <FormulaRow>
        <FormulaLabel>Area:</FormulaLabel>
        <Formula>{formulas.area}</Formula>
      </FormulaRow>
      <FormulaRow>
        <FormulaLabel>Perimeter:</FormulaLabel>
        <Formula>{formulas.perimeter}</Formula>
      </FormulaRow>
    </Container>
  );
}

export default FormulaHelper;

// ==================== STYLED COMPONENTS ====================

const Container = styled.div`
  width: 100%;
  max-width: 500px;
  background: ${(props) => props.theme.colors.info}15;
  border: 2px solid ${(props) => props.theme.colors.info};
  border-radius: 12px;
  padding: 16px;
  margin: 20px 0;

  @media (max-width: 1024px) {
    padding: 12px;
    margin: 16px 0;
  }
`;

const Title = styled.h4`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.info};
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 15px;
    margin-bottom: 8px;
  }
`;

const FormulaRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 1024px) {
    gap: 6px;
  }
`;

const FormulaLabel = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const Formula = styled.span`
  font-size: 15px;
  font-family: 'Courier New', monospace;
  color: ${(props) => props.theme.colors.textPrimary};
  background: ${(props) => props.theme.colors.inputBackground};
  padding: 4px 8px;
  border-radius: 4px;

  @media (max-width: 1024px) {
    font-size: 14px;
    padding: 3px 6px;
  }
`;
