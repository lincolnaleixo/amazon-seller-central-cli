import { test, expect } from "bun:test";
import { connection, parseArgs } from "./amazon-seller-central.js";

test("parses account and marketplace options without executing the CLI", () => {
  const parsed = parseArgs(["search", "wireless", "charger", "--account", "sample", "--marketplace", "CA"]);
  expect(parsed.command).toBe("search");
  expect(parsed.args).toEqual(["wireless", "charger"]);
  expect(parsed.flags).toEqual({ account: "sample", marketplace: "CA" });
});

test("builds configurable connection settings from generic environment values", () => {
  const conn = connection(
    { env: "beta", account: "flag-account", marketplace: "GB" },
    { SELLERFIELD_BETA_API_KEY: "test-key", SELLERFIELD_ACCOUNT: "env-account" },
  );
  expect(conn.environment).toBe("beta");
  expect(conn.account).toBe("flag-account");
  expect(conn.marketplace).toBe("GB");
});
