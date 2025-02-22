// src/components/Heading.jsx
import React from 'react';
import cn from 'classnames';

const Heading = ({
  level = 1,
  children,
  className,
  withBorder = false,
  ...props
}) => {
  const baseStyles = "font-bold text-foreground";
  
  const styles = {
    1: "text-4xl md:text-5xl lg:text-6xl",
    2: "text-3xl md:text-4xl",
    3: "text-2xl md:text-3xl",
    4: "text-xl md:text-2xl",
    5: "text-lg md:text-xl",
    6: "text-base md:text-lg",
  };

  const borderStyles = withBorder ? "border-b border-border pb-4" : "";
  
  const Tag = `h${level}`;

  return React.createElement(
    Tag,
    {
      className: cn(baseStyles, styles[level], borderStyles, className),
      ...props
    },
    children
  );
};

export const H1 = (props) => <Heading level={1} {...props} />;
export const H2 = (props) => <Heading level={2} {...props} />;
export const H3 = (props) => <Heading level={3} {...props} />;
export const H4 = (props) => <Heading level={4} {...props} />;
export const H5 = (props) => <Heading level={5} {...props} />;
export const H6 = (props) => <Heading level={6} {...props} />;

export default Heading;