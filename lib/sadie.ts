/**
 * Sadie API client — plain fetch against the HoldOff Sadie backend.
 * Base URL comes from EXPO_PUBLIC_SADIE_API_URL, defaulting to the
 * production backend. No auth, no tRPC, no SDKs. The LLM key lives
 * server-side only; this client never sees it.
 */

const BASE_URL = (process.env.EXPO_PUBLIC_SADIE_API_URL || "https://api.shouldiholdoff.live").replace(/\/$/, "");
const TIMEOUT_MS = 30_000;

export type SadieExpression = "calm" | "listening" | "concerned" | "encouraging" | "celebrating";
export type Verdict = "CLEAR" | "HOLD" | "SPIRAL_LOCK";
export type RewriteTone = "balanced" | "empathetic" | "direct";

export interface WritingCues {
  allCapsWords: number;
  repeatedPunctuation: boolean;
  typingBurstSeconds: number;
  recentSameRecipientDrafts: number;
}

export interface DraftAnalysis {
  verdict: Verdict;
  explanation: string;
  gentleRewrite: string;
  signals: string[];
  moodScore: number;
  immediateCare: boolean;
  expression: SadieExpression;
}

export interface ConversationAnalysis {
  summary: string;
  patterns: string[];
  momentsToNotice: string[];
  nextStep: string;
  immediateCare: boolean;
}

export interface Interpretation {
  tone: string;
  possibleMeaning: string;
  possibleFeeling: string;
  replyApproaches: string[];
}

export interface ChatReply {
  reply: string;
  expression: SadieExpression;
  moodScore: number;
}

export interface ConversationMessage {
  body: string;
  direction: "inbound" | "outbound";
  createdAt: string;
}

export interface ChatContextMessage {
  role: "user" | "sadie";
  text: string;
}

export class SadieUnavailableError extends Error {
  constructor(message = "Sadie is temporarily unavailable. Please try again.") {
    super(message);
    this.name = "SadieUnavailableError";
  }
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      throw new SadieUnavailableError();
    }
    return (await res.json()) as T;
  } catch (err) {
    if (err instanceof SadieUnavailableError) throw err;
    throw new SadieUnavailableError();
  } finally {
    clearTimeout(timer);
  }
}

/** Crude writing cues computed on-device from the draft text. */
export function computeCues(draft: string, typingBurstSeconds = 0, recentSameRecipientDrafts = 0): WritingCues {
  const words = draft.split(/\s+/).filter(Boolean);
  const allCapsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  return {
    allCapsWords: Math.min(allCapsWords, 100),
    repeatedPunctuation: /([!?])\1{1,}/.test(draft),
    typingBurstSeconds: Math.max(0, Math.min(Math.round(typingBurstSeconds), 7200)),
    recentSameRecipientDrafts: Math.max(0, Math.min(Math.round(recentSameRecipientDrafts), 1000)),
  };
}

export const sadieApi = {
  analyzeDraft(input: {
    draft: string;
    recipient: string;
    cues: WritingCues;
    rewriteTone?: RewriteTone;
  }): Promise<DraftAnalysis> {
    return post<DraftAnalysis>("/api/sadie/analyze", {
      draft: input.draft,
      recipient: input.recipient,
      cues: input.cues,
      rewriteTone: input.rewriteTone ?? "balanced",
    });
  },

  analyzeConversation(input: {
    participantLabel: string;
    messages: ConversationMessage[];
  }): Promise<ConversationAnalysis> {
    return post<ConversationAnalysis>("/api/sadie/analyze-conversation", input);
  },

  interpret(input: { message: string; avoidContact: boolean }): Promise<Interpretation> {
    return post<Interpretation>("/api/sadie/interpret", input);
  },

  chat(input: {
    message: string;
    context?: ChatContextMessage[];
    sessionNote?: string;
  }): Promise<ChatReply> {
    return post<ChatReply>("/api/sadie/chat", {
      message: input.message,
      context: input.context ?? [],
      sessionNote: input.sessionNote ?? "",
    });
  },

  async health(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10_000);
      const res = await fetch(`${BASE_URL}/api/health`, { signal: controller.signal });
      clearTimeout(timer);
      return res.ok;
    } catch {
      return false;
    }
  },
};
