import React from "react";

type IconProps = {
    className?: string;
};

export const PencilIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true">
        <path d="M3 6h18" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
    </svg>
);

export const PlusIcon: React.FC<IconProps> = ({ className = "w-4 h-4" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true">
        <path d="M12 5v14" />
        <path d="M5 12h14" />
    </svg>
);

type IconButtonProps = {
    onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
    label: string;
    variant?: "default" | "danger";
    children: React.ReactNode;
};

export const IconButton: React.FC<IconButtonProps> = ({
    onClick,
    label,
    variant = "default",
    children,
}) => {
    const colorClasses =
        variant === "danger"
            ? "text-red-600 hover:bg-red-50"
            : "text-gray-700 hover:bg-gray-100";
    return (
        <button
            type="button"
            onClick={onClick}
            title={label}
            aria-label={label}
            className={`inline-flex items-center justify-center p-1.5 rounded ${colorClasses}`}>
            {children}
        </button>
    );
};
