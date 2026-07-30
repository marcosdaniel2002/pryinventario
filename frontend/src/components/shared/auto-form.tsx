"use client";

import { useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type Resolver } from "react-hook-form";
import type { z, ZodObject, ZodRawShape } from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import type { DialogSize } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { ImageDropzone } from "./image-dropzone";
import { SingleCombobox } from "./single-combobox";

/**
 * Formulario generico: a partir de un schema de Zod (la unica fuente de
 * verdad de tipo + validacion + obligatoriedad, ya que un `type` de TS puro
 * no existe en tiempo de ejecucion) arma los campos con react-hook-form y
 * marca con "*" los que el schema no declara `.optional()`.
 *
 * El layout es un grid de 12 columnas (estilo Bootstrap): cada campo ocupa
 * `col` columnas (1-12, default 12 = fila completa).
 *
 * Todo formulario del proyecto se manda como multipart/form-data (ver
 * EntityDialog, que arma el FormData a partir de los `values` + `files` de
 * acá), tenga o no `fileFields` — así agregar una foto a una pantalla que
 * hoy no tiene ninguna es solo declarar `fileFields`, sin cambiar el wire
 * format de las que ya existen.
 */

// Tailwind necesita ver la clase completa en el código fuente para
// generarla — no alcanza con interpolar `col-span-${n}` en runtime.
const COL_SPAN_CLASSES: Record<number, string> = {
  1: "col-span-1",
  2: "col-span-2",
  3: "col-span-3",
  4: "col-span-4",
  5: "col-span-5",
  6: "col-span-6",
  7: "col-span-7",
  8: "col-span-8",
  9: "col-span-9",
  10: "col-span-10",
  11: "col-span-11",
  12: "col-span-12",
};

// Mismos tamaños que <DialogContent size="...">, para usar el mismo valor
// en los dos y que el modal y el form escalen juntos.
const GAP_CLASSES_BY_SIZE: Record<DialogSize, string> = {
  sm: "gap-x-2 gap-y-2",
  md: "gap-x-2 gap-y-3",
  lg: "gap-x-3 gap-y-3",
  xl: "gap-x-3 gap-y-4",
  "2xl": "gap-x-4 gap-y-4",
};

export interface AutoFormFieldOption {
  value: string;
  label: string;
}

export interface AutoFormField<Shape extends ZodRawShape> {
  name: Extract<keyof Shape, string>;
  label: string;
  type?: "text" | "number" | "password" | "combobox";
  /** Placeholder del input, o del buscador cuando type es "combobox" (opcional). */
  placeholder?: string;
  /** Texto gris debajo del input, para guiar al usuario (opcional). */
  description?: string;
  /** Columnas de 12 que ocupa el campo (estilo Bootstrap). Default: 12 (fila completa). */
  col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  /** Requerido cuando type es "combobox". */
  options?: AutoFormFieldOption[];
  /**
   * Solo aplica a type: "combobox". Habilita seleccion multiple con chips
   * (el valor del campo pasa a ser `string[]` en vez de `string`).
   * Default: false.
   */
  multiple?: boolean;
}

/** Un campo de archivo (ej. una foto): no es parte del schema de zod, va aparte. */
export interface AutoFormFileField {
  /** Clave interna del campo-archivo (matchea con `fileFields` de EntityDialog). */
  name: string;
  label: string;
  /** Columnas de 12 que ocupa (ver AutoFormField.col). Default: 12. */
  col?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
  accept?: string;
}

export interface AutoFormFileValue {
  file: File | null;
  /** true = sacar la imagen actual (sin elegir una nueva). */
  remove: boolean;
}

function isFieldRequired<Shape extends ZodRawShape>(
  schema: ZodObject<Shape>,
  name: Extract<keyof Shape, string>,
) {
  const field = schema.shape[name] as unknown as { isOptional: () => boolean };
  return !field.isOptional();
}

