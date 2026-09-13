# amazon-seller-central-cli

A read-only CLI for Amazon Seller Central opportunity research through a configured API relay.

## Install

Requires [Bun](https://bun.sh). Clone this repository, run `bun install`, then run `bun run check`.

## Commands

The executable is `./bin/amazon-seller-central-cli`.

```text
amazon-seller-central-cli status [options]
amazon-seller-central-cli search <seed> [options]
amazon-seller-central-cli help
```

`status` checks relay connectivity and available sources. `search` runs
keyword research for the supplied seed. Search uses the POE source by default;
`--all-sources` enables all supported sources. Results can be printed as JSON
with `--json`. `--force-refresh` bypasses cached results.

Options include `--account <value>`, `--marketplace <value>`,
`--env <production|beta>`, and `--timeframe <1m|2m|3m>`.

## Environment

Credentials are read only from environment variables. Never commit a `.env` file or put secret values in arguments.

- `SELLER_CENTRAL_API_URL` and `SELLER_CENTRAL_API_KEY` for the production relay.
- `SELLER_CENTRAL_BETA_API_URL` and `SELLER_CENTRAL_BETA_API_KEY` for the beta relay; production values are fallbacks when beta-specific values are absent.
- `SELLER_CENTRAL_ACCOUNT` to select the target account; it defaults to `default`.
- `SELLER_CENTRAL_MARKETPLACE` to select the default marketplace; it defaults to
  `US`.

## Check

`bun run check` performs a non-executing JavaScript syntax check and runs the
credential-free unit tests. It does not make network requests.

## License

MIT. See [LICENSE](LICENSE).
