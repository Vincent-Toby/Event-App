import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Discover events</h1>
      <Card>
        <CardHeader>
          <CardTitle>No events yet</CardTitle>
          <CardDescription>
            Events people create will show up here.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}