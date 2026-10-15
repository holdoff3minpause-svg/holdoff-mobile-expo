import * as Clipboard from "expo-clipboard";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import {
  Button,
  Card,
  ErrorBanner,
  FieldLabel,
  ImmediateCareNote,
  LoadingState,
  MoodMeter,
  Screen,
  Subtitle,
  Title,
  VerdictCard,
} from "../../components/ui";
import { computeCues, sadieApi, type DraftAnalysis, type RewriteTone } from "../../lib/sadie";
import { store } from "../../lib/storage";
import { radius, spacing, useTheme } from "../../lib/theme";

const tones: { id: RewriteTone; label: string }[] = [
  { id: "balanced", label: "Balanced" },
  { id: "empathetic", label: "Empathetic" },
  { id: "direct", label: "Direct" },
];

export default function NewDraft() {
  const t = useTheme();
  const [recipient, setRecipient] = useState("");
  const [body, setBody] = useState("");
  const [tone, setTone] = useState<RewriteTone>("balanced");
  const [analysis, setAnalysis] = useState<DraftAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [consent, setConsent] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    store.getAnalysisConsent().then(setConsent);
  }, []);

  async function checkWithSadie() {
    if (!body.trim()) return;
    setLoading(true);
    setError(null);
    setAnalysis(null);
    setCopied(false);
    try {
      const result = await sadieApi.analyzeDraft({
        draft: body.trim(),
        recipient: recipient.trim() || "unspecified",
        cues: computeCues(body),
        rewriteTone: tone,
      });
      setAnalysis(result);
      await store.saveDraft({ recipient: recipient.trim(), body: body.trim(), rewriteTone: tone, analysis: result });
    } catch {
      setError("Sadie is temporarily unavailable. Your draft is safe — try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  async function copyRewrite() {
    if (!analysis?.gentleRewrite) return;
    await Clipboard.setStringAsync(analysis.gentleRewrite);
    setCopied(true);
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
      <Title>New draft</Title>
      <Subtitle>Write what&apos;s on your mind. Sadie will help you check it before you send — no judgment, just a second look.</Subtitle>

      {!consent && (
        <Card>
          <Text style={{ fontSize: 14, lineHeight: 20, color: t.text }}>
            Analysis is turned off. To get Sadie&apos;s verdicts, enable it in onboarding — or just know your drafts stay
            private on this device either way.
          </Text>
        </Card>
      )}

      <FieldLabel>Who is this for?</FieldLabel>
      <TextInput
        value={recipient}
        onChangeText={setRecipient}
        placeholder="Name or relationship (e.g. Alex, my sister)"
        placeholderTextColor={t.muted}
        style={inputStyle}
        autoCapitalize="words"
      />

      <FieldLabel>Your message</FieldLabel>
      <TextInput
        value={body}
        onChangeText={setBody}
        placeholder="Say it raw — Sadie won&apos;t judge."
        placeholderTextColor={t.muted}
        style={[inputStyle, { minHeight: 140, textAlignVertical: "top" }]}
        multiline
      />

      <FieldLabel>Rewrite tone</FieldLabel>
      <View style={{ flexDirection: "row", marginBottom: spacing.sm }}>
        {tones.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setTone(item.id)}
            style={{
              flex: 1,
              paddingVertical: 10,
              marginRight: item.id === "direct" ? 0 : spacing.xs,
              borderRadius: radius.sm,
              alignItems: "center",
              backgroundColor: tone === item.id ? t.accent : t.surfaceAlt,
              borderWidth: 1,
              borderColor: tone === item.id ? t.accent : t.border,
            }}
          >
            <Text style={{ color: tone === item.id ? "#fff" : t.text, fontWeight: "600", fontSize: 14 }}>
              {item.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <Button title="Check with Sadie" onPress={checkWithSadie} disabled={!body.trim() || loading} loading={loading} />

      {loading && <LoadingState />}
      {error && <ErrorBanner message={error} onRetry={checkWithSadie} />}

      {analysis && (
        <View style={{ marginTop: spacing.md }}>
          <VerdictCard verdict={analysis.verdict} t={t} />
          {analysis.immediateCare && <ImmediateCareNote t={t} />}

          <Card>
            <FieldLabel>Why Sadie sees it this way</FieldLabel>
            <Text style={{ fontSize: 15, lineHeight: 22, color: t.text }}>{analysis.explanation}</Text>
          </Card>

          {analysis.signals.length > 0 && (
            <Card>
              <FieldLabel>Signals noticed</FieldLabel>
              {analysis.signals.map((s, i) => (
                <Text key={i} style={{ fontSize: 14, lineHeight: 22, color: t.text }}>
                  • {s}
                </Text>
              ))}
            </Card>
          )}

          <Card>
            <MoodMeter score={analysis.moodScore} t={t} />
          </Card>

          {analysis.gentleRewrite ? (
            <Card>
              <FieldLabel>A gentler way to say it</FieldLabel>
              <Text style={{ fontSize: 15, lineHeight: 23, color: t.text, fontStyle: "italic" }}>
                “{analysis.gentleRewrite}”
              </Text>
              <Button title={copied ? "Copied ✓" : "Copy rewrite"} onPress={copyRewrite} variant="secondary" />
            </Card>
          ) : (
            analysis.verdict === "CLEAR" && (
              <Card>
                <Text style={{ fontSize: 14, color: t.muted, lineHeight: 20 }}>
                  No rewrite needed — this one is good as written.
                </Text>
              </Card>
            )
          )}
        </View>
      )}
    </Screen>
  );
}
