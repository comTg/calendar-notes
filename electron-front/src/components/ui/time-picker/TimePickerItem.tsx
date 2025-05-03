
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface TimePickerItemProps {
  value: string;
  isSelected: boolean;
  onClick: () => void;
  dataAttr: {
    key: string;
    value: string;
  };
}

const TimePickerItem: React.FC<TimePickerItemProps> = ({
  value,
  isSelected,
  onClick,
  dataAttr,
}) => {
  // Create dynamic data attribute object
  const dataAttributes = {
    [`data-${dataAttr.key}`]: dataAttr.value
  };

  return (
    <Button
      {...dataAttributes}
      variant={isSelected ? "default" : "ghost"}
      className={cn(
        "my-1 rounded-md",
        isSelected ? "bg-primary text-primary-foreground" : "hover:bg-muted"
      )}
      onClick={onClick}
    >
      {value}
    </Button>
  );
};

export default React.memo(TimePickerItem);
