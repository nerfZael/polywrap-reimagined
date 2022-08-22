export type Result<T, E = undefined> =
  | { ok: true; value: T }
  | { ok: false; error: E | undefined };

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Ok = <T>(data: T): Result<T, never> => {
  return { ok: true, value: data };
};

// eslint-disable-next-line @typescript-eslint/naming-convention
export const Err = <E>(error?: E): Result<never, E> => {
  return { ok: false, error };
};
