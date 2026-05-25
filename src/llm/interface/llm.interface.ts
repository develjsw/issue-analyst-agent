import type { BaseChatModel } from '@langchain/core/language_models/chat_models';

export const LLM = Symbol('LLM');

export type LlmInterface = BaseChatModel;
