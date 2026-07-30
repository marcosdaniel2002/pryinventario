"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface SingleComboboxProps {
  value: string;
  onChange: (value: string) => void;
  options: ComboboxOption[];
  placeholder?: string;
}

/**
 * Combobox de una sola selección con botón de limpiar. Lo usa tanto un
 * campo `type: "combobox"` de AutoForm como una barra de filtros suelta
 * fuera de cualquier form (ej. el filtro de categoría/marca en la tabla de
 * Productos) — no depende de react-hook-form, es un `value`/`onChange`
 * controlado como cualquier input.
 */
export function SingleCombobox({
  value,
  onChange,
  options,
  placeholder,
}: SingleComboboxProps) {
  const labelByValue = new Map(options.map((option) => [option.value, option.label]));
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      items={options.map((option) => option.value)}
      value={value || null}
      onValueChange={(next) => onChange(next ?? "")}
      itemToStringLabel={(itemValue) => labelByValue.get(itemValue) ?? itemValue}
    >
      <div ref={anchor}>
        <ComboboxInput placeholder={placeholder ?? "Buscar..."} showClear />
      </div>
      <ComboboxContent anchor={anchor}>
        <ComboboxEmpty>Sin resultados.</ComboboxEmpty>
        <ComboboxList>
          {(itemValue: string) => (
            <ComboboxItem key={itemValue} value={itemValue}>
              {labelByValue.get(itemValue) ?? itemValue}
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}
