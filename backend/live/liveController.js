const { RtcTokenBuilder, RtcRole } = require("agora-access-token");
const LiveService = require("./liveService");

class LiveController {
  constructor() {
    this.liveService = new LiveService();
  }

  async startStream(req, res) {
    try {
      const userId = req.user.id;

      if (await this.liveService.isStreamActive()) {
        return res
          .status(400)
          .json({ error: "Another stream is already active" });
      }

      const channelName = `stream-${userId}`;
      const role = RtcRole.PUBLISHER;
      const expirationTimeInSeconds = 3600;
      const currentTimestamp = Math.floor(Date.now() / 1000);
      const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

      const token = RtcTokenBuilder.buildTokenWithUid(
        process.env.AGORA_APP_ID,
        process.env.AGORA_APP_CERTIFICATE,
        channelName,
        userId,
        role,
        privilegeExpiredTs,
        {
          enableReport: false,
          enableAnalytics: false,
        }
      );

      await this.liveService.startStream(userId, channelName);

      res.json({
        agoraToken: token,
        channelName,
        config: {
          enableAnalytics: false,
          enableReport: false,
          logLevel: 4,
        },
      });
    } catch (error) {
      console.error("Error starting stream:", error);
      res.status(500).json({ error: "Error starting stream" });
    }
  }

  async stopStream(req, res) {
    try {
      const userId = req.user.id;
      await this.liveService.stopStream(userId);
      res.json({ message: "Stream stopped successfully" });
    } catch (error) {
      console.error("Error stopping stream:", error);
      res.status(500).json({ error: "Error stopping stream" });
    }
  }

  async getStreamStatus(req, res) {
    try {
      const status = await this.liveService.getStreamStatus();
      res.json(status);
    } catch (error) {
      console.error("Error getting stream status:", error);
      res.status(500).json({ error: "Error getting stream status" });
    }
  }
}

module.exports = new LiveController();
