// src/components/AlienSprites.tsx

import React from 'react';

interface SpriteProps extends React.SVGProps<SVGSVGElement> {
    category: 'Promoter' | 'Passive' | 'Detractor';
}

function getFillColor(category: 'Promoter' | 'Passive' | 'Detractor') {
    if (category === 'Promoter') return '#33ff33';
    if (category === 'Passive') return '#ffb000';
    return '#ef4444';
}

export function GlipGlopSprite({ category, className = "", ...props }: SpriteProps) {
    const fill = getFillColor(category);
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width="32" height="32" {...props}>
            {/* Gelatinous blob base, undulating bottom */}
            <path d="M16 4C9 4 4 10 4 18C4 22 5.5 24 7 26C8 27.5 10 28 12 26C14 24 16 26 18 27.5C20 29 22 28 24 26C26 24 28 22 28 18C28 10 23 4 16 4Z" fill={fill} fillOpacity="0.2" stroke={fill} strokeWidth="2" strokeLinejoin="round" />
            {/* One large central eye */}
            <circle cx="16" cy="14" r="5" fill="#111" stroke={fill} strokeWidth="1.5" />
            <circle cx="16" cy="14" r="1.5" fill={fill} className="animate-pulse" />
            {/* Oozing droplets */}
            {category === 'Detractor' && (
                <>
                    <path d="M10 26 Q12 32 10 32" stroke={fill} strokeWidth="2" strokeLinecap="round" className="animate-bounce" />
                    <path d="M22 26 Q24 30 22 30" stroke={fill} strokeWidth="2" strokeLinecap="round" style={{ animationDelay: '0.2s' }} className="animate-bounce" />
                </>
            )}
            {/* Happy curves */}
            {category === 'Promoter' && (
                <path d="M12 21 Q16 24 20 21" stroke={fill} strokeWidth="2" strokeLinecap="round" />
            )}
        </svg>
    );
}

export function BorgishSprite({ category, className = "", ...props }: SpriteProps) {
    const fill = getFillColor(category);
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width="32" height="32" {...props}>
            {/* Angular metallic head */}
            <path d="M8 8 L24 8 L26 18 L20 28 L12 28 L6 18 Z" fill="#111" stroke={fill} strokeWidth="2" strokeLinejoin="miter" />
            {/* Cybernetic grid lines */}
            <path d="M8 12 L24 12 M6 16 L26 16" stroke={fill} strokeWidth="0.5" strokeOpacity="0.5" />
            {/* Asymmetrical visual sensors */}
            <rect x="10" y="14" width="6" height="4" fill={fill} className="animate-pulse" />
            <circle cx="22" cy="16" r="2" fill={category === 'Detractor' ? '#ef4444' : fill} />
            {/* Antenna */}
            <path d="M16 8 L16 2 M14 2 L18 2" stroke={fill} strokeWidth="1.5" strokeLinecap="round" />
        </svg>
    );
}

export function NebulaWhaleSprite({ category, className = "", ...props }: SpriteProps) {
    const fill = getFillColor(category);
    return (
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} width="32" height="32" {...props}>
            {/* Cosmic whale body */}
            <path d="M4 16 C4 6, 20 4, 28 8 C30 10, 31 14, 28 18 C24 24, 12 28, 4 24 Z" fill="url(#whaleGrad)" stroke={fill} strokeWidth="1.5" strokeLinejoin="round" />
            {/* Star speckles inside body */}
            <circle cx="10" cy="12" r="0.5" fill="#fff" opacity="0.6" />
            <circle cx="18" cy="10" r="1" fill="#fff" opacity="0.8" className="animate-pulse" />
            <circle cx="14" cy="18" r="0.5" fill="#fff" opacity="0.4" />
            <circle cx="24" cy="14" r="1" fill="#fff" opacity="0.7" />
            {/* Tail */}
            <path d="M4 16 C2 14, 2 12, 0 10 C0 10, 2 20, 6 24" stroke={fill} strokeWidth="1.5" fill="none" />
            {/* Defs for gradient body */}
            <defs>
                <radialGradient id="whaleGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor={fill} stopOpacity="0.1" />
                    <stop offset="100%" stopColor="#111" stopOpacity="0.8" />
                </radialGradient>
            </defs>
        </svg>
    );
}
