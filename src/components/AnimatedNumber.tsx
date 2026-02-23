// src/components/AnimatedNumber.tsx
import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface Props {
    value: number;
    className?: string;
    prefix?: string;
    suffix?: string;
}

export function AnimatedNumber({ value, className = "", prefix = "", suffix = "" }: Props) {
    const [displayValue, setDisplayValue] = useState(value);

    // Framer motion spring for smooth lerping
    const spring = useSpring(value, {
        stiffness: 100,
        damping: 20,
        mass: 1
    });

    // Format the rounded number output
    const rounded = useTransform(spring, (latest) => Math.round(latest));

    useEffect(() => {
        spring.set(value);
    }, [value, spring]);

    useEffect(() => {
        const unsubscribe = rounded.on("change", (latest) => {
            setDisplayValue(latest);
        });
        return () => unsubscribe();
    }, [rounded]);

    return (
        <motion.span className={className}>
            {prefix}{displayValue}{suffix}
        </motion.span>
    );
}
