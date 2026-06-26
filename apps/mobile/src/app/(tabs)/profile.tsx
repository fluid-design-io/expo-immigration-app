import { Button, Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";
import { useAuth } from "@/lib/auth-context";

export default function ProfileScreen() {
  const { signOut } = useAuth();

  return (
    <Screen title="Profile" subtitle="Your reusable info and document vault.">
      <Card className="gap-2 p-4">
        <Typography className="text-lg font-semibold">Reusable profile</Typography>
        <Typography.Paragraph className="opacity-60">
          Your personal details, saved once and reused on every renewal.
        </Typography.Paragraph>
      </Card>
      <Card className="gap-2 p-4">
        <Typography className="text-lg font-semibold">Document vault</Typography>
        <Typography.Paragraph className="opacity-60">
          Track your work permit, passport, and green card — and get reminders before they expire.
        </Typography.Paragraph>
      </Card>
      <Button onPress={signOut}>Sign out</Button>
    </Screen>
  );
}
