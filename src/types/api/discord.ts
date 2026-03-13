export interface BaseMessage {
  title?: string;
  description?: string;
  color?: number;
  unit: Units;
  candidateName: string;
  candidateDiscordId: string;
  applyingPosition: string;
}

export interface AcceptedMessage extends BaseMessage {
  name: "accepted";
}

export interface RejectedMessage extends BaseMessage {
  name: "rejected";
  reasonKey: ReasonKey;
  customReason?: string;
}

export type ReasonKey = "age" | "lackOfEffort" | "default" | "custom";
export type Units = "160th" | "tacdevron";

export interface SubmissionMessage extends BaseMessage {
  name: "submission";
}

export type MessageType = AcceptedMessage | RejectedMessage | SubmissionMessage;

export type CandidateMessageType = Exclude<MessageType, SubmissionMessage>;
export type InstructorMessageType = Exclude<
  MessageType,
  AcceptedMessage | RejectedMessage
>;

export interface DiscordWebhookPayload {
  /** The plain text message content (up to 2000 characters) */
  content?: string;
  /** Overrides the default username of the webhook */
  username?: string;
  /** Overrides the default avatar of the webhook */
  avatar_url?: string;
  /** An array of embed objects for rich content */
  embeds?: DiscordEmbed[];
  /** Whether the message should be read aloud by Discord's text-to-speech */
  tts?: boolean;
  allowed_mentions?: AllowedMentions;
}

export interface DiscordEmbed {
  title?: string;
  type?: "rich" | "image" | "video" | "gifv" | "article" | "link"; // 'rich' is the default
  description?: string;
  url?: string;
  timestamp?: string; // ISO8601 timestamp string
  color?: number; // decimal color code

  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };

  image?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };

  thumbnail?: {
    url: string;
    proxy_url?: string;
    height?: number;
    width?: number;
  };

  video?: {
    url?: string;
    height?: number;
    width?: number;
  };

  provider?: {
    name?: string;
    url?: string;
  };

  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };

  fields?: DiscordEmbedField[];
}

export interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface AllowedMentions {
  parse?: ("roles" | "users" | "everyone")[];
  roles?: string[]; // role IDs
  users?: string[]; // user IDs
  replied_user?: boolean;
}

export interface DiscordRefreshTokenResponse {
  token_type: string;
  access_token: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
}
