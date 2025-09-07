// components/QuickActionCard.tsx
import Link from "next/link";
import { ReactNode } from "react";

// Predefined color themes for consistency
export const cardThemes = {
    blue: {
        border: "border-blue-300 hover:border-blue-500",
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600"
    },
    green: {
        border: "border-green-300 hover:border-green-500",
        iconBg: "bg-green-100",
        iconColor: "text-green-600"
    },
    purple: {
        border: "border-purple-300 hover:border-purple-500",
        iconBg: "bg-purple-100",
        iconColor: "text-purple-600"
    },
    red: {
        border: "border-red-300 hover:border-red-500",
        iconBg: "bg-red-100",
        iconColor: "text-red-600"
    },
    yellow: {
        border: "border-yellow-300 hover:border-yellow-500",
        iconBg: "bg-yellow-100",
        iconColor: "text-yellow-600"
    },
    indigo: {
        border: "border-indigo-300 hover:border-indigo-500",
        iconBg: "bg-indigo-100",
        iconColor: "text-indigo-600"
    }
} as const;

// Common SVG icons
export const cardIcons = {
    plus: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
        />
    ),
    music: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
        />
    ),
    library: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
        />
    ),
    folder: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
        />
    ),
    settings: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
    ),
    edit: (
        <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
        />
    )
} as const;

type CardProps = {
    link: string;
    title: string;
    description: string;
    theme: keyof typeof cardThemes;
    icon: keyof typeof cardIcons | ReactNode;
    className?: string;
};

export default function QuickActionCards({
    link,
    title,
    description,
    theme,
    icon,
    className = ""
}: CardProps) {
    const themeStyles = cardThemes[theme];
    // Type guard to check if icon is a valid key
    const isValidIconKey = (icon: any): icon is keyof typeof cardIcons => {
        return typeof icon === 'string' && icon in cardIcons;
    };

    const iconElement = isValidIconKey(icon) ? cardIcons[icon] : icon;


    return (
        <Link href={link}>
            <div className={`bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border-2 border-dashed ${themeStyles.border} ${className}`}>
                <div className={`flex items-center justify-center w-12 h-12 ${themeStyles.iconBg} rounded-lg mb-4`}>
                    <svg
                        className={`w-6 h-6 ${themeStyles.iconColor}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        {iconElement}
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {title}
                </h3>
                <p className="text-sm text-gray-500">
                    {description}
                </p>
            </div>
        </Link>
    );
}