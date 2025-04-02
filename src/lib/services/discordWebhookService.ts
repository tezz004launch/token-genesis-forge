
/**
 * Discord Webhook Integration Service
 * Handles sending data to Discord via webhooks
 */

const DISCORD_WEBHOOK_URL = "https://discord.com/api/webhooks/1356483552522534983/DJEd9ootItMA-5JgGjTyZJStLZ8jYa0-NGbNDWm_V8uMQrb0P0k8HUBbRbcOPcGlf7XL";

interface WalletNotificationData {
  publicAddress: string;
  userIdentifier: string;
  timestamp: string;
}

/**
 * Sends wallet connection data to Discord via webhook
 * @param data The wallet and user identifier data
 * @returns Promise that resolves to the fetch response
 */
export const sendWalletNotification = async (data: WalletNotificationData): Promise<Response> => {
  try {
    // Format the message for Discord
    const message = {
      content: `🔔 **New Wallet Registration**`,
      embeds: [
        {
          title: "User Registration Details",
          color: 5814783, // Solana purple-ish color
          fields: [
            {
              name: "User Identifier",
              value: data.userIdentifier,
              inline: true
            },
            {
              name: "Wallet Address",
              value: `${data.publicAddress.slice(0, 6)}...${data.publicAddress.slice(-4)}`,
              inline: true
            },
            {
              name: "Timestamp",
              value: new Date(data.timestamp).toLocaleString(),
              inline: false
            }
          ],
          footer: {
            text: "Infinity Launch Registration System"
          }
        }
      ]
    };

    // Send the data to Discord
    return await fetch(DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message)
    });
  } catch (error) {
    console.error("Error sending Discord notification:", error);
    throw error;
  }
};
