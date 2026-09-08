import type { ReactNode } from "react";

import { LinkWithExternalIcon } from "@/components/layout/LinkWithExternalIcon";
import { Badge } from "@/components/ui/Badge";
import { Callout } from "@/components/ui/Callout";
import type { Task } from "@/lib/schema";

import { formatMoney } from "./StatBar";
import { TaskInteraction } from "./TaskInteraction";

function InlineMarkdown({ text }: { text: string }) {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .map((part, index) =>
      part.startsWith("**") && part.endsWith("**") ? (
        <strong key={index}>{part.slice(2, -2)}</strong>
      ) : (
        part
      ),
    );
}

function MarkdownDetails({ children }: { children: string }) {
  const blocks = children.split(/\n\s*\n/);
  const rendered: ReactNode[] = [];
  for (const [index, block] of blocks.entries()) {
    const lines = block.split("\n").filter(Boolean);
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      rendered.push(
        <ul className="my-0 space-y-1 ps-5" key={index}>
          {lines.map((line) => (
            <li key={line}>
              <InlineMarkdown text={line.replace(/^[-*]\s+/, "")} />
            </li>
          ))}
        </ul>,
      );
    } else {
      rendered.push(
        <p className="my-0" key={index}>
          <InlineMarkdown text={lines.join(" ")} />
        </p>,
      );
    }
  }
  return <div className="space-y-2">{rendered}</div>;
}

export function TaskRow({ task }: { task: Task }) {
  const hasDetails = Boolean(
    task.details ||
    task.warning ||
    task.documents?.length ||
    task.cost ||
    task.links?.length,
  );

  return (
    <TaskInteraction
      badges={
        <>
          {task.optional ? <Badge variant="optional" /> : null}
          {task.important ? <Badge variant="important" /> : null}
          {task.timing ? <Badge variant="due">{task.timing}</Badge> : null}
        </>
      }
      hasDetails={hasDetails}
      taskId={task.id}
      title={task.title}
    >
      <>
        {task.details ? (
          <MarkdownDetails>{task.details}</MarkdownDetails>
        ) : null}
        {task.warning ? (
          <Callout variant="warn">
            <strong>שימו לב: </strong>
            {task.warning}
          </Callout>
        ) : null}
        {task.documents?.length ? (
          <div>
            <strong className="mb-2 block text-xs text-[var(--gray-600)]">
              מסמכים נדרשים
            </strong>
            <div className="flex flex-wrap gap-2">
              {task.documents.map((document) => (
                <span
                  className="rounded-lg border border-[var(--gray-200)] bg-[var(--gray-50)] px-2.5 py-1 text-sm"
                  key={document}
                >
                  📄 {document}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {task.cost ? (
          <p>
            💸 עלות משוערת: <strong>{formatMoney(task.cost)}</strong>
            {task.cost.note ? (
              <span className="ms-2 rounded-full border border-dashed border-[var(--gray-300)] px-2 py-0.5 text-xs">
                {task.cost.note}
              </span>
            ) : null}
          </p>
        ) : null}
        {task.links?.length ? (
          <div>
            <strong className="mb-2 block text-xs text-[var(--gray-600)]">
              קישורים שימושיים
            </strong>
            <div className="flex flex-wrap gap-2">
              {task.links.map((link) => (
                <LinkWithExternalIcon
                  className="rounded-full border border-[var(--gray-200)] bg-[var(--surface)] px-3 text-sm"
                  href={link.url}
                  key={link.url}
                >
                  {link.label}
                </LinkWithExternalIcon>
              ))}
            </div>
          </div>
        ) : null}
      </>
    </TaskInteraction>
  );
}
