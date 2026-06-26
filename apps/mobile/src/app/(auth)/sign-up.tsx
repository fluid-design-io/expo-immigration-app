import { Link } from "expo-router";
import { Button, Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";
import { useAuth } from "@/lib/auth-context";

export default function SignUpScreen() {
  const { signIn } = useAuth();

  return (
    <Screen title="Create your account" subtitle="Save your info once, reuse it on every renewal.">
      <Card className="gap-3 p-4">
        <Typography.Paragraph className="opacity-60">
          Account creation is wired in Phase 2. For now, continue to explore the app.
        </Typography.Paragraph>
        <Button onPress={signIn}>Get started</Button>
      </Card>
      <Link href="/">
        <Typography.Paragraph className="opacity-80">Already have an account? Sign in</Typography.Paragraph>
      </Link>
    </Screen>
  );
}
