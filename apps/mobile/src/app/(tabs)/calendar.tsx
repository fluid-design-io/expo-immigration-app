import { Card, Typography } from "heroui-native";

import { Screen } from "@/components/screen";

export default function CalendarScreen() {
  return (
    <Screen title="Calendar" subtitle="Never miss a renewal window.">
      <Card className="gap-2 p-4">
        <Typography className="text-lg font-semibold">No upcoming deadlines</Typography>
        <Typography.Paragraph className="opacity-60">
          Document expiry dates and filing windows become deadlines here, with push reminders ahead
          of each due date.
        </Typography.Paragraph>
      </Card>
    </Screen>
  );
}
