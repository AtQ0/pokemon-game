interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    isActive?: boolean;
    className?: string;
    useIsActiveStyle?: boolean; // new prop to toggle isActive styling
}

export default function Button({
    label,
    onClick,
    disabled = false,
    isActive = false,
    className = '',
    useIsActiveStyle = true,
}: ButtonProps) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${className} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'} transition-colors px-4 py-2 font-semibold rounded
                ${useIsActiveStyle
                    ? isActive
                        ? 'bg-red-600 text-white'
                        : 'bg-white text-red-600 hover:bg-red-100'
                    : ''
                }
            `}
        >
            {label}
        </button>
    );
}
