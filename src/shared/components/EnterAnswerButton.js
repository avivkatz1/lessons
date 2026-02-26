import React from "react";
import styled, { css } from "styled-components";

/**
 * EnterAnswerButton - CTA to trigger input overlay panel
 *
 * Features:
 * - Two variants: "floating" (default, centered on canvas) and "static" (below canvas)
 * - Desktop/Tablet: Variant-dependent behavior
 * - Mobile: Always static (inline)
 * - 56px minimum height (exceeds WCAG 2.1 44px minimum)
 * - Smooth hover animations
 * - Dark mode support
 *
 * Usage:
 *   <EnterAnswerButton onClick={() => setPanelOpen(true)} variant="static" />
 */
const EnterAnswerButton = ({ onClick, disabled = false, variant = "floating" }) => {
  return (
    <CTAButton onClick={onClick} disabled={disabled} $variant={variant}>
      <ButtonText>Enter Answer</ButtonText>
    </CTAButton>
  );
};

export default EnterAnswerButton;

// ==================== STYLED COMPONENTS ====================

const CTAButton = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;

  padding: 16px 32px;
  min-height: 56px;
  max-width: 400px;

  background: ${(props) => props.theme.colors.cardBackground};
  color: ${(props) => props.theme.colors.textPrimary};
  border: 2px solid ${(props) => props.theme.colors.info || "#3B82F6"};
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);

  cursor: pointer;
  transition: all 0.2s ease-in-out;

  /* Floating variant (default - backward compatible) */
  ${props => props.$variant === "floating" && css`
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 100;

    &:hover:not(:disabled) {
      transform: translate(-50%, -50%) scale(1.05);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      border-width: 3px;
    }

    &:active:not(:disabled) {
      transform: translate(-50%, -50%) scale(0.98);
    }
  `}

  /* Static variant (NEW - for Area/Perimeter lessons) */
  ${props => props.$variant === "static" && css`
    position: static;
    transform: none;
    width: 100%;
    margin: 0 auto;

    &:hover:not(:disabled) {
      transform: scale(1.03);
      box-shadow: 0 6px 16px rgba(59, 130, 246, 0.3);
      border-width: 3px;
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  `}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 1024px) {
    padding: 14px 28px;
    min-height: 52px;
  }

  /* Mobile: Always static regardless of variant */
  @media (max-width: 768px) {
    position: static;
    transform: none;
    width: 100%;
    margin: 0 auto;
    padding: 12px 24px;
    min-height: 48px;

    &:hover:not(:disabled) {
      transform: translateY(-2px);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }
`;

const ButtonText = styled.span`
  font-size: 18px;
  font-weight: 600;
  white-space: nowrap;
  text-align: center;

  @media (max-width: 1024px) {
    font-size: 16px;
  }

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;
