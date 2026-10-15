import { useState } from "react";
import { Switch, Text, TextInput, View } from "react-native";
import {
  Button,
  Card,
  ErrorBanner,
  FieldLabel,
  LoadingState,
  Screen,
  Subtitle,
  Title,
} from "../../components/ui";
import { sadieApi, type Interpretation } from "../../lib/sadie";
import { radius, spacing, useTheme } from "../../lib/theme";

export default function Interpreter() {
  const t = useTheme();
  const [message, setMessage] = useState("");
  const [avoidContact, setAvoidContact] = useState(false);
  const [result, setResult] = useState<Interpretation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function interpret() {
    if (!message.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const r = await sadieApi.interpret({ message: message.trim(), avoidContact });
      setResult(r);
    } catch {
      setError("Sadie is temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Title>Interpreter</Title>
      <Subtitle>
        Paste a message you received. Sadie will reflect what it might mean — as possibilities, not certainties.
      </Subtitle>

      <FieldLabel>Their message</FieldLabel>
      <TextInput
        value={message}
        onChangeText={setMessage}
        placeholder="Paste the message here…"
        placeholderTextColor={t.muted}
        style={{
          backgroundColor: t.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.sm,
          fontSize: 16,
          color: t.text,
          minHeight: 120,
          textAlignVertical: "top",
          marginBottom: spacing.md,
        }}
        multiline
      />

      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: t.surface,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: t.border,
          padding: spacing.sm,
          marginBottom: spacing.sm,
        }}
      >
        <View style={{ flex: 1, marginRight: spacing.sm }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: t.text }}>I want to avoid contact</Text>
          <Text style={{ fontSize: 13, color: t.muted, marginTop: 2 }}>
            Sadie will suggest self-protective approaches instead of replies.
          </Text>
        </View>
        <Switch value={avoidContact} onValueChange={setAvoidContact} trackColor={{ true: t.accent }} />
      </View>

      <Button title="Interpret with Sadie" onPress={interpret} disabled={!message.trim() || loading} loading={loading} />

      {loading && <LoadingState />}
      {error && <ErrorBanner message={error} onRetry={interpret} />}

      {result && (
        <View style={{ marginTop: spacing.md }}>
          <Card>
            <FieldLabel>Likely tone</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{result.tone}</Text>
          </Card>
          <Card>
            <FieldLabel>What it might mean</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{result.possibleMeaning}</Text>
          </Card>
          <Card>
            <FieldLabel>What they might be feeling</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{result.possibleFeeling}</Text>
          </Card>
          <Card>
            <FieldLabel>Healthy ways to respond</FieldLabel>
            {result.replyApproaches.map((a, i) => (
              <Text key={i} style={{ fontSize: 15, lineHeight: 23, color: t.text, marginBottom: spacing.xs }}>
                {i + 1}. {a}
              </Text>
            ))}
          </Card>
        </View>
      )}
    </Screen>
  );
}