// Combobox de seleccion multiple, con chips (cada chip trae su propio boton
// de sacar). El valor del campo es un string[] con los `value` elegidos.
// Preparado para cuando haga falta (ej. asignar varias urls a un rol) —
// todavia no lo usa ningun formulario.
function AutoFormComboboxMultiple({
  value,
  onChange,
  options,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  options: AutoFormFieldOption[];
  placeholder?: string;
}) {
  const labelByValue = new Map(options.map((option) => [option.value, option.label]));
  const anchor = useComboboxAnchor();

  return (
    <Combobox
      multiple
      items={options.map((option) => option.value)}
      value={value}
      onValueChange={onChange}
      itemToStringLabel={(itemValue) => labelByValue.get(itemValue) ?? itemValue}
    >
      <ComboboxChips ref={anchor}>
        {value.map((itemValue) => (
          <ComboboxChip key={itemValue}>
            {labelByValue.get(itemValue) ?? itemValue}
          </ComboboxChip>
        ))}
        <ComboboxChipsInput placeholder={placeholder ?? "Buscar..."} />
      </ComboboxChips>
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

interface AutoFormProps<Shape extends ZodRawShape> {
  id: string;
  schema: ZodObject<Shape>;
  fields: AutoFormField<Shape>[];
  fileFields?: AutoFormFileField[];
  defaultValues: DefaultValues<z.infer<ZodObject<Shape>>>;
  /** URL actual de cada campo-archivo (por `name`), para el preview al editar. */
  currentFileUrls?: Record<string, string | null>;
  onSubmit: (
    values: z.infer<ZodObject<Shape>>,
    files: Record<string, AutoFormFileValue>,
  ) => void | Promise<void>;
  /** Debe coincidir con el `size` del <DialogContent> que lo envuelve. Default: "lg". */
  size?: DialogSize;
}

export function AutoForm<Shape extends ZodRawShape>({
  id,
  schema,
  fields,
  fileFields = [],
  defaultValues,
  currentFileUrls = {},
  onSubmit,
  size = "lg",
}: AutoFormProps<Shape>) {
  type Values = z.infer<ZodObject<Shape>>;

  const form = useForm<Values>({
    resolver: zodResolver(schema) as Resolver<Values>,
    defaultValues,
  });

  // Estado de los campos-archivo, fuera de react-hook-form (no son campos
  // del schema). Va en un ref, no en useState: no necesita disparar un
  // re-render acá (el ImageDropzone ya maneja su propio preview), y un ref
  // evita que un re-render por otro campo del form pise la selección hecha.
  const filesRef = useRef<Record<string, AutoFormFileValue>>({});

  function setFileValue(name: string, value: AutoFormFileValue) {
    filesRef.current = { ...filesRef.current, [name]: value };
  }

  return (
    <Form {...form}>
      <form
        id={id}
        onSubmit={form.handleSubmit((values) => onSubmit(values, filesRef.current))}
        className={cn("grid grid-cols-12", GAP_CLASSES_BY_SIZE[size])}
      >
        {fields.map((fieldConfig) => (
          <FormField
            key={fieldConfig.name}
            control={form.control}
            name={fieldConfig.name as never}
            render={({ field }) => (
              <FormItem className={COL_SPAN_CLASSES[fieldConfig.col ?? 12]}>
                <FormLabel required={isFieldRequired(schema, fieldConfig.name)}>
                  {fieldConfig.label}
                </FormLabel>
                {fieldConfig.type === "combobox" ? (
                  fieldConfig.multiple ? (
                    <AutoFormComboboxMultiple
                      value={(field.value as string[] | undefined) ?? []}
                      onChange={field.onChange}
                      options={fieldConfig.options ?? []}
                      placeholder={fieldConfig.placeholder}
                    />
                  ) : (
                    <SingleCombobox
                      value={(field.value as string | undefined) ?? ""}
                      onChange={field.onChange}
                      options={fieldConfig.options ?? []}
                      placeholder={fieldConfig.placeholder}
                    />
                  )
                ) : (
                  <FormControl>
                    <Input
                      type={
                        fieldConfig.type === "number"
                          ? "number"
                          : fieldConfig.type === "password"
                            ? "password"
                            : "text"
                      }
                      placeholder={fieldConfig.placeholder}
                      {...field}
                      value={(field.value as string | number | undefined) ?? ""}
                      onChange={(event) => {
                        if (fieldConfig.type === "number") {
                          const raw = event.target.valueAsNumber;
                          field.onChange(Number.isNaN(raw) ? undefined : raw);
                          return;
                        }
                        field.onChange(event.target.value);
                      }}
                    />
                  </FormControl>
                )}
                {fieldConfig.description ? (
                  <FormDescription>{fieldConfig.description}</FormDescription>
                ) : null}
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        {fileFields.map((fileField) => (
          <div key={fileField.name} className={COL_SPAN_CLASSES[fileField.col ?? 12]}>
            <label className="text-xs font-medium text-foreground">
              {fileField.label}
            </label>
            <ImageDropzone
              className="mt-1"
              accept={fileField.accept}
              currentImageUrl={currentFileUrls[fileField.name] ?? null}
              onFileSelected={(file) => setFileValue(fileField.name, { file, remove: false })}
              onRemove={() => setFileValue(fileField.name, { file: null, remove: true })}
            />
          </div>
        ))}
      </form>
    </Form>
  );
}
