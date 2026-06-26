import { Button, Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";

export default function FilingsScreen() {
  return (
    <Screen title="Filings" subtitle="Your applications and drafts.">
      <Card className="gap-3 p-4">
        <Typography className="text-lg font-semibold">No filings yet</Typography>
        <Typography.Paragraph className="opacity-60">
          Start your first Employment Authorization (I-765) renewal. We save your answers so the
          next one is nearly one tap.
        </Typography.Paragraph>
        <Button>Start I-765 renewal</Button>
      </Card>
    </Screen>
  );
}
