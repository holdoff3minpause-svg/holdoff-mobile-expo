import React from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { radius, spacing, useTheme, type Theme } from "../lib/theme";
import type { Verdict } from "../lib/sadie";

export function Screen({ children, padded = true }: { children: React.ReactNode; padded?: boolean }) {
  const t = useTheme();
  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: t.bg }]} edges={["top", "left", "right"]}>
      <ScrollView
        contentContainerStyle={[styles.scroll, padded && { padding: spacing.md }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function Title({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return <Text style={[{ fontSize: 26, fontWeight: "700", color: t.text, marginBottom: spacing.sm }, style]}>{children}</Text>;
}

export function Subtitle({ children, style }: { children: React.ReactNode; style?: StyleProp<TextStyle> }) {
  const t = useTheme();
  return (
    <Text style={[{ fontSize: 15, lineHeight: 22, color: t.muted, marginBottom: spacing.md }, style]}>{children}</Text>
  );
}

export function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  const t = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: t.surface,
          borderRadius: radius.md,
          padding: spacing.md,
          marginBottom: spacing.md,
          borderWidth: 1,
          borderColor: t.border,
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

export function FieldLabel({ children }: { children: React.ReactNode }) {
  const t = useTheme();
  return (
    <Text style={{ fontSize: 13, fontWeight: "600", color: t.muted, marginBottom: spacing.xs, textTransform: "uppercase", letterSpacing: 0.5 }}>
      {children}
    </Text>
  );
}

export function Button({
  title,
  onPress,
  disabled,
  loading,
  variant = "primary",
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: "primary" | "secondary";
}) {
  const t = useTheme();
  const primary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          backgroundColor: primary ? t.accent : t.surfaceAlt,
          borderRadius: radius.md,
          paddingVertical: 15,
          paddingHorizontal: spacing.md,
          alignItems: "center",
          opacity: disabled || loading ? 0.55 : pressed ? 0.85 : 1,
          borderWidth: primary ? 0 : 1,
          borderColor: primary ? "transparent" : t.border,
          marginTop: spacing.sm,
        },
      ]}
    >
      {loading ? (
        <ActivityIndicator color={primary ? "#fff" : t.text} />
      ) : (
        <Text style={{ color: primary ? "#fff" : t.text, fontSize: 16, fontWeight: "700" }}>{title}</Text>
      )}
    </Pressable>
  );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  const t = useTheme();
  return (
    <View
      style={{
        backgroundColor: t.accentSoft,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: t.accent,
      }}
    >
      <Text style={{ color: t.text, fontSize: 14, lineHeight: 20 }}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry} style={{ marginTop: spacing.xs }}>
          <Text style={{ color: t.accent, fontWeight: "700", fontSize: 14 }}>Try again</Text>
        </Pressable>
      )}
    </View>
  );
}

export function LoadingState({ label = "Sadie is thinking…" }: { label?: string }) {
  const t = useTheme();
  return (
    <View style={{ alignItems: "center", paddingVertical: spacing.lg }}>
      <ActivityIndicator size="large" color={t.accent} />
      <Text style={{ color: t.muted, marginTop: spacing.sm, fontSize: 14 }}>{label}</Text>
    </View>
  );
}

const verdictCopy: Record<Verdict, { label: string; blurb: string }> = {
  CLEAR: { label: "Clear to send", blurb: "This reads steady and kind. Send it when you're ready." },
  HOLD: { label: "Take a breath", blurb: "Worth a pause. Sadie drafted a gentler version below." },
  SPIRAL_LOCK: {
    label: "Let's slow down",
    blurb: "This one carries some heat. Give it time — you don't have to send anything right now.",
  },
};

export function VerdictCard({ verdict, t }: { verdict: Verdict; t: Theme }) {
  const color = verdict === "CLEAR" ? t.clear : verdict === "HOLD" ? t.hold : t.spiral;
  const copy = verdictCopy[verdict];
  return (
    <View
      style={{
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        backgroundColor: t.surface,
        borderWidth: 2,
        borderColor: color,
      }}
    >
      <Text style={{ fontSize: 20, fontWeight: "800", color, marginBottom: 4 }}>{copy.label}</Text>
      <Text style={{ fontSize: 14, color: t.muted, lineHeight: 20 }}>{copy.blurb}</Text>
    </View>
  );
}

export function MoodMeter({ score, t }: { score: number; t: Theme }) {
  const pct = Math.max(0, Math.min(100, Math.round(score)));
  const color = pct < 34 ? t.clear : pct < 67 ? t.hold : t.spiral;
  const label = pct < 34 ? "Steady" : pct < 67 ? "Activated" : "Highly activated";
  return (
    <View style={{ marginVertical: spacing.sm }}>
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 6 }}>
        <Text style={{ fontSize: 13, fontWeight: "600", color: t.muted }}>Writing energy</Text>
        <Text style={{ fontSize: 13, fontWeight: "700", color }}>{label}</Text>
      </View>
      <View style={{ height: 8, borderRadius: 4, backgroundColor: t.surfaceAlt, overflow: "hidden" }}>
        <View style={{ width: `${pct}%`, height: 8, borderRadius: 4, backgroundColor: color }} />
      </View>
    </View>
  );
}

export function ImmediateCareNote({ t }: { t: Theme }) {
  return (
    <View
      style={{
        backgroundColor: t.surfaceAlt,
        borderRadius: radius.md,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderLeftWidth: 4,
        borderLeftColor: t.spiral,
      }}
    >
      <Text style={{ fontSize: 14, lineHeight: 21, color: t.text, fontWeight: "600", marginBottom: 4 }}>
        A gentle note from Sadie
      </Text>
      <Text style={{ fontSize: 14, lineHeight: 21, color: t.text }}>
        What you wrote sounds really heavy. If you might act on these feelings or are in immediate danger, call or
        text 988 in the US, or contact your local emergency services. You deserve support right now.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: spacing.xl },
});
