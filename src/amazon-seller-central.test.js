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
    {
      SELLER_CENTRAL_BETA_API_KEY: "test-key",
      SELLER_CENTRAL_BETA_API_URL: "https://relay.example.test/api",
      SELLER_CENTRAL_ACCOUNT: "env-account",
    },
  );
  expect(conn.environment).toBe("beta");
  expect(conn.account).toBe("flag-account");
  expect(conn.marketplace).toBe("GB");
});
