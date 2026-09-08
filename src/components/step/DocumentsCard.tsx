import { Card } from "@/components/ui/Card";

export function DocumentsCard({ documents }: { documents: string[] }) {
  if (documents.length === 0) return null;
  return (
    <Card className="p-5">
      <h2 className="mb-3 text-base font-semibold text-[var(--gray-900)]">
        מסמכים שכדאי להכין
      </h2>
      <div className="flex flex-wrap gap-2">
        {documents.map((document) => (
          <span
            className="rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-2.5 py-1 text-sm text-[var(--gray-600)]"
            key={document}
          >
            📄 {document}
          </span>
        ))}
      </div>
      <p className="mt-3 text-xs text-[var(--gray-500)]">
        מומלץ לסרוק ולשמור עותק דיגיטלי מסודר.
      </p>
    </Card>
  );
}
