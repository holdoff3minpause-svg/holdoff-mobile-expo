import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../lib/theme";

function TabIcon({ name, color }: { name: keyof typeof Ionicons.glyphMap; color: string }) {
  return <Ionicons name={name} size={24} color={color} />;
}

export default function TabLayout() {
  const t = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: t.accent,
        tabBarInactiveTintColor: t.muted,
        tabBarStyle: { backgroundColor: t.tabBar, borderTopColor: t.border },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "New Draft",
          tabBarIcon: ({ color }) => <TabIcon name="create-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="interpret"
        options={{
          title: "Interpreter",
          tabBarIcon: ({ color }) => <TabIcon name="chatbubble-ellipses-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="reflect"
        options={{
          title: "Reflect",
          tabBarIcon: ({ color }) => <TabIcon name="heart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          title: "Sadie Chat",
          tabBarIcon: ({ color }) => <TabIcon name="chatbubbles-outline" color={color} />,
        }}
      />
    </Tabs>
  );
}
