export function LogoFull({ className }: { className?: string }) {
  return (
    <svg
      version="1.1"
      id="GOS_Logo"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      viewBox="0 0 800 800"
      className={className}
      style={{
        shapeRendering: 'geometricPrecision'
      }}
    >
      <rect fill="#235850" width="800" height="800" />
      <circle fill="#FFFFFF" cx="400" cy="400" r="344.2" />
      <text
        transform="matrix(1 0 0 1 297.027 596.5361)"
        fill="#235850"
        fontFamily="ArialMT"
        fontSize="12.7236px"
      >
        Gastronomic Organization Service
      </text>
      <text
        transform="matrix(1 0 0 1 296.0963 581.5471)"
        fill="#235850"
        fontFamily="HemiHead426-Rg, 'Hemi Head 426'"
        fontSize="104.2492px"
      >
        GOS
      </text>
      <defs>
        <linearGradient
          id="SVGID_1_"
          gradientUnits="userSpaceOnUse"
          x1="431.1195"
          y1="289.8703"
          x2="416.7909"
          y2="528.9866"
        >
          <stop offset="0.2527" stopColor="#DC8134" />
          <stop offset="1" stopColor="#D0662A" />
        </linearGradient>
        <linearGradient
          id="SVGID_2_"
          gradientUnits="userSpaceOnUse"
          x1="384.4447"
          y1="247.7818"
          x2="384.4447"
          y2="333.1979"
        >
          <stop offset="0" stopColor="#F5C6A0" />
          <stop offset="1" stopColor="#DC8134" />
        </linearGradient>
        <linearGradient
          id="SVGID_3_"
          gradientUnits="userSpaceOnUse"
          x1="400.0001"
          y1="231.25"
          x2="400.0001"
          y2="625"
        >
          <stop offset="0" stopColor="#F8C194" />
          <stop offset="1" stopColor="#D0662A" />
        </linearGradient>
        <linearGradient
          id="SVGID_4_"
          gradientUnits="userSpaceOnUse"
          x1="421.3789"
          y1="247.7818"
          x2="421.3789"
          y2="333.1979"
        >
          <stop offset="0" stopColor="#F5C6A0" />
          <stop offset="1" stopColor="#DC8134" />
        </linearGradient>
      </defs>
      <path
        fill="url(#SVGID_1_)"
        d="M486.2,367.4c-22.3,1.9-42.2,6.5-59.5,13.8c-10.4,4.4-19.6,9.5-27.7,15.3l-1.5,1.1c16.3-4.3,34.8-12.7,46.2-22.2
      c13.2-11.1,23.3-25,29.3-40.2c2.6-6.6,4.6-13.4,5.9-20.2C481.5,335.5,483.9,352,486.2,367.4"
      />
      <path
        fill="url(#SVGID_2_)"
        d="M381.5,310.2c-0.1-2.9-0.1-5.8,0-8.7c0.2-11.3,1.8-22.1,4.5-32.3c2.7-10.3,6.7-19.8,11.5-28.5c1-1.8,2-3.6,3-5.3
      c-4.4,12-7,25.2-7.5,39C392.4,286.2,388.7,298.5,381.5,310.2"
      />
      <path
        fill="url(#SVGID_3_)"
        d="M400,231.3c0,0,162.5,100,162.5,237.5C562.5,556.3,489.6,625,400,625s-162.5-68.8-162.5-156.3
      C237.5,331.3,400,231.3,400,231.3 M400,293.8c-55.2,0-100,44.8-100,100c0,55.2,44.8,100,100,100s100-44.8,100-100
      C500,338.5,455.2,293.8,400,293.8z"
      />
      <polygon
        fill="url(#SVGID_2_)"
        points="492.2,242.3 483.8,249.9 472.9,246.3 478.4,256.4 473,266.6 483.8,262.9 492.2,270.4 490.8,259.2 
      498,250.3 486.9,248.8 "
      />
      <path
        fill="url(#SVGID_4_)"
        d="M428,310.2c0.1-2.9,0.1-5.8,0-8.7c-0.2-11.3-1.8-22.1-4.5-32.3c-2.7-10.3-6.7-19.8-11.5-28.5c-1-1.8-2-3.6-3-5.3
      c4.4,12,7,25.2,7.5,39C417.1,286.2,420.8,298.5,428,310.2"
      />
    </svg>
  );
}
