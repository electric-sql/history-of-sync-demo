export default {
  schema: "./server/db/schema.js",
  out: "./server/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    connectionString:
      process.env.DATABASE_URL ||
      `postgres://${process.env.DB_USER || "postgres"}:${process.env.DB_PASSWORD || "password"}@${process.env.DB_HOST || "localhost"}:${process.env.DB_PORT || "54321"}/${process.env.DB_NAME || "electric"}`,
  },
}
