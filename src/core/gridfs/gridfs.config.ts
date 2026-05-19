export interface IGridfsConfig {
  buckets: IGridfsBucketConfig[];
}

export interface IGridfsBucketConfig {
  name: string;
  indexes?: IGridfsBucketIndex[];
}

export interface IGridfsBucketIndex {
  filename?: boolean;
  metadata?: string[];
}