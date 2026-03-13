import type { HTMLAttributes } from 'react';

const mergeClass = (...values: Array<string | undefined>) => {
  return values.filter(Boolean).join(' ');
};

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={mergeClass(
        'rounded-xl border border-white/40 bg-white/55 text-slate-950 shadow-lg shadow-hydrangea-blue/10 backdrop-blur-md',
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={mergeClass('flex flex-col space-y-1.5 p-6', className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={mergeClass('text-lg font-semibold leading-none tracking-tight', className)} {...props} />;
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={mergeClass('text-sm text-slate-500', className)} {...props} />;
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={mergeClass('p-6 pt-0', className)} {...props} />;
}
