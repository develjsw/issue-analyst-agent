import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  QDRANT_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().required(),
  // 임베딩 기능 도입 시 required로 전환
  OPENAI_API_KEY: Joi.string().allow('').default(''),
});
