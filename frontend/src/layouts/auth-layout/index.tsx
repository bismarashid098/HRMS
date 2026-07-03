import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

const AuthLayout = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#020914',
      display: 'flex',
      position: 'relative',
      overflow: 'hidden',
    }}
  >
    <style>{`
      @keyframes orbFloat {
        0%,100% { transform: translate(0,0) scale(1); }
        50%      { transform: translate(40px,-60px) scale(1.1); }
      }
      @keyframes orbFloat2 {
        0%,100% { transform: translate(0,0) scale(1); }
        50%      { transform: translate(-50px,40px) scale(0.9); }
      }
      @keyframes orbFloat3 {
        0%,100% { transform: translate(0,0) scale(1); }
        50%      { transform: translate(30px,35px) scale(1.05); }
      }
      @keyframes fadeUp {
        from { opacity:0; transform:translateY(18px); }
        to   { opacity:1; transform:translateY(0);    }
      }
      @keyframes fadeIn {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes shake {
        0%,100% { transform:translateX(0);   }
        15%     { transform:translateX(-8px); }
        30%     { transform:translateX(7px);  }
        45%     { transform:translateX(-6px); }
        60%     { transform:translateX(5px);  }
        75%     { transform:translateX(-3px); }
        90%     { transform:translateX(2px);  }
      }
      @keyframes statusPulse {
        0%,100% { box-shadow:0 0 0 0   rgba(16,185,129,.55); }
        50%      { box-shadow:0 0 0 5px rgba(16,185,129,0);   }
      }
    `}</style>

    {/* Background orbs */}
    <Box
      sx={{
        position: 'absolute',
        top: '-20%',
        left: '-12%',
        width: 900,
        height: 900,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 60%)',
        filter: 'blur(90px)',
        animation: 'orbFloat 22s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: '-18%',
        right: '-10%',
        width: 750,
        height: 750,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(99,102,241,.14) 0%, transparent 60%)',
        filter: 'blur(80px)',
        animation: 'orbFloat2 28s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        top: '45%',
        left: '30%',
        width: 500,
        height: 500,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,.07) 0%, transparent 60%)',
        filter: 'blur(60px)',
        animation: 'orbFloat3 18s ease-in-out infinite',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />

    {/* Dot grid */}
    <Box
      sx={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'radial-gradient(rgba(255,255,255,.035) 1px, transparent 1px)',
        backgroundSize: '28px 28px',
        maskImage: 'radial-gradient(ellipse 100% 100% at 50% 50%, black 40%, transparent 100%)',
        WebkitMaskImage:
          'radial-gradient(ellipse 100% 100% at 50% 50%, black 40%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />

    <Box sx={{ position: 'relative', zIndex: 1, width: '100%', display: 'flex' }}>{children}</Box>
  </Box>
);

export default AuthLayout;
