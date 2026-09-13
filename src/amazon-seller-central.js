#!/usr/bin/env bun

const URLS = {
  production: "https://sellerfield.com/api",
  beta: "https://beta.sellerfield.com/api",
};

function fail(message, details) {
  if (details !== undefined) console.error(JSON.stringify(details, null, 2));
  console.error(message);
  process.exit(1);
}

function parseArgs(argv) {
  const positional = [];
  const flags = {};
  const booleanFlags = new Set(["json", "force-refresh", "all-sources"]);
  for (let index = 0; index < argv.length; index += 1) {
    const value = argv[index];
    if (!value.startsWith("--")) {
      positional.push(value);
      continue;
    }
    const name = value.slice(2);
    if (booleanFlags.has(name)) flags[name] = true;
    else {
      const next = argv[++index];
      if (!next || next.startsWith("--")) fail(`--${name} requires a value`);
      flags[name] = next;
    }
  }
  return { command: positional.shift() || "status", args: positional, flags };
}

function connection(flags) {
  const environment = flags.env || "production";
  if (!(environment in URLS)) fail("--env must be production or beta");
  const key = environment === "beta"
    ? process.env.SELLERFIELD_BETA_API_KEY
    : process.env.SELLERFIELD_API_KEY || process.env.SELLERFIELD_PRODUCTION_API_KEY;
  if (!key) fail(`SellerField ${environment} API key is missing; run through system-vault run sellerfield`);
  return { baseUrl: URLS[environment], key, environment };
}

async function request(conn, method, path, body, timeout = 60_000) {
  let response;
  try {
    response = await fetch(`${conn.baseUrl}${path}`, {
      method,
      headers: {
        "X-Api-Key": conn.key,
        accept: "application/json",
        ...(body === undefined ? {} : { "content-type": "application/json" }),
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
      signal: AbortSignal.timeout(timeout),
    });
  } catch (error) {
    fail(`SellerField is unreachable at ${conn.baseUrl}`, error instanceof Error ? error.message : String(error));
  }
  const text = await response.text();
  let payload = {};
  try { payload = text ? JSON.parse(text) : {}; }
  catch { payload = { error: text.slice(0, 500) }; }
  if (!response.ok) fail(`SellerField HTTP ${response.status}`, payload);
  return payload?.data ?? payload;
}

function sourceMetadata(keyword, sourceName) {
  return (keyword?.sources || []).find((source) => source?.type === sourceName)?.metadata || {};
}

function formatStatus(data, conn) {
  const sources = Array.isArray(data.availableSources) ? data.availableSources.join(", ") : "none";
  return [
    `SellerField: ${conn.environment}`,
    `Browser relay: ${data.connected ? "connected" : "not connected"}`,
    `Message: ${data.message || "—"}`,
    `Sources: ${sources}`,
    "Note: relay connectivity does not prove the current Seller Central tab is authorized.",
  ].join("\n");
}

function formatSearch(data, conn) {
  const stats = data.stats || {};
  const keywords = Array.isArray(data.keywords) ? data.keywords : [];
  const lines = [
    `Seed: ${data.seed || "—"}`,
    `SellerField: ${conn.environment}`,
    `Marketplace: ${data.marketplace || "US"}`,
    `Keywords: ${data.keywordCount ?? keywords.length}`,
    `Duration: ${stats.durationMs ? `${(stats.durationMs / 1000).toFixed(1)}s` : "—"}`,
    `Cached: ${data.cached ? `yes (${data.cachedAt || "time unavailable"})` : "no"}`,
  ];
  if (Array.isArray(stats.failedSources) && stats.failedSources.length) {
    lines.push(`Failed sources: ${stats.failedSources.join(", ")}`);
  }
  if (keywords.length === 0) {
    lines.push("Warning: zero POE keywords is not proof of zero demand; verify the authenticated browser session.");
    return lines.join("\n");
  }
  lines.push("", "Top results:");
  for (const keyword of keywords.slice(0, 40)) {
    const poe = sourceMetadata(keyword, "poe-search");
    const details = [
      poe.parentNiche ? `niche=${poe.parentNiche}` : null,
      poe.parentSearchVolume ? `niche volume=${poe.parentSearchVolume}` : null,
      poe.unitsSold ? `units=${poe.unitsSold}` : null,
      poe.growth ? `growth=${poe.growth}` : null,
      keyword.strength !== undefined ? `strength=${keyword.strength}` : null,
    ].filter(Boolean);
    lines.push(`- ${keyword.keyword}${details.length ? ` — ${details.join("; ")}` : ""}`);
  }
  return lines.join("\n");
}

const { command, args, flags } = parseArgs(process.argv.slice(2));
for (const name of Object.keys(flags)) {
  if (!["json", "force-refresh", "all-sources", "timeframe", "env"].includes(name)) {
    fail(`unknown flag: --${name}`);
  }
}
const conn = connection(flags);

if (command === "status") {
  if (args.length) fail("status takes no arguments");
  const data = await request(conn, "GET", "/keyword-research/status?account=lln");
  console.log(flags.json ? JSON.stringify(data, null, 2) : formatStatus(data, conn));
} else if (command === "search") {
  const seed = args.join(" ").trim();
  if (seed.length < 2) fail("search requires a seed of at least two characters");
  const timeframe = flags.timeframe || "1m";
  if (!new Set(["1m", "2m", "3m"]).has(timeframe)) fail("--timeframe must be 1m, 2m, or 3m");
  const sources = flags["all-sources"]
    ? ["amazon-search", "poe-search", "brand-analytics", "amazon-data"]
    : ["poe-search"];
  const data = await request(
    conn,
    "POST",
    "/keyword-research/run?account=lln",
    {
      seed,
      sources,
      marketplace: "US",
      timeframe,
      forceRefresh: Boolean(flags["force-refresh"]),
    },
    150_000,
  );
  console.log(flags.json ? JSON.stringify(data, null, 2) : formatSearch(data, conn));
} else {
  fail("unknown command; expected status or search");
}

