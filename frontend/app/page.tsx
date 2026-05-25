import { RealtimeDashboard } from "../RealtimeDashboard";

export default function Page() {
  return (
    <RealtimeDashboard
      initialSymbol="USDJPY"
      pollMs={200}
    />
  );
}
