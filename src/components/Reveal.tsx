import React, { useEffect, useRef, useState } from 'react';

type RevealProps = {
  children: React.ReactNode;
  className?: string;

  /** default: 0.15 */
  threshold?: number;

  /** default: "0px 0px -10% 0px" (reveals slightly before fully in view) */
  rootMargin?: string;

  /** default: true (animates only once) */
  once?: boolean;

  /** default: 0 (ms) */
  delayMs?: number;
};

export const Reveal: React.FC<RevealProps> = ({
  children,
  className = '',
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
  delayMs = 0
}) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={[
        'transition-all duration-700 ease-out will-change-transform',
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6',
        className
      ].join(' ')}
    >
      {children}
    </div>
  );
};
