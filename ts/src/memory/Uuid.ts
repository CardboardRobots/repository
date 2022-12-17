import { OptionalId } from "../Repository";

export function Uuid() {
  return crypto.randomUUID();
}

export type DataToObjectId<TData extends OptionalId<any>[]> = {
  [Property in keyof TData]: string;
};
