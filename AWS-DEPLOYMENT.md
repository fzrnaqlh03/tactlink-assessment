# Task 4: AWS deployment plan

This is the written-plan option allowed by the assignment. No AWS resources have been created.

## Architecture and services

```text
Expo mobile app ──┐
                 ├── HTTPS ── EC2: Caddy ── localhost:4000 ── Apollo Server
React on Vercel ──┘                                              │
                                                     In-memory users/tasks
```

- One Linux `t3.micro` EC2 instance in `us-east-1` runs the existing Node.js backend.
- An 8 GB gp3 EBS volume holds the operating system and application files.
- One Elastic IP provides a stable public address. Point an existing domain's subdomain, such as `api.your-domain.com`, to it.
- Caddy forwards HTTPS requests to Node.js and manages the TLS certificate.
- A systemd service starts the backend on boot and restarts it if it stops.

Keep one backend process because users, sessions and tasks are stored in memory. Restarting it clears these records and restores the demo account. EC2 lets this assignment run as written; separate Lambda instances would not share these arrays.

## Deployment steps

1. Launch an Ubuntu EC2 instance with the configuration above. Use T3 Standard CPU credit mode for this small demo to avoid surplus CPU credit charges. Attach an Elastic IP.
2. In its security group, allow SSH on port 22 only from your own IP. Allow public HTTP/HTTPS on ports 80 and 443. Leave port 4000 closed to the internet.
3. Connect using SSH. Install Node.js 24 LTS, npm, Git and Caddy. Clone the submitted repository into `/home/ubuntu/tactlink`.
4. Run `npm ci` inside `/home/ubuntu/tactlink/backend`. Create `/etc/systemd/system/todo-backend.service`:

```ini
[Unit]
Description=To-do GraphQL backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/tactlink/backend
# Use the actual Node path reported by: command -v node
ExecStart=/usr/bin/node src/index.js
Environment=PORT=4000
Environment=NODE_ENV=production
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

5. Run `sudo systemctl daemon-reload` and `sudo systemctl enable --now todo-backend`. Check `sudo systemctl status todo-backend`.
6. Point the API subdomain's DNS A record to the Elastic IP. Put this in `/etc/caddy/Caddyfile`, replacing the example domain:

```caddyfile
api.your-domain.com {
    reverse_proxy 127.0.0.1:4000
}
```

7. Reload Caddy with `sudo systemctl reload caddy`. Caddy needs the domain to resolve to the instance and ports 80/443 reachable to set up HTTPS. See [Caddy automatic HTTPS](https://caddyserver.com/docs/automatic-https).
8. Set `VITE_API_URL=https://api.your-domain.com/` in Vercel and redeploy the web app. Set `EXPO_PUBLIC_API_URL` to that same URL for mobile and restart Expo. These URLs are public configuration, not secrets.
9. Verify login, task creation, viewing and deletion through the public web app. Create two API accounts and confirm their task lists are separate. The backend's automated tests cover the same isolation rules locally.

The Vercel page needs an HTTPS backend to avoid browser mixed-content blocking. Apollo's standalone server already permits cross-origin requests; each task request must still supply a valid token. Dummy authentication is for this assessment only.

## Estimated cost

Estimate checked on 24 September 2026, using Linux on-demand pricing in US East (N. Virginia), 730 running hours per month and no free-tier credits:

| Item | Calculation | Monthly estimate (USD) |
| --- | --- | ---: |
| EC2 t3.micro | 730 × $0.0104/hour | $7.59 |
| 8 GB gp3 EBS | 8 × $0.08/GB-month | $0.64 |
| One public IPv4 address | 730 × $0.005/hour | $3.65 |
| **Estimated base total** | | **$11.88** |

Sources: [AWS T3 pricing](https://aws.amazon.com/ec2/instance-types/t3/), [AWS EBS volume pricing](https://aws.amazon.com/ebs/volume-types/), and [AWS public IPv4 pricing](https://aws.amazon.com/vpc/pricing/).

This estimate excludes taxes, domain registration, paid DNS hosting, data transfer charges beyond applicable allowances, and backups. It assumes an existing domain/DNS provider and a small demonstration workload. Confirm the selected region and current rates in the [AWS Pricing Calculator](https://calculator.aws/).

After the assessment, terminate the instance, remove any retained EBS volumes and release the Elastic IP to stop ongoing charges.
