import { getTableName, SQL, is } from "drizzle-orm";
import { PgDialect, getTableConfig, PgTable } from "drizzle-orm/pg-core";
import * as schema from "../../db/schema";
import type postgres from "postgres";
async function createTable(sql: postgres.Sql, table: PgTable) {
  const config = getTableConfig(table);
  const quote = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const dialect = new PgDialect();
  const columns = config.columns.map((column) => {
    let value = `${quote(column.name)} ${column.getSQLType()}`;
    if (column.notNull) value += " NOT NULL";
    if (column.primary) value += " PRIMARY KEY";
    if (column.isUnique) value += " UNIQUE";
    if (column.default !== undefined) {
      const literal =
        column.default instanceof SQL
          ? dialect.sqlToQuery(column.default).sql
          : column.getSQLType() === "jsonb"
            ? `'${JSON.stringify(column.default).replaceAll("'", "''")}'`
            : Array.isArray(column.default)
              ? "'{}'"
              : typeof column.default === "string"
                ? `'${column.default.replaceAll("'", "''")}'`
                : String(column.default);
      value += ` DEFAULT ${literal}`;
    }
    return value;
  });
  const foreign = config.foreignKeys.map((key) => {
    const ref = key.reference();
    return `FOREIGN KEY (${ref.columns.map((column) => quote(column.name)).join(",")}) REFERENCES ${quote(getTableName(ref.foreignTable))} (${ref.foreignColumns.map((column) => quote(column.name)).join(",")})${key.onDelete ? ` ON DELETE ${key.onDelete}` : ""}${key.onUpdate ? ` ON UPDATE ${key.onUpdate}` : ""}`;
  });
  const checks = config.checks.map(
    (check) =>
      `CONSTRAINT ${quote(check.name)} CHECK (${dialect.sqlToQuery(check.value).sql})`,
  );
  const primary = config.primaryKeys.map(
    (key) =>
      `PRIMARY KEY (${key.columns.map((column) => quote(column.name)).join(",")})`,
  );
  await sql.unsafe(
    `CREATE TABLE ${quote(config.name)} (${[...columns, ...foreign, ...checks, ...primary].join(", ")})`,
  );
  for (const index of config.indexes) {
    const value = index.config;
    await sql.unsafe(
      `CREATE ${value.unique ? "UNIQUE " : ""}INDEX ${quote(value.name!)} ON ${quote(config.name)} (${value.columns.map((column) => (column instanceof SQL ? dialect.sqlToQuery(column).sql : quote((column as { name: string }).name))).join(",")})${value.where ? ` WHERE ${dialect.sqlToQuery(value.where).sql}` : ""}`,
    );
  }
}
export async function createAccountTestSchema(
  sql: postgres.Sql,
  options: { account?: boolean; giftCards?: boolean } = {},
) {
  // Build only a disposable test database directly from current declarations.
  // This stays independent of locally generated or unapplied application migrations.
  const tables = Object.values(schema)
    .filter((value) => is(value, PgTable))
    .filter((table) => {
      const name = getTableName(table);
      return (
        !(
          options.account === false && /^(account_|circle_|bespoke_)/.test(name)
        ) && !(options.giftCards === false && name.startsWith("gift_card"))
      );
    });
  const pending = new Map<string, PgTable>(
    tables.map((table) => [getTableName(table), table]),
  );
  while (pending.size) {
    let progress = false;
    for (const [name, table] of pending) {
      const dependencies = getTableConfig(table).foreignKeys.map((key) =>
        getTableName(key.reference().foreignTable),
      );
      if (dependencies.some((name) => pending.has(name))) continue;
      await createTable(sql, table);
      pending.delete(name);
      progress = true;
    }
    if (!progress) throw new Error("Unresolved test schema dependencies");
  }
}
