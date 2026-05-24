export const EMBEDDER = Symbol('EMBEDDER');

export interface EmbedderInterface {
  embedMany(texts: string[]): Promise<number[][]>;
  embedOne(text: string): Promise<number[]>;
}
