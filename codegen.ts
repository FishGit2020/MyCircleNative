import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'schema.graphql',
  generates: {
    'packages/shared/src/graphql/generated.ts': {
      plugins: ['typescript'],
      config: {
        avoidOptionals: false,
        immutableTypes: false,
        scalars: {
          JSON: 'Record<string, unknown>',
        },
      },
    },
  },
  ignoreNoDocuments: true,
};

export default config;
