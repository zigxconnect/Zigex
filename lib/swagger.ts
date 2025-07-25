// lib/swagger.ts
import { createSwaggerSpec } from 'next-swagger-doc';

export const getApiDocs = async () => {
  const spec = createSwaggerSpec({
    apiFolder: 'app/api', // App Router folder
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'My API',
        version: '1.1.0',
      },
    },
  });
  return spec;
};
