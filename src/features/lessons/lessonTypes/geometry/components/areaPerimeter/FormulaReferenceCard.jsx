import React, { useState } from 'react';
import styled from 'styled-components';

/**
 * FormulaReferenceCard Component
 * Toggleable reference card showing area formulas for different shapes
 * Used in Level 7 (Mixed Shapes)
 */
function FormulaReferenceCard({ theme }) {
  const [isOpen, setIsOpen] = useState(false);

  const formulas = [
    { shape: 'Rectangle', formula: 'A = length × width', katex: 'A = l \\times w' },
    { shape: 'Triangle', formula: 'A = ½ × base × height', katex: 'A = \\frac{1}{2} \\times b \\times h' },
    { shape: 'Parallelogram', formula: 'A = base × height', katex: 'A = b \\times h', note: '(perpendicular height!)' },
    { shape: 'Trapezoid', formula: 'A = ½ × (base₁ + base₂) × height', katex: 'A = \\frac{1}{2}(b_1 + b_2) \\times h' },
  ];

  return (
    <Container>
      <ToggleButton onClick={() => setIsOpen(!isOpen)} $isOpen={isOpen}>
        {isOpen ? '✕ Hide' : '📐 Show'} Formula Reference
      </ToggleButton>

      {isOpen && (
        <Card>
          <CardTitle>Area Formulas</CardTitle>
          <FormulaList>
            {formulas.map((item, idx) => (
              <FormulaItem key={idx}>
                <ShapeName>{item.shape}:</ShapeName>
                <Formula>
                  {item.formula}
                  {item.note && <Note>{item.note}</Note>}
                </Formula>
              </FormulaItem>
            ))}
          </FormulaList>
        </Card>
      )}
    </Container>
  );
}

const Container = styled.div`
  position: relative;
  margin: 16px 0;
`;

const ToggleButton = styled.button`
  padding: 10px 20px;
  background-color: ${props => props.$isOpen
    ? props.theme.colors.buttonSuccess || '#4ade80'
    : props.theme.colors.cardBackground
  };
  color: ${props => props.$isOpen
    ? props.theme.colors.textInverted || '#FFFFFF'
    : props.theme.colors.textPrimary
  };
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }

  @media (max-width: 1024px) {
    padding: 8px 16px;
    font-size: 14px;
  }
`;

const Card = styled.div`
  margin-top: 12px;
  padding: 20px;
  background-color: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  @media (max-width: 1024px) {
    padding: 16px;
    margin-top: 8px;
  }
`;

const CardTitle = styled.h4`
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 16px;
  color: ${props => props.theme.colors.textPrimary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  padding-bottom: 8px;

  @media (max-width: 1024px) {
    font-size: 16px;
    margin-bottom: 12px;
  }
`;

const FormulaList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (max-width: 1024px) {
    gap: 8px;
  }
`;

const FormulaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const ShapeName = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${props => props.theme.colors.info || '#3B82F6'};

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const Formula = styled.span`
  font-size: 15px;
  font-family: 'Courier New', monospace;
  color: ${props => props.theme.colors.textPrimary};
  padding-left: 8px;

  @media (max-width: 1024px) {
    font-size: 14px;
  }
`;

const Note = styled.span`
  font-size: 13px;
  font-style: italic;
  color: ${props => props.theme.colors.textSecondary};
  margin-left: 8px;

  @media (max-width: 1024px) {
    font-size: 12px;
  }
`;

export default FormulaReferenceCard;
