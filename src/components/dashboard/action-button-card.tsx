import type { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';

type ActionButtonCardProps = {
  icon: ReactNode;
  title: string;
};

export function ActionButtonCard({ icon, title }: ActionButtonCardProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow duration-300 rounded-2xl w-full h-[135px] flex flex-col items-center justify-center text-center p-4 bg-card hover:bg-accent cursor-pointer">
      <div className="mb-2">
        {icon}
      </div>
      <p className="font-semibold text-sm text-card-foreground">{title}</p>
    </Card>
  );
}
