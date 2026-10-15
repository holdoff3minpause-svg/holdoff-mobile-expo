import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  Button,
  Card,
  ErrorBanner,
  FieldLabel,
  ImmediateCareNote,
  LoadingState,
  Screen,
  Subtitle,
  Title,
} from "../../components/ui";
import { sadieApi, type ConversationAnalysis, type ConversationMessage } from "../../lib/sadie";
import { radius, spacing, useTheme } from "../../lib/theme";

interface Row {
  id: string;
  body: string;
  direction: "inbound" | "outbound";
}

function newId() {
  return `row_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export default function Reflect() {
  const t = useTheme();
  const [label, setLabel] = useState("");
  const [rows, setRows] = useState<Row[]>([{ id: newId(), body: "", direction: "outbound" }]);
  const [result, setResult] = useState<ConversationAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showImmediateCare, setShowImmediateCare] = useState(false);

  function updateRow(id: string, patch: Partial<Row>) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function removeRow(id: string) {
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));
  }

  function addRow() {
    if (rows.length >= 40) return;
    setRows((prev) => [...prev, { id: newId(), body: "", direction: "inbound" }]);
  }

  async function analyze() {
    const messages: ConversationMessage[] = rows
      .filter((r) => r.body.trim())
      .map((r) => ({ body: r.body.trim().slice(0, 2400), direction: r.direction, createdAt: new Date().toISOString() }));
    if (messages.length === 0) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setShowImmediateCare(false);
    try {
      const r = await sadieApi.analyzeConversation({
        participantLabel: label.trim() || "this person",
        messages,
      });
      setResult(r);
      setShowImmediateCare(r.immediateCare);
    } catch {
      setError("Sadie is temporarily unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle = {
    backgroundColor: t.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: t.border,
    padding: spacing.sm,
    fontSize: 16,
    color: t.text,
    marginBottom: spacing.md,
  };

  return (
    <Screen>
      <Title>Reflect</Title>
      <Subtitle>
        Paste a conversation to see its patterns with fresh eyes. Sadie reflects possibilities — never diagnoses
        anyone.
      </Subtitle>

      <FieldLabel>Who is this conversation with?</FieldLabel>
      <TextInput
        value={label}
        onChangeText={setLabel}
        placeholder="Name or relationship"
        placeholderTextColor={t.muted}
        style={inputStyle}
        autoCapitalize="words"
      />

      <FieldLabel>Messages (in order)</FieldLabel>
      {rows.map((row, i) => (
        <View
          key={row.id}
          style={{
            backgroundColor: t.surface,
            borderRadius: radius.md,
            borderWidth: 1,
            borderColor: t.border,
            padding: spacing.sm,
            marginBottom: spacing.sm,
          }}
        >
          <View style={{ flexDirection: "row", marginBottom: spacing.xs }}>
            {(["outbound", "inbound"] as const).map((d) => (
              <Pressable
                key={d}
                onPress={() => updateRow(row.id, { direction: d })}
                style={{
                  flex: 1,
                  paddingVertical: 8,
                  marginRight: d === "outbound" ? spacing.xs : 0,
                  borderRadius: radius.sm,
                  alignItems: "center",
                  backgroundColor: row.direction === d ? t.accent : t.surfaceAlt,
                }}
              >
                <Text
                  style={{ color: row.direction === d ? "#fff" : t.text, fontWeight: "600", fontSize: 13 }}
                >
                  {d === "outbound" ? "You" : "Them"}
                </Text>
              </Pressable>
            ))}
            {rows.length > 1 && (
              <Pressable onPress={() => removeRow(row.id)} style={{ justifyContent: "center", paddingLeft: spacing.xs }}>
                <Text style={{ color: t.muted, fontSize: 18 }}>✕</Text>
              </Pressable>
            )}
          </View>
          <TextInput
            value={row.body}
            onChangeText={(v) => updateRow(row.id, { body: v })}
            placeholder={`Message ${i + 1}…`}
            placeholderTextColor={t.muted}
            style={{ fontSize: 15, color: t.text, minHeight: 60, textAlignVertical: "top" }}
            multiline
          />
        </View>
      ))}

      <Button title="+ Add message" onPress={addRow} variant="secondary" />

      <Button
        title="Reflect with Sadie"
        onPress={analyze}
        disabled={loading || !rows.some((r) => r.body.trim())}
        loading={loading}
      />

      {loading && <LoadingState />}
      {error && <ErrorBanner message={error} onRetry={analyze} />}

      {result && (
        <View style={{ marginTop: spacing.md }}>
          {showImmediateCare && <ImmediateCareNote t={t} />}
          <Card>
            <FieldLabel>Summary</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{result.summary}</Text>
          </Card>
          {result.patterns.length > 0 && (
            <Card>
              <FieldLabel>Patterns to notice</FieldLabel>
              {result.patterns.map((p, idx) => (
                <Text key={idx} style={{ fontSize: 14, lineHeight: 22, color: t.text, marginBottom: spacing.xs }}>
                  • {p}
                </Text>
              ))}
            </Card>
          )}
          {result.momentsToNotice.length > 0 && (
            <Card>
              <FieldLabel>Moments worth a second look</FieldLabel>
              {result.momentsToNotice.map((m, idx) => (
                <Text key={idx} style={{ fontSize: 14, lineHeight: 22, color: t.text, marginBottom: spacing.xs }}>
                  • {m}
                </Text>
              ))}
            </Card>
          )}
          <Card>
            <FieldLabel>A small next step</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{result.nextStep}</Text>
          </Card>
        </View>
      )}
    </Screen>
  );
}
