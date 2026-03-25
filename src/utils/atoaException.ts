import { AtoaException } from '../types/error';

export function atoaException(e: unknown): AtoaException {
  if (e instanceof AtoaException) { return e; }
  return new AtoaException('custom', e instanceof Error ? e.message : String(e));
}
