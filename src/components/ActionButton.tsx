import type { ButtonHTMLAttributes, ReactNode } from 'react';

type ActionButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  icon?: ReactNode;
};

export default function ActionButton({ icon, children, className = '', ...props }: ActionButtonProps) {
  return (
    <button className={`action-button ${className}`.trim()} type="button" {...props}>
      {icon ? <span className="action-icon" aria-hidden="true">{icon}</span> : null}
      <span>{children}</span>
    </button>
  );
}
