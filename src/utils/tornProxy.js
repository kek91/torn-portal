// src/utils/tornProxy.js

export async function fetchFromTornViaProxy(url, headers = {}) {
    const encodedUrl = encodeURIComponent(url);
    const proxyUrl = `https://teknix.no/proxy/${encodedUrl}`;

    try {
        const response = await fetch(proxyUrl, { headers: headers});
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Unknown proxy error');
        }

        return await response.json();
    } catch (err) {
        console.error('[Proxy Fetch Error]', err.message);
        throw err;
    }
}
