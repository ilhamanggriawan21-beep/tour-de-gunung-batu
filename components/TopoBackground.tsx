import React from 'react';

export default function TopoBackground({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 pointer-events-none overflow-hidden opacity-15 ${className}`}>
      <svg
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="none"
      >
        <g stroke="#1D3AAE" strokeWidth="1.5" fill="none" opacity="0.6">
          <path d="M-100,200 Q300,100 700,350 T1500,200" />
          <path d="M-100,240 Q320,130 720,380 T1500,240" />
          <path d="M-100,280 Q340,160 740,410 T1500,280" />
          <path d="M-100,320 Q360,190 760,440 T1500,320" />
          
          <path d="M-100,450 Q200,600 650,480 T1500,600" />
          <path d="M-100,490 Q220,630 670,510 T1500,640" />
          <path d="M-100,530 Q240,660 690,540 T1500,680" />
          <path d="M-100,570 Q260,690 710,570 T1500,720" />

          {/* Contour Peak 1 */}
          <path d="M 400 300 C 450 250, 550 250, 600 300 C 650 350, 550 450, 450 420 Z" />
          <path d="M 420 310 C 465 270, 535 270, 580 310 C 620 350, 535 430, 460 405 Z" />
          <path d="M 440 320 C 475 290, 515 290, 550 320 C 580 350, 515 410, 470 390 Z" />
          <path d="M 460 330 C 485 310, 500 310, 520 330 C 540 350, 500 390, 480 380 Z" />

          {/* Contour Peak 2 - Gunung Batu Representation */}
          <path d="M 900 150 C 1050 50, 1250 120, 1300 250 C 1350 400, 1150 500, 950 400 Z" stroke="#1D3AAE" strokeWidth="2" />
          <path d="M 940 180 C 1070 80, 1220 140, 1260 260 C 1300 380, 1120 460, 970 380 Z" />
          <path d="M 980 210 C 1090 110, 1190 160, 1220 270 C 1250 360, 1090 420, 990 360 Z" />
          <path d="M 1020 240 C 1110 140, 1160 180, 1180 280 C 1200 340, 1070 380, 1010 340 Z" />
          <path d="M 1060 270 C 1120 180, 1140 200, 1150 280 C 1160 320, 1070 350, 1040 320 Z" fill="#F4C716" fillOpacity="0.1" />
        </g>
      </svg>
    </div>
  );
}
