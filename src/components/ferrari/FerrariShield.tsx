import shield from '~/assets/ferrari-shield.png'

export function FerrariShield({
  size = 40,
  className = '',
}: {
  size?: number
  className?: string
}) {
  return (
    <img
      src={shield}
      alt="Scuderia Ferrari"
      width={size}
      height={size}
      className={`object-contain select-none ${className}`}
      draggable={false}
    />
  )
}
