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


// scripts/swagger.ts
import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'My API',
    description: 'Auto-generated Swagger docs',
    version: '1.0.0',
  },
  host: 'localhost:3000',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['./src/routes/index.ts']; // Adjust to your entry route file

swaggerAutogen({ openapi: '3.0.0' })(outputFile, endpointsFiles, doc);
