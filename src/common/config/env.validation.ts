import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),
  DATABASE_URL: Joi.string().required(),
  QDRANT_URL: Joi.string().uri().required(),
  QDRANT_COLLECTION: Joi.string().default('documents'),
  REDIS_URL: Joi.string().required(),
  OPENAI_API_KEY: Joi.string().required(),
});
