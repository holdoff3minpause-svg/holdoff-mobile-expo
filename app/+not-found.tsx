import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";
import { spacing, useTheme } from "../lib/theme";

export default function NotFoundScreen() {
  const t = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: "Not found" }} />
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          padding: spacing.lg,
          backgroundColor: t.bg,
        }}
      >
        <Text style={{ fontSize: 20, fontWeight: "700", color: t.text, marginBottom: spacing.sm }}>
          This screen doesn&apos;t exist.
        </Text>
        <Link href="/(tabs)">
          <Text style={{ fontSize: 15, color: t.accent, fontWeight: "600" }}>Go to home screen</Text>
        </Link>
      </View>
    </>
  );
}
