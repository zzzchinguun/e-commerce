import { cn } from '@/lib/utils'

interface ContainerProps {
  children: React.ReactNode
  className?: string
}

export function Container({ children, className }: ContainerProps) {
  return (
    <div
      className={cn(
        'mx-auto max-w-full px-4',
        'sm:max-w-[576px] md:max-w-[690px] lg:max-w-[820px] xl:max-w-[1024px] 2xl:max-w-[1230px] 3xl:max-w-[1536px]',
        className
      )}
    >
      {children}
    </div>
  )
}
