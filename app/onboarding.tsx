import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Switch, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Button, Title } from "../components/ui";
import { store } from "../lib/storage";
import { spacing, useTheme } from "../lib/theme";

const slides = [
  {
    emoji: "💛",
    heading: "Meet Sadie",
    body: "HoldOff is a companion for the moments before you hit send. When a message feels loaded, Sadie helps you pause — the opposite of addiction is connection.",
  },
  {
    emoji: "⏸️",
    heading: "The 3–60 second pause",
    body: "Write your draft, then check it with Sadie. She'll tell you if it's clear to send, worth softening, or better left unsent for now — and offer a gentler rewrite when it helps.",
  },
  {
    emoji: "🪞",
    heading: "Understand, don't spiral",
    body: "Paste a message you received to see it with fresh eyes, reflect on a conversation's patterns, or just talk things through with Sadie. She validates first, never judges.",
  },
];

export default function Onboarding() {
  const router = useRouter();
  const t = useTheme();
  const [step, setStep] = useState(0);
  const [consent, setConsent] = useState(false);
  const last = step === slides.length - 1;
  const slide = slides[step];

  async function finish() {
    await store.setAnalysisConsent(consent);
    await store.setOnboardingComplete(true);
    router.replace("/(tabs)");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={["top", "bottom", "left", "right"]}>
      <View style={{ flex: 1, padding: spacing.lg, justifyContent: "center" }}>
        <Text style={{ fontSize: 64, marginBottom: spacing.md }}>{slide.emoji}</Text>
        <Title>{slide.heading}</Title>
        <Text style={{ fontSize: 16, lineHeight: 25, color: t.muted, marginBottom: spacing.xl }}>{slide.body}</Text>

        {last && (
          <View
            style={{
              backgroundColor: t.surface,
              borderRadius: 14,
              padding: spacing.md,
              borderWidth: 1,
              borderColor: t.border,
              marginBottom: spacing.md,
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
              <Text style={{ fontSize: 15, fontWeight: "700", color: t.text, flex: 1, marginRight: spacing.sm }}>
                Let Sadie analyze my drafts
              </Text>
              <Switch value={consent} onValueChange={setConsent} trackColor={{ true: t.accent }} />
            </View>
            <Text style={{ fontSize: 13, lineHeight: 19, color: t.muted, marginTop: spacing.xs }}>
              Sadie reads only what you choose to share, to give verdicts and rewrites. You can change this anytime.
              HoldOff is a companion, not therapy — and never a replacement for professional support.
            </Text>
          </View>
        )}

        <View style={{ flexDirection: "row", alignItems: "center", marginBottom: spacing.lg }}>
          {slides.map((_, i) => (
            <View
              key={i}
              style={{
                width: i === step ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: i === step ? t.accent : t.border,
                marginRight: 6,
              }}
            />
          ))}
        </View>

        {last ? (
          <Button title="Start using HoldOff" onPress={finish} />
        ) : (
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Pressable onPress={finish}>
              <Text style={{ color: t.muted, fontSize: 15 }}>Skip</Text>
            </Pressable>
            <Button title="Next" onPress={() => setStep(step + 1)} />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
