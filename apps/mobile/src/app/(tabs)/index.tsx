import { Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";

export default function HomeScreen() {
  return (
    <Screen title="Home" subtitle="Your deadlines at a glance.">
      <Card className="gap-2 p-4">
        <Typography className="text-lg font-semibold">Next deadline</Typography>
        <Typography.Paragraph className="opacity-60">
          Add your work permit (Form I-765) and its expiry date, and your renewal window plus
          reminders will appear here.
        </Typography.Paragraph>
      </Card>
      <Card className="gap-2 p-4">
        <Typography className="text-lg font-semibold">Start a renewal</Typography>
        <Typography.Paragraph className="opacity-60">
          Guided I-765 work-authorization renewal — your saved profile and documents pre-fill most
          of it.
        </Typography.Paragraph>
      </Card>
    </Screen>
  );
}
