import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export interface SearchableOption {
  value: string;
  label: string;
  render?: React.ReactNode;
}

export interface SearchableGroup {
  label: string;
  options: SearchableOption[];
}

interface SearchableSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  options?: SearchableOption[];
  groups?: SearchableGroup[];
  className?: string;
  triggerClassName?: string;
  disabled?: boolean;
  renderSelected?: (option: SearchableOption) => React.ReactNode;
}

export function SearchableSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  emptyMessage = "Sin resultados.",
  options,
  groups,
  className,
  triggerClassName,
  disabled,
  renderSelected,
}: SearchableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const listRef = React.useRef<HTMLDivElement>(null);

  const allOptions = React.useMemo(() => {
    if (options) return options;
    if (groups) return groups.flatMap((g) => g.options);
    return [];
  }, [options, groups]);

  const selectedOption = allOptions.find((o) => o.value === value);

  const displayLabel = () => {
    if (!selectedOption) return <span className="text-muted-foreground">{placeholder}</span>;
    if (renderSelected) return renderSelected(selectedOption);
    if (selectedOption.render) return selectedOption.render;
    return selectedOption.label;
  };

  const handleSelect = (val: string) => {
    onValueChange(val);
    setOpen(false);
  };

  const renderOptions = (opts: SearchableOption[]) =>
    opts.map((option) => (
      <CommandItem
        key={option.value}
        value={option.label}
        onSelect={() => handleSelect(option.value)}
      >
        <Check className={cn("mr-2 h-4 w-4 flex-shrink-0", value === option.value ? "opacity-100" : "opacity-0")} />
        {option.render || option.label}
      </CommandItem>
    ));

  return (
    <Popover open={open} onOpenChange={setOpen} modal={false}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn("w-full justify-between font-normal", triggerClassName)}
        >
          <span className="truncate">{displayLabel()}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("z-[100] p-0 w-[--radix-popover-trigger-width] flex flex-col max-h-[min(70vh,380px)]", className)} align="start">
        <Command className="flex flex-col min-h-0 max-h-full overflow-hidden">
          <CommandInput placeholder={searchPlaceholder} className="flex-shrink-0" />
          <CommandList
            ref={listRef}
            className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-contain scrollbar-thin"
            onWheel={(e) => {
              e.stopPropagation();
              const el = listRef.current;
              if (!el) return;
              el.scrollTop += e.deltaY;
              e.preventDefault();
            }}
          >
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            {groups ? (
              groups.map((group) => (
                <CommandGroup key={group.label} heading={group.label}>
                  {renderOptions(group.options)}
                </CommandGroup>
              ))
            ) : (
              <CommandGroup>{renderOptions(allOptions)}</CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
