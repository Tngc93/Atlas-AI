export type TestEnvironment = {
  pooledUrl: string;
  directUrl: string;
  endpointId: string;
};

export type BaselineDeployEnvironment = TestEnvironment & {
  schemaName: "preview_app";
};

export type PostgresTestContext = {
  schemaName: string;
  databaseUrl: string;
  directUrl: string;
  cleanup: () => Promise<void>;
};

export function validatePostgresTestEnvironment(env?: NodeJS.ProcessEnv): TestEnvironment;
export function buildSchemaDatabaseUrl(databaseUrl: string, schemaName: string): string;
export function buildPreviewSchemaDatabaseUrl(databaseUrl: string): string;
export function validateBaselineDeployEnvironment(env?: NodeJS.ProcessEnv): BaselineDeployEnvironment;
export function createPostgresTestContext(
  suiteName: string,
  kind?: "integration" | "e2e",
): Promise<PostgresTestContext>;
export function cleanupPostgresTestSchema(schemaName: string): Promise<void>;
