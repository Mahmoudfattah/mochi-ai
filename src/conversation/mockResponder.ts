import type { ConversationResponder } from "./responder";
import { t } from "@/config/locale/ar-EG";

const REPLIES = [
  t("userReply"),
  t("userReplyAlternate"),
  t("userReplyNext"),
] as const;

const SIMULATED_SERVICE_ERROR = new Error("Mock service unavailable");

export class MockConversationResponder implements ConversationResponder {
  private nextRequestFails = false;
  private replyIndex = 0;

  async respond(text: string): Promise<string> {
    void text;
    this.throwIfConfigured();
    const reply = REPLIES[this.replyIndex % REPLIES.length];
    this.replyIndex += 1;
    return reply;
  }

  async respondLong(text: string): Promise<string> {
    void text;
    this.throwIfConfigured();
    return t("longReply");
  }

  failNext(): void {
    this.nextRequestFails = true;
  }

  private throwIfConfigured(): void {
    if (!this.nextRequestFails) return;
    this.nextRequestFails = false;
    throw SIMULATED_SERVICE_ERROR;
  }
}
