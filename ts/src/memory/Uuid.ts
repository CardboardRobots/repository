export function Uuid() {
  return crypto.randomUUID();
}

export type DataToObjectId<TData extends any[]> = {
  [Property in keyof TData]: string;
};
