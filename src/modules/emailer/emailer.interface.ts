export interface IEmailerMessage {
  text: string;
  html?: string;
  receivers: string[];
  subject: string;
  attachments?: { filename: string; path?: string; content?: string | Buffer }[]
}