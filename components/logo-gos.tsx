export const LogoGOS = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ 
      shapeRendering: 'geometricPrecision',
      overflow: 'visible'
    }}
  >
    {/* Outer Circle */}
    <circle 
      cx="50" cy="50" r="45" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2"
    />
    
    {/* Stylized GOS Flame/Figure */}
    <path
      d="M50 20 
         C40 35, 30 50, 40 65
         S60 85, 75 70
         S65 40, 50 20
         M45 45
         C45 55, 55 55, 55 45
         S45 35, 45 45"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Star Element */}
    <path
      d="M72 25 L74 29 L79 30 L75 33 L76 38 L72 35 L68 38 L69 33 L65 30 L70 29 Z"
      fill="currentColor"
    />

    {/* GOS Typography Simulation (Geometric) */}
    <path
      d="M35 75 H65 M35 82 H65"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
