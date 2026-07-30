import { SetMetadata } from '@nestjs/common';

export const REQUIRED_URL_KEY = 'requiredUrl';

export interface RequiredUrl {
  grupoPath: string;
  urlPath: string;
}

/** Marca un controller/handler como accesible solo para roles con esta Url habilitada (vía RolUrl). */
export const RequireUrl = (grupoPath: string, urlPath: string) =>
  SetMetadata(REQUIRED_URL_KEY, { grupoPath, urlPath } satisfies RequiredUrl);
