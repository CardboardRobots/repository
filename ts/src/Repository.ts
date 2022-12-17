export interface Model {
  _id: string;
}

export interface WithId<T> {
  _id: T;
}

export type IdType<T> = T extends WithId<infer TId> ? TId : unknown;

export type OptionalId<TModel extends WithId<any>> = Omit<TModel, "_id"> & {
  _id?: IdType<TModel>;
};

export interface ListResult<T> {
  count: number;
  data: T[];
}

export interface Page {
  limit?: number;
  offset?: number;
}

export type Sort<T> = {
  [Property in keyof T]?: 1 | 0 | -1;
};

export interface Filter {}

export interface Repository<TModel extends Model, TFilter extends Filter> {
  getList(
    filter: TFilter,
    page?: Page,
    sort?: Sort<TModel>
  ): Promise<ListResult<TModel>>;

  getById(id: string): Promise<TModel | null>;

  create(data: OptionalId<TModel>): Promise<string>;

  update(id: string, data: TModel): Promise<boolean>;

  delete(id: string): Promise<void>;
}
