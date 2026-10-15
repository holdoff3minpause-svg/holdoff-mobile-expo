import { useEffect, useRef, useState } from "react";
import { FlatList, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ErrorBanner, Title } from "../../components/ui";
import { sadieApi, type ChatContextMessage } from "../../lib/sadie";
import { store, type StoredChatMessage } from "../../lib/storage";
import { radius, spacing, useTheme } from "../../lib/theme";

export default function Chat() {
  const t = useTheme();
  const [messages, setMessages] = useState<StoredChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    store.getChatHistory().then(setMessages);
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setError(null);
    setSending(true);

    const userMsg = await store.appendChatMessage({ role: "user", text });
    const updated = [...messages, userMsg];
    setMessages(updated);

    try {
      const context: ChatContextMessage[] = updated
        .slice(-7, -1)
        .map((m) => ({ role: m.role, text: m.text.slice(0, 900) }));
      const reply = await sadieApi.chat({ message: text, context });
      const sadieMsg = await store.appendChatMessage({
        role: "sadie",
        text: reply.reply,
        moodScore: reply.moodScore,
      });
      setMessages((prev) => [...prev, sadieMsg]);
    } catch {
      setError("Sadie is temporarily unavailable. Your message is saved — try again in a moment.");
    } finally {
      setSending(false);
    }
  }

  async function clearHistory() {
    await store.clearChatHistory();
    setMessages([]);
  }

  function renderItem({ item }: { item: StoredChatMessage }) {
    const isUser = item.role === "user";
    return (
      <View
        style={{
          alignSelf: isUser ? "flex-end" : "flex-start",
          maxWidth: "85%",
          backgroundColor: isUser ? t.accent : t.surface,
          borderWidth: isUser ? 0 : 1,
          borderColor: t.border,
          borderRadius: radius.md,
          borderBottomRightRadius: isUser ? 4 : radius.md,
          borderBottomLeftRadius: isUser ? radius.md : 4,
          padding: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <Text style={{ fontSize: 15, lineHeight: 22, color: isUser ? "#fff" : t.text }}>{item.text}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top", "left", "right"]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md, flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <Title style={{ marginBottom: 0 }}>Sadie</Title>
          {messages.length > 0 && (
            <Pressable onPress={clearHistory}>
              <Text style={{ color: t.muted, fontSize: 14 }}>Clear chat</Text>
            </Pressable>
          )}
        </View>

        {messages.length === 0 ? (
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: spacing.lg }}>
            <Text style={{ fontSize: 56, marginBottom: spacing.md }}>💛</Text>
            <Text style={{ fontSize: 17, fontWeight: "700", color: t.text, marginBottom: spacing.xs }}>
              Hi, I&apos;m Sadie.
            </Text>
            <Text style={{ fontSize: 14, lineHeight: 21, color: t.muted, textAlign: "center" }}>
              Talk through what&apos;s on your mind — a message you&apos;re unsure about, a conversation that stung, or just
              your day. I&apos;m here to listen, not to judge.
            </Text>
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(m) => m.id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.sm }}
            showsVerticalScrollIndicator={false}
          />
        )}

        {error && (
          <View style={{ paddingHorizontal: spacing.md }}>
            <ErrorBanner message={error} />
          </View>
        )}

        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            padding: spacing.sm,
            paddingBottom: spacing.md,
            borderTopWidth: 1,
            borderTopColor: t.border,
            backgroundColor: t.tabBar,
          }}
        >
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Talk to Sadie…"
            placeholderTextColor={t.muted}
            style={{
              flex: 1,
              backgroundColor: t.surface,
              borderRadius: radius.lg,
              borderWidth: 1,
              borderColor: t.border,
              paddingHorizontal: spacing.sm,
              paddingVertical: 10,
              fontSize: 15,
              color: t.text,
              maxHeight: 120,
              marginRight: spacing.xs,
            }}
            multiline
            editable={!sending}
            onSubmitEditing={send}
          />
          <Pressable
            onPress={send}
            disabled={!input.trim() || sending}
            style={{
              backgroundColor: t.accent,
              borderRadius: radius.lg,
              width: 46,
              height: 46,
              alignItems: "center",
              justifyContent: "center",
              opacity: !input.trim() || sending ? 0.5 : 1,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20 }}>↑</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
