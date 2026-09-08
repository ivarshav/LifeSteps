import { Accordion } from "@/components/ui/Accordion";
import { Card } from "@/components/ui/Card";
import type { Step } from "@/lib/schema";

import { Disclaimer } from "./Disclaimer";
import { DocumentsCard } from "./DocumentsCard";
import { Faq } from "./Faq";
import { ProgressProvider } from "./ProgressContext";
import { RelatedSteps } from "./RelatedSteps";
import { SectionBlock } from "./SectionBlock";
import { Sources } from "./Sources";
import { StickyProgress } from "./StickyProgress";
import { Toc } from "./Toc";

export function StepExperience({
  relatedSteps,
  step,
}: {
  relatedSteps: Step[];
  step: Step;
}) {
  const taskIds = step.sections.flatMap((section) =>
    section.tasks.map((task) => task.id),
  );
  const sidebar = (
    <div className="space-y-4">
      <Card className="p-5">
        <Toc sections={step.sections} />
      </Card>
      <DocumentsCard documents={step.requiredDocuments ?? []} />
      <RelatedSteps steps={relatedSteps} />
    </div>
  );

  return (
    <ProgressProvider stepId={step.id} taskIds={taskIds}>
      <StickyProgress />
      <div className="mb-4 lg:hidden">
        <Accordion title="תוכן עניינים, מסמכים וצעדים קשורים">
          {sidebar}
        </Accordion>
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0">
          {step.sections.map((section, index) => (
            <SectionBlock index={index} key={section.id} section={section} />
          ))}
          <Faq items={step.faq ?? []} />
          <Disclaimer>{step.disclaimer}</Disclaimer>
          <Sources sources={step.sources} />
        </div>
        <aside className="inset-block-start-[calc(var(--hdr-h)+100px)] sticky hidden lg:block">
          {sidebar}
        </aside>
      </div>
    </ProgressProvider>
  );
}
