import React from "react";
import cn from "classnames";

const Heading = ({ 
  level = 1, 
  children, 
  className, 
  withBorder = false,
  ...props 
}) => {
  const baseStyles = "font-bold text-gray-900";
  
  const styles = {
    1: "text-3xl",
    2: "text-xl",
    3: "text-lg",
  };

  const borderStyles = withBorder ? "border-b border-gray-200 pb-6" : "";
  
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

export default Heading;