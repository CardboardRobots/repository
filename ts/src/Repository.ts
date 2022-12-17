export interface Model {}

export type WithId<TModel extends Model, TId> = TModel & {
  _id: TId;
};

export type StringId<TModel extends Model> = TModel & {
  _id: string;
};

export type IdType<T> = T extends WithId<any, infer TId> ? TId : unknown;

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
  ): Promise<ListResult<StringId<TModel>>>;

  getById(id: string): Promise<StringId<TModel> | null>;

  create(data: TModel): Promise<string>;

  update(id: string, data: StringId<TModel>): Promise<boolean>;

  delete(id: string): Promise<void>;
}
