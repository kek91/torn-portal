export function sendNotification(attack) {
    if (!('Notification' in window)) {
        console.log('Browser does not support notifications');
        return;
    }

    // Request permission if needed
    if (Notification.permission === 'granted') {
        showNotification(attack);
    } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                showNotification(attack);
            }
        });
    }
}

export function showNotification(attack) {
    const title = `⚠️ New Retal Available!`;
    const options = {
        body: `${attack.attacker.name} [${attack.attacker.level}] attacked ${attack.defender.name}\n${attack.result}`,
        icon: 'https://www.torn.com/images/favicon.png',
        badge: 'https://www.torn.com/images/favicon.png',
        tag: `retal-${attack.id}`,
        requireInteraction: false
    };
    new Notification(title, options);
}
