export interface StyleTokenTarget {
  scope: string;
  part?: string;
  selector?: string;
}

export interface StyleTokenMeta {
  name: string;
  description: string;
  fallback: string;
  category?: string;
  preview?: string | false;
  targets?: StyleTokenTarget[];
}
