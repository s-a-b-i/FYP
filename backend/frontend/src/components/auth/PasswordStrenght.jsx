import { Check, X } from "lucide-react";
import React from "react";

const PasswordStrength = ({ password }) => {
  const getStrength = (pass) => {
    let strength = 0;
    if (pass.length >= 6) strength += 1;
    if (pass.match(/[A-Z]/) && pass.match(/[a-z]/)) strength += 1;
    if (pass.match(/[0-9]/)) strength += 1;
    if (pass.match(/[^A-Za-z0-9]/)) strength += 1;
    return strength;
  };

  const strength = getStrength(password);

  const getStrengthText = () => {
    if (strength === 0) return "Very Weak";
    if (strength === 1) return "Weak";
    if (strength === 2) return "Fair";
    if (strength === 3) return "Good";
    return "Strong";
  };

  const getColor = (strength) => {
    if (strength === 0) return "bg-destructive";
    if (strength === 1) return "bg-status-warning-text";
    if (strength === 2) return "bg-status-info-text";
    if (strength === 3) return "bg-primary-main";
    return "bg-primary-main";
  };

  return (
    <div className="mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-muted-foreground">Password Strength</span>
        <span className="text-sm text-muted-foreground ml-1">{getStrengthText()}</span>
      </div>
      <div className="flex space-x-1">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className={`h-1 w-1/4 rounded-full transition-colors duration-300
            ${i < strength ? getColor(strength) : "bg-muted"}
            `}
          />
        ))}
      </div>
      <PasswordCriteria password={password} />
    </div>
  );
};

const PasswordCriteria = ({ password }) => {
  const criteria = [
    { label: "At least 6 characters", met: password.length >= 6 },
    { label: "At least 1 uppercase letter", met: /[A-Z]/.test(password) },
    { label: "At least 1 lowercase letter", met: /[a-z]/.test(password) },
    { label: "At least 1 number", met: /[0-9]/.test(password) },
    { label: "At least 1 special character", met: /[^A-Za-z0-9]/.test(password) },
  ];

  return (
    <div className="mt-2 space-y-1">
      {criteria.map((c, i) => (
        <div key={i} className="flex items-center text-sm">
          {c.met ? (
            <Check className="size-5 text-primary-main mr-2" />
          ) : (
            <X className="size-5 text-destructive mr-2" />
          )}
          <span className={c.met ? "text-primary-main" : "text-destructive"}>
            {c.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default PasswordStrength;