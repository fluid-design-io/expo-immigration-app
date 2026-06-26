import { Button, Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";

export default function TrackerScreen() {
  return (
    <Screen title="Tracker" subtitle="Follow your case status.">
      <Card className="gap-3 p-4">
        <Typography className="text-lg font-semibold">Track a case</Typography>
        <Typography.Paragraph className="opacity-60">
          Add your USCIS receipt number to follow your case. You log status updates yourself —
          USCIS does not offer live status to consumer apps — and we show typical processing times
          for context.
        </Typography.Paragraph>
        <Button>Add a receipt number</Button>
      </Card>
    </Screen>
  );
}
