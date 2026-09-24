# Task 4: AWS deployment

The GraphQL backend is deployed on AWS EC2, completing the actual-deployment option in the assignment.

- Backend: https://52.73.18.155/
- Web app: https://tactlink-assessment.vercel.app/
- Region: US East (N. Virginia), `us-east-1`
- Instance: `i-0bdb5fc64e59d9c7f`, named `tactlink-assessment`
- Instance type: `t3.micro`, Ubuntu 24.04, 8 GB encrypted gp3 storage
- Elastic IP allocation: `eipalloc-02eddacb8a44a43ab`
- Security group: `sg-0049d88735726d6b5`

## Architecture

```text
Expo mobile app ──┐
                 ├── HTTPS ── EC2: Nginx ── localhost:4000 ── Apollo Server
React on Vercel ──┘                                                │
                                                       In-memory users/tasks
```

One Node.js 24 process runs the backend, managed by systemd so it starts after a reboot. Nginx handles HTTPS and forwards requests to Apollo Server. Port 4000 is not open to the internet.

The Elastic IP keeps the address stable. A Let's Encrypt IP-address certificate provides trusted HTTPS without buying a domain. Certbot checks for renewal twice daily and reloads Nginx after successful renewal. These certificates last about six days, so the renewal timer must stay enabled. See [Let's Encrypt IP certificates](https://letsencrypt.org/2026/03/11/shorter-certs-certbot).

Port 443 serves the API. Port 80 redirects to HTTPS and serves certificate validation files. SSH on port 22 is restricted to the deployment computer's public IP (`103.232.219.65/32` at setup).

## Deployment steps used

1. Created a dedicated SSH key and security group in the default VPC.
2. Launched one Ubuntu `t3.micro` with an encrypted 8 GB gp3 disk, required IMDSv2 and Standard CPU credit mode.
3. Assigned the Elastic IP and installed Node.js 24 from the official Node.js downloads, verifying its published checksum.
4. Uploaded the repository's `backend/` folder to `/opt/tactlink/backend` and ran `npm ci --omit=dev`.
5. Enabled the `todo-backend` systemd service, running as the unprivileged `ubuntu` user.
6. Installed Nginx and Certbot 5.8, obtained an IP-address certificate using the `shortlived` profile and webroot validation, and enabled `tactlink-cert-renew.timer`.
7. Set Vercel's root directory to `web`, framework to Vite, and `VITE_API_URL` to `https://52.73.18.155/` for production and preview. Deployed the web app.

## Server configuration

The service at `/etc/systemd/system/todo-backend.service` is:

```ini
[Unit]
Description=Assessment GraphQL backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/opt/tactlink/backend
ExecStart=/usr/local/bin/node src/index.js
Environment=PORT=4000
Environment=NODE_ENV=production
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Nginx configuration is at `/etc/nginx/sites-available/tactlink`. It proxies HTTPS requests to `http://127.0.0.1:4000`, uses certificates from `/etc/letsencrypt/live/52.73.18.155/`, and serves ACME challenge files from `/var/www/certbot` over port 80.

The renewal timer runs at midnight and noon with up to 30 minutes of random delay. Its service runs `/opt/certbot/bin/certbot renew --quiet --deploy-hook "systemctl reload nginx"`.

## Connect and manage

The SSH private key is stored locally at `~/.ssh/tactlink-assessment`; it is not in GitHub.

```sh
# Connect from the allowed public IP address.
ssh -i ~/.ssh/tactlink-assessment ubuntu@52.73.18.155

# Run these commands on the EC2 server.
sudo systemctl status todo-backend nginx tactlink-cert-renew.timer
sudo journalctl -u todo-backend -n 50 --no-pager
sudo systemctl list-timers tactlink-cert-renew.timer

# Test renewal without replacing the live certificate.
sudo /opt/certbot/bin/certbot renew --dry-run --run-deploy-hooks --no-random-sleep-on-renew
```

If your public IP changes, update only the security group's SSH source to your new IP with `/32`. The public web app and mobile API continue to work across different networks.

To update backend code, upload the updated `backend/` files to `/opt/tactlink/backend`, run `npm ci --omit=dev` there, then run `sudo systemctl restart todo-backend`. Do not upload local `.env` files, `node_modules`, or private keys.

## Verification

- Both AWS instance health checks passed.
- Public GraphQL requests succeed over HTTPS with normal certificate validation.
- The mobile GraphQL helper passed login, create, list and delete against the hosted API.
- Live Chrome checks passed for login, invalid credentials, task creation, loading saved tasks, deletion, failed-request handling and logout.
- A simulated certificate renewal, including the Nginx reload hook, passed.

Authentication and data storage remain the assessment's dummy auth and in-memory implementation. Restarting the backend clears tasks, new accounts and sessions, and restores the demo account. Use assessment data only.

## Estimated cost

Estimate checked on 24 September 2026, using Linux on-demand pricing in US East (N. Virginia), 730 running hours per month and no free-tier credits:

| Item | Calculation | Monthly estimate (USD) |
| --- | --- | ---: |
| EC2 t3.micro | 730 × $0.0104/hour | $7.59 |
| 8 GB gp3 EBS | 8 × $0.08/GB-month | $0.64 |
| One public IPv4 address | 730 × $0.005/hour | $3.65 |
| **Estimated base total** | | **$11.88** |

Sources: [AWS T3 pricing](https://aws.amazon.com/ec2/instance-types/t3/), [AWS EBS volume pricing](https://aws.amazon.com/ebs/volume-types/), and [AWS public IPv4 pricing](https://aws.amazon.com/vpc/pricing/).

This estimate excludes taxes, data transfer charges beyond applicable allowances, and backups. No domain, load balancer or database was purchased. It assumes a small demonstration workload. Confirm the selected region and current rates in the [AWS Pricing Calculator](https://calculator.aws/).

## Remove after the assessment

In the AWS console, select `us-east-1`, terminate instance `i-0bdb5fc64e59d9c7f` and release Elastic IP `eipalloc-02eddacb8a44a43ab`. Its root disk is configured to delete on termination; confirm no assessment volumes remain. The dedicated security group and key-pair registration can then be deleted.

Stopping the instance alone does not remove storage or Elastic IP charges. Removing these resources makes the live app's backend unavailable.
