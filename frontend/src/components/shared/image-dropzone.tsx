"use client";

import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageDropzoneProps {
  /** URL de la imagen ya guardada, o null si el registro no tiene ninguna. */
  currentImageUrl: string | null;
  /** El usuario eligió o arrastró un archivo nuevo (todavía no se sube). */
  onFileSelected: (file: File) => void;
  /** El usuario eliminó el archivo (el recién elegido, o el ya guardado). */
  onRemove: () => void;
  /** Default: imágenes jpg/png/webp (mismo whitelist que valida el backend). */
  accept?: string;
  disabled?: boolean;
  className?: string;
}

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/webp";

/**
 * Dropzone de un solo archivo: arrastrar y soltar o click para elegir,
 * preview del recién elegido (o del ya guardado, con su URL como link) y
 * botón para eliminarlo. No sube nada por sí solo — el que lo usa decide
 * cuándo y cómo mandar el archivo (ver ProductoDialog).
 */
export function ImageDropzone({
  currentImageUrl,
  onFileSelected,
  onRemove,
  accept = DEFAULT_ACCEPT,
  disabled,
  className,
}: ImageDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // Se pisa currentImageUrl aunque el padre no lo cambie: sin esto, después
  // de "Eliminar archivo" seguiría mostrándose el archivo viejo hasta que el
  // padre remonte el componente.
  const [removed, setRemoved] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const displayUrl = removed ? null : (previewUrl ?? currentImageUrl);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    setRemoved(false);
    setPreviewUrl(URL.createObjectURL(file));
    onFileSelected(file);
  }

  function handleRemove() {
    setPreviewUrl(null);
    setRemoved(true);
    if (inputRef.current) inputRef.current.value = "";
    onRemove();
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(event) => {
          if (!disabled && (event.key === "Enter" || event.key === " ")) {
            inputRef.current?.click();
          }
        }}
        onDragOver={(event) => {
          event.preventDefault();
          if (!disabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          if (!disabled) handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          "relative flex h-40 w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-border bg-muted/30 transition-colors",
          !disabled && "cursor-pointer",
          isDragging && "border-primary bg-muted/60",
          disabled && "opacity-50",
        )}
      >
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- viene de otro origen (backend), no de /public
          <img
            src={displayUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 px-2 text-center text-muted-foreground">
            <Upload className="size-5" />
            <span className="text-xs">Arrastrá o hacé click</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        disabled={disabled}
        onChange={(event) => handleFiles(event.target.files)}
      />

      {displayUrl ? (
        <p className="text-xs text-muted-foreground">
          Archivo actual:{" "}
          <a
            href={displayUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-primary underline underline-offset-2"
          >
            {displayUrl}
          </a>
        </p>
      ) : null}

      {displayUrl ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          onClick={handleRemove}
        >
          <X />
          Eliminar archivo
        </Button>
      ) : null}
    </div>
  );
}
