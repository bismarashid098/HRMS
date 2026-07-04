import { PropsWithChildren } from 'react';
import { Box, GlobalStyles } from '@mui/material';

const keyframes = `
  @keyframes blob1 {
    0%   { transform: translate(0px,   0px)   scale(1);    }
    25%  { transform: translate(120px, -80px) scale(1.15); }
    50%  { transform: translate(-60px, 100px) scale(0.9);  }
    75%  { transform: translate(80px,  60px)  scale(1.05); }
    100% { transform: translate(0px,   0px)   scale(1);    }
  }
  @keyframes blob2 {
    0%   { transform: translate(0px,    0px)    scale(1);    }
    33%  { transform: translate(-100px, 80px)   scale(1.2);  }
    66%  { transform: translate(60px,  -120px)  scale(0.85); }
    100% { transform: translate(0px,    0px)    scale(1);    }
  }
  @keyframes blob3 {
    0%   { transform: translate(0px,  0px)   scale(1);    }
    40%  { transform: translate(80px, 120px) scale(0.9);  }
    80%  { transform: translate(-80px,-60px) scale(1.1);  }
    100% { transform: translate(0px,  0px)   scale(1);    }
  }
  @keyframes cardIn {
    from { opacity: 0; transform: translateY(40px) scale(0.97); }
    to   { opacity: 1; transform: translateY(0)    scale(1);    }
  }
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0);    }
  }
  @keyframes logoPulse {
    0%,100% { box-shadow: 0 0 0 0   rgba(99,102,241,0.5); }
    50%     { box-shadow: 0 0 0 14px rgba(99,102,241,0);   }
  }
  @keyframes shimmer {
    from { transform: translateX(-100%) skewX(-12deg); }
    to   { transform: translateX(250%)  skewX(-12deg); }
  }
  @keyframes shake {
    0%,100% { transform: translateX(0);    }
    20%     { transform: translateX(-8px); }
    40%     { transform: translateX(8px);  }
    60%     { transform: translateX(-5px); }
    80%     { transform: translateX(5px);  }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
  @keyframes gradientShift {
    0%   { background-position: 0%   50%; }
    50%  { background-position: 100% 50%; }
    100% { background-position: 0%   50%; }
  }
`;

const AuthLayout = ({ children }: PropsWithChildren) => (
  <>
    <GlobalStyles styles={keyframes} />
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#060612',
        position: 'relative',
        overflow: 'hidden',
        p: 2,
      }}
    >
      {/* Animated blobs */}
      {[
        {
          color: 'rgba(79,70,229,0.35)',
          size: 700,
          top: '-15%',
          left: '-10%',
          anim: 'blob1 18s ease-in-out infinite',
        },
        {
          color: 'rgba(124,58,237,0.28)',
          size: 600,
          top: '40%',
          right: '-12%',
          anim: 'blob2 14s ease-in-out infinite',
        },
        {
          color: 'rgba(37,99,235,0.25)',
          size: 500,
          bottom: '-20%',
          left: '30%',
          anim: 'blob3 16s ease-in-out infinite',
        },
      ].map((b, i) => (
        <Box
          key={i}
          sx={{
            position: 'absolute',
            width: b.size,
            height: b.size,
            top: b.top,
            left: b.left,
            right: b.right,
            bottom: b.bottom,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${b.color} 0%, transparent 70%)`,
            filter: 'blur(60px)',
            animation: b.anim,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Dot grid overlay */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'radial-gradient(rgba(148,163,184,0.06) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
          pointerEvents: 'none',
        }}
      />

      {/* Noise texture */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.025,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          pointerEvents: 'none',
        }}
      />

      {children}
    </Box>
  </>
);

export default AuthLayout;
