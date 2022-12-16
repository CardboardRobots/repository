export interface Document {
  _id: string;
  [key: string]: any;
}

export type OptionalId<TDocument extends Document> = Omit<TDocument, "_id"> & {
  _id?: string;
};

export interface ListResult<TDocument extends Document> {
  count: number;
  data: TDocument[];
}

export interface Page {
  limit?: number;
  offset?: number;
}

export type Sort<TDocument extends Document> = {
  [Property in keyof TDocument]?: 1 | 0 | -1;
};

export interface Filter extends Record<string, unknown> {}

export interface Repository<
  TDocument extends Document,
  TFilter extends Filter
> {
  getList(
    filter: TFilter,
    page?: Page,
    sort?: Sort<TDocument>
  ): Promise<ListResult<TDocument>>;

  getById(id: string): Promise<TDocument | null>;

  create(data: OptionalId<TDocument>): Promise<string>;

  update(id: string, data: TDocument): Promise<boolean>;

  delete(id: string): Promise<void>;
}
