import { createGlobalStyle } from 'styled-components';

export const GlobalStyle = createGlobalStyle`
  body, html {
    background-color: ${props => props.theme.colors.pageBackground};
    color: ${props => props.theme.colors.textPrimary};
    transition: background-color 0.3s ease, color 0.3s ease;
    margin: 0;
    padding: 0;
  }

  #root {
    background-color: ${props => props.theme.colors.pageBackground};
    min-height: 100vh;
    transition: background-color 0.3s ease;
  }
`;
