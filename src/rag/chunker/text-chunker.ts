import { Injectable } from '@nestjs/common';

export interface Chunk {
  index: number;
  content: string;
}

// 한국어+영어 혼합 특성상 토큰 대신 문자 수 기준으로 청킹
const CHUNK_SIZE = 500;
const CHUNK_OVERLAP = 50;

@Injectable()
export class TextChunker {
  split(text: string): Chunk[] {
    const chunks: Chunk[] = [];
    let start = 0;
    let index = 0;

    while (start < text.length) {
      const end = start + CHUNK_SIZE;
      chunks.push({ index, content: text.slice(start, end) });
      start = end - CHUNK_OVERLAP;
      index++;
    }

    return chunks;
  }
}
