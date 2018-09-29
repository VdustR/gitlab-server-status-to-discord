# GitLab Daily Script

A script to push GitLab server status to Discord webhook.

## Dependencies

* `node` >= `10.7.0`
* `yarn` >= `1.7.0`

## Configuration

Fill your configuration into `.env.local`.

You can check [.env](.env) to learn the options to set.

```bash
vi .env.local

// .env.local
DISCORD_WEBHOOK=https://discordapp.com/api/webhooks/12345/abcde
GITLAB_BACKUP_DIRECTORY=/path/to/gitlab/data/backups
```

## Usage

Install modules:

```bash
yarn
```

Execute:

```bash
./run.sh
```

Add a plan executing the shell script via `crontab -e`:

```
0 9 * * * bash -c 'source /root/.bashrc && /path/to/gitlab-daily-script/run.sh'
```
