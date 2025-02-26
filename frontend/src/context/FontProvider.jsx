// src/components/FontProvider.jsx
import React from 'react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const FontProvider = ({ children }) => {
  return <>{children}</>;
};

export default FontProvider;