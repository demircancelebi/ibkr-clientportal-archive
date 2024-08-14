# Interactive Brokers Client Portal Archive

This repository automatically tracks and stores updates to the Interactive Brokers Client Portal Gateway.

## Purpose

The purpose of this repository is to:

1. Automatically download the latest version of the Interactive Brokers Client Portal Gateway.
2. Store and version this software for reference and potential rollback purposes.
3. Provide a transparent, public record of changes to the Client Portal Gateway over time.

## Repository Structure

```
ibkr-clientportal-archives/
├── clientportal/
│   ├── latest/
│   │   └── clientportal.gw.zip
│   ├── versions/
│   │   ├── YYYYMMDD-HHMMSS/
│   │   │   └── clientportal.gw.zip
│   │   └── ...
│   └── checksums.json
├── .github/
│   └── workflows/
│       └── check_update.yml
├── scripts/
│   └── update_checker.js
└── README.md
```

## Update Mechanism

This repository uses a GitHub Action to check for updates daily. If a new version is detected:

1. The new version is downloaded and its checksum is verified.
2. The new version is stored in both the `latest` folder and a new dated folder in `versions`.
3. The `checksums.json` file is updated with the new version's information.
4. Changes are automatically committed to the repository.

## Branch Protection and Contribution Policy

To maintain the integrity of this archive:

1. The main branch is protected.
2. Only the automated GitHub Action can push changes to the main branch.
3. Direct pushes and pull requests from contributors are not accepted.

These measures ensure that all updates come solely from the automated process checking the official Interactive Brokers source.

## Disclaimer

This repository is maintained for informational purposes only. It is not affiliated with, endorsed, or supported by Interactive Brokers. Users should always refer to the official Interactive Brokers website for the most up-to-date and official versions of their software.

## License

Please note that while this archival process is open source, the archived software (Interactive Brokers Client Portal Gateway) is subject to its own licensing terms. Refer to Interactive Brokers' official documentation for details on usage and distribution rights of their software.