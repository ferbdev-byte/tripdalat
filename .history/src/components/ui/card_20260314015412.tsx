import type { HTMLAttributes } from 'react';

const mergeClass = (...values: Array<string | undefined>) => {
  return values.filter(Boolean).join(' ');
};

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={mergeClass(
        'rounded-2xl border border-primary/20 bg-white/50 text-text shadow-soft backdrop-blur-xl',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={mergeClass('flex flex-col space-y-2 p-7', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={mergeClass('text-xl font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={mergeClass('text-sm text-text/75', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={mergeClass('p-7 pt-0', className)} {...props} />;
}
