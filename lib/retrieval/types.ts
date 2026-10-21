export type RetrievedSource = {
  id: string;
  title: string;
  url: string;
  publisher?: string;
  date?: string | null;
  snippet?: string;
};

export interface SearchProvider {
  readonly name: string;
  search(query: string): Promise<RetrievedSource[]>;
}
