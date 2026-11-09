import path from 'path';
import { config as loadEnv } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

loadEnv({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
  schema: path.join(__dirname, 'prisma/schema.prisma'),
  migrations: {
    path: path.join(__dirname, 'prisma/migrations'),
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
