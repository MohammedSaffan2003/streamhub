class LiveService {
  constructor() {
    this.activeStream = null;
    this.viewers = new Set();
  }

  async startStream(userId, channelName) {
    this.activeStream = {
      userId,
      channelName,
      startTime: new Date(),
      viewers: new Set(),
    };
    return this.activeStream;
  }

  async stopStream(userId) {
    if (this.activeStream && this.activeStream.userId === userId) {
      this.activeStream = null;
      this.viewers.clear();
    }
  }

  async isStreamActive() {
    return !!this.activeStream;
  }

  async getStreamStatus() {
    return {
      isLive: !!this.activeStream,
      activeStreamer: this.activeStream,
      viewerCount: this.viewers.size,
    };
  }

  async addViewer(userId) {
    if (this.activeStream) {
      this.viewers.add(userId);
    }
  }

  async removeViewer(userId) {
    this.viewers.delete(userId);
  }
}

module.exports = LiveService;
