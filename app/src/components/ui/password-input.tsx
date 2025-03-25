// src/components/ui/password-input.tsx
"use client";

import { useState } from "react";
import { Input } from "./input";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  showStrengthIndicator?: boolean;
}

export function PasswordInput({ 
  showStrengthIndicator = false,
  className,
  ...props 
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState<PasswordStrength>({
    score: 0,
    label: "",
    color: "bg-gray-200"
  });

  const checkPasswordStrength = (password: string) => {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    const strengths: PasswordStrength[] = [
      { score: 0, label: "Very Weak", color: "bg-red-500" },
      { score: 2, label: "Weak", color: "bg-orange-500" },
      { score: 3, label: "Medium", color: "bg-yellow-500" },
      { score: 4, label: "Strong", color: "bg-green-500" },
      { score: 5, label: "Very Strong", color: "bg-green-600" }
    ];

    setStrength(strengths[score] || strengths[0]);
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Input
          type={showPassword ? "text" : "password"}
          className={cn("pr-10", className)}
          onChange={(e) => {
            if (showStrengthIndicator) {
              checkPasswordStrength(e.target.value);
            }
            props.onChange?.(e);
          }}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
      {showStrengthIndicator && strength.label && (
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 bg-gray-200 rounded-full">
              <div
                className={cn("h-full rounded-full transition-all", strength.color)}
                style={{ width: `${(strength.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-sm text-gray-500">{strength.label}</span>
          </div>
        </div>
      )}
    </div>
  );
}