export interface ConversationResponder {
  respond(text: string): Promise<string>;
  respondLong(text: string): Promise<string>;
  failNext(): void;
}
