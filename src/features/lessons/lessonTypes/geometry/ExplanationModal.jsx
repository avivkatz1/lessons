import React from 'react';
import styled from 'styled-components';

function ExplanationModal({ explanation, onClose, onTryAnother }) {
  return (
    <ModalOverlay onClick={onClose || onTryAnother}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Correct! ✓</ModalTitle>
          <CloseButton onClick={onClose || onTryAnother}>&times;</CloseButton>
        </ModalHeader>
        <ModalBody>{explanation}</ModalBody>
        <ModalFooter>
          <TryAnotherButton onClick={onTryAnother}>
            Try Another Problem
          </TryAnotherButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: ${(props) => props.theme.colors.cardBackground};
  border: 3px solid ${(props) => props.theme.colors.buttonSuccess};
  border-radius: 16px;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  animation: slideUp 0.3s ease-out;

  @keyframes slideUp {
    from {
      transform: translateY(20px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px 12px;
  border-bottom: 2px solid ${(props) => props.theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: 22px;
  font-weight: 700;
  color: ${(props) => props.theme.colors.buttonSuccess};
  margin: 0;

  @media (max-width: 1024px) {
    font-size: 20px;
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 36px;
  line-height: 1;
  color: ${(props) => props.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;

  &:hover {
    color: ${(props) => props.theme.colors.textPrimary};
  }
`;

const ModalBody = styled.div`
  padding: 20px 24px;
  font-size: 16px;
  line-height: 1.6;
  color: ${(props) => props.theme.colors.textPrimary};

  @media (max-width: 1024px) {
    padding: 16px 20px;
    font-size: 15px;
  }
`;

const ModalFooter = styled.div`
  padding: 12px 24px 20px;
  display: flex;
  justify-content: center;
  border-top: 1px solid ${(props) => props.theme.colors.border};

  @media (max-width: 1024px) {
    padding: 10px 20px 16px;
  }
`;

const TryAnotherButton = styled.button`
  padding: 14px 32px;
  font-size: 17px;
  font-weight: 600;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  background-color: ${(props) => props.theme.colors.buttonSuccess};
  color: ${(props) => props.theme.colors.textInverted};
  transition: opacity 0.2s;
  min-height: 44px;

  &:hover {
    opacity: 0.9;
  }

  @media (max-width: 1024px) {
    padding: 12px 28px;
    font-size: 16px;
  }
`;

export default ExplanationModal;
