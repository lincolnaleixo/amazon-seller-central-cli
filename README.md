# amazon-seller-central-cli

Amazon Seller Central research CLI

## Install

## Use

## License

MIT.
# amazon-seller-central-cli

A JavaScript CLI for read-only Amazon Seller Central opportunity research through a configured authenticated relay.

## Install

Requires Bun. Clone this repository, run `bun install`, then run `bun run check`.

## Use

The executable is `./bin/amazon-seller-central-cli`. The default invocation is:

```bash
system-vault run sellerfield -- ./bin/amazon-seller-central-cli help
```

Commands: `status`, `search <seed>`, and `search <seed> --all-sources`; optional flags include `--json`, `--force-refresh`, `--timeframe`, and `--env`.

## Environment

Credentials are read only from environment variables. Inject them with your organization's secret broker; never commit a `.env` file or put secret values in arguments.

`SELLERFIELD_API_KEY`; `SELLERFIELD_BETA_API_KEY` or `SELLERFIELD_PRODUCTION_API_KEY` may be used for explicit deployment selection.

## License

MIT. See [LICENSE](LICENSE).
