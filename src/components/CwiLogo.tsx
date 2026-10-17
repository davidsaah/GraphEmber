import React from 'react';

interface CwiLogoProps {
  variant?: 'mark' | 'horizontal' | 'badge';
  size?: number;
  className?: string;
  glow?: boolean;
}

export const CwiLogo: React.FC<CwiLogoProps> = ({
  variant = 'mark',
  size = 36,
  className = '',
  glow = true,
}) => {
  const mark = (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      {glow && (
        <div
          style={{
            position: 'absolute',
            inset: -4,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(246, 186, 19, 0.4) 0%, rgba(235, 124, 38, 0.25) 50%, transparent 70%)',
            filter: 'blur(8px)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
      )}
      <img
        src={`${import.meta.env.BASE_URL}cwi-logo.png`}
        alt="Climate & Wildfire Institute"
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          objectFit: 'contain',
          position: 'relative',
          zIndex: 1,
          filter: glow
            ? 'drop-shadow(0 2px 8px rgba(249, 115, 22, 0.45))'
            : 'none',
          transition: 'transform 0.25s ease, filter 0.25s ease',
        }}
        onError={(e) => {
          // Fallback SVG if image not yet loaded
          (e.currentTarget as HTMLElement).style.display = 'none';
        }}
      />
    </div>
  );

  if (variant === 'mark') {
    return mark;
  }

  if (variant === 'horizontal') {
    return (
      <div
        className={className}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        {mark}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span
            style={{
              fontFamily: 'var(--font-brand, "Poppins", sans-serif)',
              fontSize: `${Math.max(11, size * 0.38)}px`,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: '#ffffff',
              lineHeight: 1.1,
            }}
          >
            Climate & Wildfire
          </span>
          <span
            style={{
              fontFamily: 'var(--font-brand, "Poppins", sans-serif)',
              fontSize: `${Math.max(9, size * 0.32)}px`,
              fontWeight: 500,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#f6ba13',
              lineHeight: 1.2,
            }}
          >
            Institute
          </span>
        </div>
      </div>
    );
  }

  // 'badge' variant
  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '4px 10px',
        borderRadius: 'var(--radius-full)',
        background: 'rgba(235, 124, 38, 0.12)',
        border: '1px solid rgba(246, 186, 19, 0.35)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {mark}
      <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
        <span
          style={{
            fontFamily: 'var(--font-brand, "Poppins", sans-serif)',
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: '#f8fafc',
          }}
        >
          Climate & Wildfire Institute
        </span>
        <span style={{ fontSize: '0.6rem', color: '#f6ba13' }}>
          Boundary Innovation Tool
        </span>
      </div>
    </div>
  );
};
