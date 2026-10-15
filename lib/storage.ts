/**
 * Local persistence with AsyncStorage. Drafts, chat history, and onboarding
 * state live on-device. No backend account needed.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import type { ChatContextMessage, DraftAnalysis } from "./sadie";

const KEYS = {
  onboardingComplete: "holdoff:onboardingComplete",
  analysisConsent: "holdoff:analysisConsent",
  drafts: "holdoff:drafts",
  chatHistory: "holdoff:chatHistory",
} as const;

export interface StoredDraft {
  id: string;
  recipient: string;
  body: string;
  rewriteTone: "balanced" | "empathetic" | "direct";
  createdAt: string;
  analysis?: DraftAnalysis;
}

export interface StoredChatMessage extends ChatContextMessage {
  id: string;
  createdAt: string;
  moodScore?: number;
}

function createId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

async function readJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJson(key: string, value: unknown): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage failures shouldn't break the UI.
  }
}

export const store = {
  // --- onboarding ---
  async isOnboardingComplete(): Promise<boolean> {
    return readJson<boolean>(KEYS.onboardingComplete, false);
  },
  async setOnboardingComplete(v: boolean): Promise<void> {
    return writeJson(KEYS.onboardingComplete, v);
  },
  async getAnalysisConsent(): Promise<boolean> {
    return readJson<boolean>(KEYS.analysisConsent, false);
  },
  async setAnalysisConsent(v: boolean): Promise<void> {
    return writeJson(KEYS.analysisConsent, v);
  },

  // --- drafts ---
  async getDrafts(): Promise<StoredDraft[]> {
    return readJson<StoredDraft[]>(KEYS.drafts, []);
  },
  async saveDraft(input: {
    id?: string;
    recipient: string;
    body: string;
    rewriteTone: StoredDraft["rewriteTone"];
    analysis?: DraftAnalysis;
  }): Promise<StoredDraft> {
    const drafts = await store.getDrafts();
    const now = new Date().toISOString();
    if (input.id) {
      const updated = drafts.map((d) =>
        d.id === input.id
          ? { ...d, recipient: input.recipient, body: input.body, rewriteTone: input.rewriteTone, analysis: input.analysis }
          : d
      );
      await writeJson(KEYS.drafts, updated);
      return updated.find((d) => d.id === input.id)!;
    }
    const draft: StoredDraft = {
      id: createId("draft"),
      recipient: input.recipient,
      body: input.body,
      rewriteTone: input.rewriteTone,
      createdAt: now,
      analysis: input.analysis,
    };
    await writeJson(KEYS.drafts, [draft, ...drafts].slice(0, 50));
    return draft;
  },
  async deleteDraft(id: string): Promise<void> {
    const drafts = await store.getDrafts();
    await writeJson(
      KEYS.drafts,
      drafts.filter((d) => d.id !== id)
    );
  },

  // --- chat ---
  async getChatHistory(): Promise<StoredChatMessage[]> {
    return readJson<StoredChatMessage[]>(KEYS.chatHistory, []);
  },
  async appendChatMessage(input: { role: "user" | "sadie"; text: string; moodScore?: number }): Promise<StoredChatMessage> {
    const history = await store.getChatHistory();
    const msg: StoredChatMessage = {
      id: createId("msg"),
      role: input.role,
      text: input.text,
      createdAt: new Date().toISOString(),
      moodScore: input.moodScore,
    };
    await writeJson(KEYS.chatHistory, [...history, msg].slice(-100));
    return msg;
  },
  async clearChatHistory(): Promise<void> {
    await writeJson(KEYS.chatHistory, []);
  },
};
