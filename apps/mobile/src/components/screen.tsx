import type { ReactNode } from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "heroui-native";

interface ScreenProps {
  title: string;
  subtitle?: string;
  children?: ReactNode;
}

/**
 * Shared screen scaffold: a safe-area-aware scroll view with a title block.
 * Per-feature native stack headers replace the inline title as features land.
 */
export function Screen({ title, subtitle, children }: ScreenProps) {
  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 32, gap: 20 }}
      contentInsetAdjustmentBehavior="automatic"
    >
      <View style={{ gap: 4 }}>
        <Typography.Heading>{title}</Typography.Heading>
        {subtitle ? (
          <Typography.Paragraph className="opacity-60">{subtitle}</Typography.Paragraph>
        ) : null}
      </View>
      {children}
    </ScrollView>
  );
}
