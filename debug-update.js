// Debug script to test timestamp comparison
const lastUpdateStr = '2025-08-26 16:39:32.234';
const lastUpdate = new Date(lastUpdateStr);
const now = new Date();
const diffMs = now.getTime() - lastUpdate.getTime();
const diffMinutes = diffMs / (1000 * 60);
const isStale = diffMinutes > 5;

console.log(`Last update time: ${lastUpdate}`);
console.log(`Current time: ${now}`);
console.log(`Time difference: ${diffMinutes.toFixed(2)} minutes`);
console.log(`Is data stale? ${isStale} (threshold: 5 minutes)`);
