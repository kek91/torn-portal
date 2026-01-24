# Item Payment Checker - Setup Guide

This script checks for items received in the last 5 minutes from the Torn API, enabling automatic validation of premium feature payments.

## Requirements

- Node.js (already available in your project)
- Torn API key
- Optional: Discord webhook for notifications

## Setup

### 1. Get Your Torn API Key
- Go to https://www.torn.com/preferences.php#tab=api
- Generate an API key if you don't have one

### 2. Make Script Executable
```bash
chmod +x scripts/checkItemsReceived.js
```

### 3. Set Environment Variables

Create a `.env` file in the project root or configure them in your cron job:

```bash
export TORN_API_KEY="your_api_key_here"
export ITEMS_LOG_FILE="/path/to/items_received.json"
export DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/..." # Optional
```

## Usage

### Direct Execution
```bash
node scripts/checkItemsReceived.js YOUR_API_KEY
```

### With Environment Variable
```bash
TORN_API_KEY=your_api_key node scripts/checkItemsReceived.js
```

### With Custom Log File
```bash
TORN_API_KEY=your_api_key ITEMS_LOG_FILE=/var/log/torn-items.json node scripts/checkItemsReceived.js
```

## Cron Setup

### Example: Check every 5 minutes
```bash
*/5 * * * * cd /home/kek/repo/torn-portal && TORN_API_KEY="your_api_key" node scripts/checkItemsReceived.js >> /var/log/torn-item-check.log 2>&1
```

### Example: Check every minute (more frequent)
```bash
* * * * * cd /home/kek/repo/torn-portal && TORN_API_KEY="your_api_key" node scripts/checkItemsReceived.js >> /var/log/torn-item-check.log 2>&1
```

### Edit Crontab
```bash
crontab -e
```

Then add one of the above lines.

## Output

The script creates a JSON log file with:
- Items received in the last 5 minutes
- Timestamp of last check
- Any errors encountered

Example `items_received.json`:
```json
{
  "items": [
    {
      "eventId": "12345",
      "timestamp": 1706091234,
      "date": "2024-01-24T15:30:34.000Z",
      "log": "You received 1x Xanax"
    }
  ],
  "lastChecked": "2024-01-24T15:35:45.123Z",
  "itemCount": 1
}
```

## Discord Notifications

If you set `DISCORD_WEBHOOK_URL`, the script will send a notification whenever items are received:

```bash
export DISCORD_WEBHOOK_URL="https://discordapp.com/api/webhooks/YOUR_WEBHOOK_ID/YOUR_TOKEN"
```

## Security Best Practices

1. **Never commit your API key** - Use environment variables or `.env` file (add to `.gitignore`)
2. **Restrict log file permissions** - The log file may contain sensitive info
3. **Use a separate API key** - Create a dedicated Torn API key just for this script if possible
4. **Validate in your app** - Always verify payments server-side before granting access

## Integration with Your App

From your Vue app, you could:
1. Read the `items_received.json` log periodically
2. Query your backend API which runs this script
3. Store payment records in a database for audit trail

Example backend endpoint:
```javascript
app.get('/api/check-premium-payment', async (req, res) => {
  const log = JSON.parse(fs.readFileSync(ITEMS_LOG_FILE));
  if (log.itemCount > 0 && log.items.some(item => item.log.includes('Xanax'))) {
    // Grant premium access
    res.json({ premium: true, items: log.items });
  } else {
    res.json({ premium: false });
  }
});
```

## Troubleshooting

### "API error: 401"
- Your API key is invalid or expired

### "API error: 7"
- You've hit the API rate limit, wait a moment and try again

### No items found
- Either no items were received, or they weren't received within the 5-minute window

### Permission denied when running from cron
- Ensure the user running cron has execute permissions on the script
- Make sure `ITEMS_LOG_FILE` path is writable by that user
