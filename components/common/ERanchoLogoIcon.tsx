import React from 'react';

export const ERanchoLogoIcon = ({ className = "" }) => (
    <svg className={className} viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="e-Rancho Logo">
        {/* House Outline, using a path with a stroke */}
        <path
            d="M21,85 L36,40 L50,26 L64,40 L79,85 L50,65 Z"
            stroke="currentColor"
            fill="none"
            strokeWidth="8"
            strokeLinejoin="round"
            strokeLinecap="round"
        />

        {/* Utensils, as filled paths, placed in the center */}
        <g transform="translate(50, 58) scale(1.2)">
            {/* Knife, drawn first to be underneath the fork, rotated right */}
            <path
                transform="rotate(30)"
                d="M-4,22 L-4,-18 C-4,-35 12,-38 5,-20 L5,22 Z"
                fill="currentColor"
            />
            {/* Fork, rotated left */}
            <path
                transform="rotate(-30)"
                d="M-8,22 L-8,0 L-12,0 L-12,-25 L-9,-25 L-9,0 L-5,0 L-5,-25 L-2,-25 L-2,0 L2,0 L2,-25 L5,-25 L5,0 L9,0 L9,-25 L12,-25 L12,0 L8,0 L8,22 Z"
                fill="currentColor"
            />
        </g>
    </svg>
);