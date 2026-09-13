# amazon-seller-central-cli

A read-only CLI for Amazon Seller Central opportunity research through a configured API relay.

## Install

Requires [Bun](https://bun.sh). Clone this repository, run `bun install`, then run `bun run check`.

## Use

The executable is `./bin/amazon-seller-central-cli`.

Commands:

- `status` checks relay availability.
- `search <seed>` runs the default opportunity research.
- `search <seed> --all-sources` includes every supported research source.

All commands accept `--json`. Search also accepts `--force-refresh`, `--timeframe 1m|2m|3m`, and `--env production|beta`.

## Environment

Credentials are read only from environment variables. Never commit a `.env` file or put secret values in arguments.

- `SELLERFIELD_API_KEY` for the production relay.
- `SELLERFIELD_PRODUCTION_API_KEY` as an explicit production alternative.
- `SELLERFIELD_BETA_API_KEY` for the beta relay.
- `SELLERFIELD_ACCOUNT` to select the target account; it defaults to `default`.

## Check

`bun run check` performs a non-executing JavaScript syntax check. It does not need credentials or make network requests.

## License

MIT. See [LICENSE](LICENSE).
