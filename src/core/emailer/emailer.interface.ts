export interface IEmailerMessage {
  text: string;
  html?: string;
  receivers: string[];
  subject: string;
  attachments?: IEmailerAttachment[];
}

export interface IEmailerAttachment {
  filename: string;
  path?: string;
  content?: string | Buffer;
}

export interface IEmailerTemplate {
  template: string;
  context: Record<string, any>;
  receivers: string[];
  subject: string;
  options?: IEmailerRenderOptions;
  attachments?: IEmailerAttachment[];
}

export interface IEmailerRenderOptions {
  layout?: string;
  css?: string;
}