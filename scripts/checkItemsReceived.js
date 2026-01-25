#!/usr/bin/env node

/**
 * Check for items received in the last 5 minutes from the Torn API
 * Useful for cron job validation of premium feature payments
 * 
 * Usage: node checkItemsReceived.js <API_KEY> [ITEMS_LOG_FILE]
 * 
 * Environment variables:
 *   TORN_API_KEY - Your Torn API key (if not passed as argument)
 *   ITEMS_LOG_FILE - Path to store received items log (default: ./items_received.json)
 *   DISCORD_WEBHOOK_URL - Optional Discord webhook for notifications
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const ITEMS_LOG_FILE = process.env.ITEMS_LOG_FILE || path.join(__dirname, 'items_received.json');
const CHECK_WINDOW_MINUTES = 1440; // 1440 minutes = 24 hours

/**
 * Fetch data from Torn API
 */
function fetchTornAPI(endpoint, apiKey) {
    return new Promise((resolve, reject) => {
        const url = `https://api.torn.com${endpoint}&key=${apiKey}&comment=torn-portal`;

        https.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => { data += chunk; });
            res.on('end', () => {
                if (res.statusCode !== 200) {
                    reject(new Error(`API error: ${res.statusCode} - ${data}`));
                    return;
                }
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(new Error(`Failed to parse API response: ${e.message}`));
                }
            });
        }).on('error', reject);
    });
}

/**
 * Parse item name and sender from event log
 * Format: "You were sent some <item> from <user>"
 */
function parseItemEvent(eventLog) {
    const match = eventLog.match(/You were sent some (.+) from (.+)$/);
    if (match) {
        return {
            item: match[1].trim(),
            sender: match[2].trim(),
            parsed: true,
        };
    }
    return {
        item: null,
        sender: null,
        parsed: false,
    };
}

/**
 * Filter items received in the last N minutes
 */
function filterRecentItems(events, minutesWindow) {
    const nowTimestamp = Math.floor(Date.now() / 1000);
    const windowSeconds = minutesWindow * 60;

    return events.filter(event => {
        const eventTime = event.timestamp;
        const timeDiff = nowTimestamp - eventTime;
        return timeDiff >= 0 && timeDiff <= windowSeconds;
    });
}

/**
 * Send Discord notification
 */
async function sendDiscordNotification(message) {
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) return;

    try {
        const data = JSON.stringify({ content: message });
        const url = new URL(webhookUrl);

        await new Promise((resolve, reject) => {
            const options = {
                hostname: url.hostname,
                path: url.pathname + url.search,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length,
                },
            };

            const req = https.request(options, (res) => {
                let responseData = '';
                res.on('data', (chunk) => { responseData += chunk; });
                res.on('end', () => {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve();
                    } else {
                        reject(new Error(`Discord webhook error: ${res.statusCode}`));
                    }
                });
            });

            req.on('error', reject);
            req.write(data);
            req.end();
        });
    } catch (error) {
        console.error('[Discord Notification Error]', error.message);
    }
}

/**
 * Load previous items log
 */
function loadItemsLog() {
    try {
        if (fs.existsSync(ITEMS_LOG_FILE)) {
            const data = fs.readFileSync(ITEMS_LOG_FILE, 'utf8');
            return JSON.parse(data);
        }
    } catch (error) {
        console.error('[Log Load Error]', error.message);
    }
    return { items: [], lastChecked: 0 };
}

/**
 * Save items log
 */
function saveItemsLog(log) {
    try {
        fs.writeFileSync(ITEMS_LOG_FILE, JSON.stringify(log, null, 2));
    } catch (error) {
        console.error('[Log Save Error]', error.message);
    }
}

/**
 * Main check function
 */
async function checkItemsReceived() {
    const apiKey = process.argv[2] || process.env.TORN_API_KEY;

    if (!apiKey) {
        console.error('Error: TORN_API_KEY not provided. Pass as argument or environment variable.');
        process.exit(1);
    }

    try {
        console.log(`[${new Date().toISOString()}] Checking for items received in last ${CHECK_WINDOW_MINUTES} minutes...`);

        // Fetch user events
        const response = await fetchTornAPI('/v2/user/events?striptags=true&limit=500', apiKey);

        if (response.error) {
            throw new Error(`Torn API error: ${response.error.error}`);
        }

        if (!response.events) {
            console.log('No events found');
            return { success: true, itemsReceived: [] };
        }

        // Filter for item events in the last 5 minutes
        const recentItems = [];

        for (const [eventId, event] of Object.entries(response.events)) {
            const nowTimestamp = Math.floor(Date.now() / 1000);
            const windowSeconds = CHECK_WINDOW_MINUTES * 60;
            const timeDiff = nowTimestamp - event.timestamp;

            // Check if event is within the window
            if (timeDiff >= 0 && timeDiff <= windowSeconds) {
                // Check if it's an item-related event
                if (event.event && event.event.includes('You were sent some')) {
                    const parsed = parseItemEvent(event.event);
                    
                    recentItems.push({
                        id: event.id,
                        timestamp: event.timestamp,
                        date: new Date(event.timestamp * 1000).toISOString(),
                        log: event.event,
                        item: parsed.item,
                        sender: parsed.sender,
                        parsed: parsed.parsed,
                    });
                }
            }
        }

        console.log(`✓ Found ${recentItems.length} items received in the last ${CHECK_WINDOW_MINUTES} minutes`);

        if (recentItems.length > 0) {
            console.log('\nRecent Items:');
            recentItems.forEach(item => {
                const itemStr = item.parsed ? `${item.item} from ${item.sender}` : item.log;
                console.log(`  - [${item.date}] ${itemStr}`);
            });

            // Notify Discord with parsed item names
            const message = `🎁 **Premium Payment Received!**\nItems received in the last ${CHECK_WINDOW_MINUTES} minutes:\n${recentItems.map(item => {
                if (item.parsed) {
                    return `• **${item.item}** from ${item.sender}`;
                } else {
                    return `• ${item.log}`;
                }
            }).join('\n')}`;
            await sendDiscordNotification(message);
        }

        // Update log
        const log = loadItemsLog();
        log.items = recentItems;
        log.lastChecked = new Date().toISOString();
        log.itemCount = recentItems.length;
        saveItemsLog(log);

        return { success: true, itemsReceived: recentItems, count: recentItems.length };

    } catch (error) {
        console.error(`✗ Error: ${error.message}`);

        // Log error
        const log = loadItemsLog();
        log.lastError = error.message;
        log.lastErrorTime = new Date().toISOString();
        saveItemsLog(log);

        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    checkItemsReceived().then(result => {
        if (result.count > 0) {
            process.exit(0); // Success with items
        } else {
            process.exit(0); // Success, no items
        }
    }).catch(error => {
        console.error('Unexpected error:', error);
        process.exit(1);
    });
}

module.exports = { checkItemsReceived };
