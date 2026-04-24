import React from 'react';

export const roleOptions = [
  {
    id: "employer",
    label: "Recruiter",
    hint: "Post jobs, track candidates and manage your pipeline.",
  },
  {
    id: "jobseeker",
    label: "Candidate",
    hint: "Create your profile, apply quickly and track your opportunities.",
  },
] as const;

type RoleType = typeof roleOptions[number]['id'];

interface RoleSelectorProps {
  activeRole: RoleType;
  onChange: (role: RoleType) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ activeRole, onChange }) => {
  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-text-soft">I'm signing up as a...</span>
      <div className="grid gap-3 sm:grid-cols-2">
        {roleOptions.map((role) => (
          <button
            key={role.id}
            type="button"
            onClick={() => onChange(role.id)}
            className={`rounded-field border px-4 py-3.5 text-left transition-all duration-300 ease-auth ${
              activeRole === role.id
                ? "border-primary/30 bg-primary-soft shadow-float"
                : "border-outline-soft bg-surface-soft hover:border-primary/20 hover:bg-surface-strong"
            }`}
          >
            <span className="block text-sm font-semibold text-on-surface">{role.label}</span>
            <span className="mt-1 block text-xs leading-5 text-text-soft">{role.hint}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export const OTPInput: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const handleChange = (index: number, val: string) => {
    const newValue = value.split('');
    newValue[index] = val.slice(-1);
    onChange(newValue.join(''));
    
    // Auto focus next input
    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !value[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium text-text-soft">Verification Code</span>
      <div className="grid grid-cols-6 gap-2.5">
        {Array.from({ length: 6 }).map((_, index) => (
          <input
            key={index}
            id={`otp-${index}`}
            type="text"
            maxLength={1}
            inputMode="numeric"
            value={value[index] || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="h-12 w-full appearance-none rounded-field border border-outline-soft bg-surface-soft text-center text-lg font-semibold text-on-surface caret-primary outline-none transition-all duration-300 ease-auth focus:border-primary/30 focus:bg-surface-strong"
          />
        ))}
      </div>
    </div>
  );
};
