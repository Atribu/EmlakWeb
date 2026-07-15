import type { ReactNode } from "react";

type PanelFormProgressStep = {
  label: string;
  helper: string;
};

type PanelFormProgressProps = {
  steps: PanelFormProgressStep[];
};

type PanelFormStepHeaderProps = {
  step: string;
  title: string;
  description: string;
};

type PanelFormSummaryProps = {
  title: string;
  description: string;
  items: Array<{
    label: string;
    value: ReactNode;
    tone?: "default" | "success" | "warning" | "danger";
  }>;
  action?: ReactNode;
};

export function PanelFormProgress({ steps }: PanelFormProgressProps) {
  return (
    <div className="admin-form-progress">
      {steps.map((step, index) => (
        <div key={step.label} className="admin-form-progress-item">
          <span className="admin-form-progress-number">{String(index + 1).padStart(2, "0")}</span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold text-slate-900">{step.label}</span>
            <span className="mt-0.5 block truncate text-xs text-slate-500">{step.helper}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

export function PanelFormStepHeader({ step, title, description }: PanelFormStepHeaderProps) {
  return (
    <div className="admin-form-step-header md:col-span-2">
      <span className="admin-form-step-number">{step}</span>
      <div className="min-w-0">
        <h3 className="text-lg font-semibold tracking-tight text-slate-950">{title}</h3>
        <p className="mt-1 text-sm leading-6 text-slate-600">{description}</p>
      </div>
    </div>
  );
}

export function PanelFormSummary({ title, description, items, action }: PanelFormSummaryProps) {
  return (
    <aside className="admin-form-summary">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-700">Kayıt Özeti</p>
        <h3 className="mt-2 text-lg font-semibold text-slate-950">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item) => (
          <div key={item.label} className="admin-form-summary-row">
            <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{item.label}</span>
            <span
              data-tone={item.tone ?? "default"}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 data-[tone=danger]:bg-rose-100 data-[tone=danger]:text-rose-700 data-[tone=success]:bg-emerald-100 data-[tone=success]:text-emerald-700 data-[tone=warning]:bg-amber-100 data-[tone=warning]:text-amber-700"
            >
              {item.value}
            </span>
          </div>
        ))}
      </div>

      {action ? <div className="mt-5">{action}</div> : null}
    </aside>
  );
}
