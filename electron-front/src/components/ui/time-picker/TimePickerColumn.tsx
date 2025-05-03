
import React, { useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import TimePickerItem from './TimePickerItem';

interface TimePickerColumnProps {
  title: string;
  items: string[];
  selectedItem: string;
  onItemClick: (item: string) => void;
  dataAttrKey: string;
  ref?: React.RefObject<HTMLDivElement>;
}

const TimePickerColumn: React.FC<TimePickerColumnProps> = ({
  title,
  items,
  selectedItem,
  onItemClick,
  dataAttrKey,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Handle mouse wheel events for scrolling
  const handleWheel = (e: React.WheelEvent) => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop += e.deltaY;
    }
  };

  return (
    <div className="flex-1 flex flex-col">
      <div className="text-xs font-medium text-muted-foreground text-center pb-1 border-b">
        {title}
      </div>
      <ScrollArea className="h-[180px] w-full" scrollHideDelay={0} onWheel={handleWheel}>
        <div className="flex flex-col items-stretch py-1" ref={scrollRef}>
          {items.map((item) => (
            <TimePickerItem
              key={item}
              value={item}
              isSelected={selectedItem === item}
              onClick={() => onItemClick(item)}
              dataAttr={{
                key: dataAttrKey,
                value: item
              }}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default React.memo(TimePickerColumn);
