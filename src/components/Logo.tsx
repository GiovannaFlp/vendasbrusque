interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'white'
}

export function Logo({ size = 'md', variant = 'default' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-base' },
    md: { icon: 40, text: 'text-xl' },
    lg: { icon: 56, text: 'text-3xl' },
  }

  const s = sizes[size]
  const textColor = variant === 'white' ? 'text-white' : 'text-gray-900'

  return (
    <div className="flex items-center gap-2.5">
      {/* Ícone VB */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="vb-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563EB" />
            <stop offset="100%" stopColor="#1D4ED8" />
          </linearGradient>
        </defs>

        {/* Fundo arredondado */}
        <rect width="40" height="40" rx="10" fill="url(#vb-grad)" />

        {/* Letra V */}
        <path
          d="M7 12L13.5 26L16 20.5L12.5 12H7Z"
          fill="white"
          opacity="0.95"
        />
        <path
          d="M20 26L13.5 12H18L20 17.5L22 12H26.5L20 26Z"
          fill="white"
        />

        {/* Letra B */}
        <path
          d="M27 12H32.5C34.5 12 35.5 13.2 35.5 14.8C35.5 16 34.8 16.8 33.8 17.2C35 17.6 35.8 18.5 35.8 20C35.8 22 34.5 23.5 32 23.5H27V12ZM29.5 16.2H32C32.8 16.2 33.2 15.7 33.2 15C33.2 14.3 32.8 13.8 32 13.8H29.5V16.2ZM29.5 21.5H32.2C33.2 21.5 33.7 20.9 33.7 20C33.7 19.1 33.1 18.5 32.2 18.5H29.5V21.5Z"
          fill="white"
          opacity="0.9"
        />

        {/* Barra decorativa inferior */}
        <rect x="7" y="28" width="26" height="2.5" rx="1.25" fill="white" opacity="0.3" />
      </svg>

      {/* Nome */}
      <div className="flex flex-col leading-tight">
        <span className={`font-black tracking-tight ${s.text} ${textColor}`}>
          Vendas
          <span className="text-blue-500">Brusque</span>
        </span>
      </div>
    </div>
  )
}

export function LogoIcon({ size = 40 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="vb-grad-icon" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="10" fill="url(#vb-grad-icon)" />
      <path d="M7 12L13.5 26L16 20.5L12.5 12H7Z" fill="white" opacity="0.95" />
      <path d="M20 26L13.5 12H18L20 17.5L22 12H26.5L20 26Z" fill="white" />
      <path d="M27 12H32.5C34.5 12 35.5 13.2 35.5 14.8C35.5 16 34.8 16.8 33.8 17.2C35 17.6 35.8 18.5 35.8 20C35.8 22 34.5 23.5 32 23.5H27V12ZM29.5 16.2H32C32.8 16.2 33.2 15.7 33.2 15C33.2 14.3 32.8 13.8 32 13.8H29.5V16.2ZM29.5 21.5H32.2C33.2 21.5 33.7 20.9 33.7 20C33.7 19.1 33.1 18.5 32.2 18.5H29.5V21.5Z" fill="white" opacity="0.9" />
      <rect x="7" y="28" width="26" height="2.5" rx="1.25" fill="white" opacity="0.3" />
    </svg>
  )
}
