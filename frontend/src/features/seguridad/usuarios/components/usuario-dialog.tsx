"use client";

import { EntityDialog } from "@/components/shared/entity-dialog";
import {
  useCreateUsuario,
  useUpdateUsuario,
} from "@/features/seguridad/usuarios/hooks";
import {
  usuarioEditFormSchema,
  usuarioFormSchema,
  type UsuarioEditFormValues,
  type UsuarioFormValues,
} from "@/features/seguridad/usuarios/schema";
import type { UsuarioListItem } from "@/features/seguridad/usuarios/types";
import type { RolListItem } from "@/features/seguridad/roles/types";

interface UsuarioDialogProps {
  /** null = crear un usuario nuevo. Con valor = editar ese usuario. */
  usuario: UsuarioListItem | null;
  roles: RolListItem[];
  token: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const emptyValues: UsuarioFormValues = {
  username: "",
  nombre: "",
  email: "",
  rol_id: "",
  password: "",
};

const emptyEditValues: UsuarioEditFormValues = {
  username: "",
  nombre: "",
  email: "",
  rol_id: "",
  password: "",
};

export function UsuarioDialog({
  usuario,
  roles,
  token,
  open,
  onOpenChange,
}: UsuarioDialogProps) {
  const createRegistro = useCreateUsuario(token);
  const updateRegistro = useUpdateUsuario(token);
  const rolOptions = roles.map((rol) => ({ value: rol.id, label: rol.nombre }));

  // Password requerida al crear, opcional al editar (dejarla en blanco =
  // no cambiarla): son dos schemas de Zod distintos, asi que renderizamos
  // dos <EntityDialog> segun el modo en vez de un solo schema condicional
  // (evita mezclar dos "Shape" distintas en el mismo generic).
  if (usuario) {
    return (
      <EntityDialog
        entity={usuario}
        open={open}
        onOpenChange={onOpenChange}
        token={token}
        schema={usuarioEditFormSchema}
        fields={[
          { name: "username", label: "Username" },
          { name: "nombre", label: "Nombre" },
          { name: "email", label: "Email", col: 6 },
          {
            name: "rol_id",
            label: "Rol",
            type: "combobox",
            placeholder: "Selecciona un rol",
            options: rolOptions,
            col: 6,
          },
          {
            name: "password",
            label: "Contraseña",
            type: "password",
            placeholder: "Dejar en blanco para no cambiarla",
            description: "Si la dejas vacía, la contraseña actual se mantiene.",
          },
        ]}
        getId={(u) => u.id}
        toFormValues={(u) => ({
          username: u.username,
          nombre: u.nombre,
          email: u.email ?? "",
          rol_id: u.rol.id,
          password: "",
        })}
        emptyValues={emptyEditValues}
        // Nunca se llama en este branch (entity siempre es no-nulo aca), pero
        // EntityDialog exige el prop igual: password va sin "?" para calzar
        // con el tipo requerido por createMutation.
        toCreatePayload={(values: UsuarioEditFormValues) => ({
          username: values.username,
          nombre: values.nombre,
          rol_id: values.rol_id,
          password: values.password ?? "",
          ...(values.email?.trim() ? { email: values.email.trim() } : {}),
        })}
        toUpdatePayload={(values: UsuarioEditFormValues) => ({
          username: values.username,
          nombre: values.nombre,
          rol_id: values.rol_id,
          ...(values.email?.trim() ? { email: values.email.trim() } : {}),
          ...(values.password ? { password: values.password } : {}),
        })}
        createMutation={createRegistro}
        updateMutation={updateRegistro}
        titleCreate="Crear registro"
        titleEdit="Editar registro"
        descriptionCreate="Completa los datos del nuevo registro."
        descriptionEdit="Actualiza los datos del registro y guarda los cambios."
        errorCreate="No se pudo crear el registro."
        errorEdit="No se pudo guardar el registro."
      />
    );
  }

  return (
    <EntityDialog
      entity={null}
      open={open}
      onOpenChange={onOpenChange}
      token={token}
      schema={usuarioFormSchema}
      fields={[
        { name: "username", label: "Username" },
        { name: "nombre", label: "Nombre" },
        { name: "email", label: "Email", col: 6 },
        {
          name: "rol_id",
          label: "Rol",
          type: "combobox",
          placeholder: "Selecciona un rol",
          options: rolOptions,
          col: 6,
        },
        { name: "password", label: "Contraseña", type: "password" },
      ]}
      getId={(u) => u.id}
      toFormValues={() => emptyValues}
      emptyValues={emptyValues}
      toCreatePayload={(values: UsuarioFormValues) => ({
        username: values.username,
        nombre: values.nombre,
        rol_id: values.rol_id,
        password: values.password,
        ...(values.email?.trim() ? { email: values.email.trim() } : {}),
      })}
      // Nunca se llama en este branch (entity siempre es null aca), pero
      // EntityDialog exige el prop igual.
      toUpdatePayload={(values: UsuarioFormValues) => ({
        username: values.username,
        nombre: values.nombre,
        rol_id: values.rol_id,
        ...(values.email?.trim() ? { email: values.email.trim() } : {}),
      })}
      createMutation={createRegistro}
      updateMutation={updateRegistro}
      titleCreate="Crear registro"
      titleEdit="Editar registro"
      descriptionCreate="Completa los datos del nuevo registro."
      descriptionEdit="Actualiza los datos del registro y guarda los cambios."
      errorCreate="No se pudo crear el registro."
      errorEdit="No se pudo guardar el registro."
    />
  );
}
