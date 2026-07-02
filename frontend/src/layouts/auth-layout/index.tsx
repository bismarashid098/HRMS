import { PropsWithChildren } from 'react';
import Box from '@mui/material/Box';

const AuthLayout = ({ children }: PropsWithChildren) => (
  <Box
    sx={{
      minHeight: '100vh',
      bgcolor: '#020914',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      p: { xs: 3, sm: 4, md: 6 },
    }}
  >
    <style>{`
      @keyframes orb1 {
        0%,100% { transform: translate(0,0)    scale(1);   }
        50%      { transform: translate(50px,-70px) scale(1.12); }
      }
      @keyframes orb2 {
        0%,100% { transform: translate(0,0)      scale(1);   }
        50%      { transform: translate(-60px,50px) scale(0.88); }
      }
      @keyframes orb3 {
        0%,100% { transform: translate(0,0)     scale(1);   }
        50%      { transform: translate(30px,40px) scale(1.06); }
      }
      @keyframes statusPulse {
        0%,100% { opacity:1;   box-shadow: 0 0 0 0   rgba(34,197,94,0.5); }
        50%      { opacity:0.7; box-shadow: 0 0 0 5px rgba(34,197,94,0);   }
      }
      @keyframes logoIn {
        from { opacity:0; transform: translateY(-14px); }
        to   { opacity:1; transform: translateY(0);     }
      }
      @keyframes cardIn {
        from { opacity:0; transform: translateY(22px) scale(0.97); }
        to   { opacity:1; transform: translateY(0)    scale(1);    }
      }
      @keyframes footerIn {
        from { opacity:0; }
        to   { opacity:1; }
      }
      @keyframes shake {
        0%,100% { transform: translateX(0);   }
        15%     { transform: translateX(-8px); }
        30%     { transform: translateX(7px);  }
        45%     { transform: translateX(-6px); }
        60%     { transform: translateX(5px);  }
        75%     { transform: translateX(-3px); }
        90%     { transform: translateX(2px);  }
      }
    `}</style>

    {/* Gradient orbs */}
    <Box sx={{ position:'absolute', top:'-18%', left:'-12%', width:1000, height:1000, borderRadius:'50%', background:'radial-gradient(circle, rgba(37,99,235,.18) 0%, transparent 58%)', filter:'blur(90px)', animation:'orb1 26s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
    <Box sx={{ position:'absolute', bottom:'-20%', right:'-10%', width:800,  height:800,  borderRadius:'50%', background:'radial-gradient(circle, rgba(99,102,241,.14) 0%, transparent 58%)', filter:'blur(80px)', animation:'orb2 32s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
    <Box sx={{ position:'absolute', top:'55%', left:'35%', width:500, height:500, borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,.08) 0%, transparent 60%)', filter:'blur(60px)', animation:'orb3 20s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />

    {/* Dot grid */}
    <Box sx={{ position:'absolute', inset:0, pointerEvents:'none', backgroundImage:'radial-gradient(rgba(255,255,255,.038) 1px, transparent 1px)', backgroundSize:'30px 30px', maskImage:'radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)', WebkitMaskImage:'radial-gradient(ellipse 90% 90% at 50% 50%, black 50%, transparent 100%)', zIndex:0 }} />

    {/* Page content — centered */}
    <Box sx={{ position:'relative', zIndex:1, width:'100%', maxWidth:500 }}>
      {children}
    </Box>
  </Box>
);

export default AuthLayout;
