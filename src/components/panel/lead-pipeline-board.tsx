"use client";

import { useMemo, useState } from "react";

import { leadSourceLabel, leadStageLabel } from "@/lib/format";
import type { Advisor, ContactLead, LeadStage, Property, SafeUser } from "@/lib/types";

type LeadPipelineBoardProps = {
  initialLeads: ContactLead[];
  properties: Property[];
  currentUser: SafeUser;
  advisors: Advisor[];
};

const stageOptions: LeadStage[] = [
  "new",
  "called",
  "appointment_scheduled",
  "offer_submitted",
  "won",
  "lost",
];

export function LeadPipelineBoard({ initialLeads, properties, currentUser, advisors }: LeadPipelineBoardProps) {
  const [leads, setLeads] = useState<ContactLead[]>(initialLeads);
  const [filterStage, setFilterStage] = useState<LeadStage | "all">("all");
  const [savingLeadId, setSavingLeadId] = useState<string | null>(null);

  const propertyBySlug = useMemo(
    () => new Map(properties.map((property) => [property.slug, property])),
    [properties],
  );
  const advisorById = useMemo(
    () => new Map(advisors.map((advisor) => [advisor.id, advisor])),
    [advisors],
  );

  const filteredLeads = useMemo(() => {
    if (filterStage === "all") {
      return leads;
    }

    return leads.filter((lead) => lead.stage === filterStage);
  }, [filterStage, leads]);

  const stageCounts = useMemo(() => {
    return stageOptions.reduce<Record<LeadStage, number>>(
      (acc, stage) => {
        acc[stage] = leads.filter((lead) => lead.stage === stage).length;
        return acc;
      },
      {
        new: 0,
        called: 0,
        appointment_scheduled: 0,
        offer_submitted: 0,
        won: 0,
        lost: 0,
      },
    );
  }, [leads]);

  async function updateLead(lead: ContactLead, stage: LeadStage, pipelineNote?: string) {
    setSavingLeadId(lead.id);

    const response = await fetch(`/api/leads/${lead.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage, pipelineNote }),
    });

    if (!response.ok) {
      setSavingLeadId(null);
      return;
    }

    const payload = (await response.json()) as { lead: ContactLead };

    setLeads((previous) =>
      previous
        .map((item) => (item.id === payload.lead.id ? payload.lead : item))
        .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt)),
    );

    setSavingLeadId(null);
  }

  return (
    <section className="rounded-2xl border border-[#d8ccb9] bg-[#fffdf8] p-6 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-[1.9rem] font-semibold leading-none text-[#231d15]">CRM Lead Pipeline</h2>
          <p className="mt-2 text-sm text-[#665c4f]">
            {currentUser.role === "advisor"
              ? "Size atanmış bilgi ve randevu taleplerini tek ekrandan takip edin."
              : "Lead aşamalarını güncelleyin, randevu ve teklif sürecini tek ekrandan takip edin."}
          </p>
        </div>

        <select
          value={filterStage}
          onChange={(event) => setFilterStage(event.target.value as LeadStage | "all")}
          className="input max-w-[220px]"
        >
          <option value="all">Tüm Aşamalar</option>
          {stageOptions.map((stage) => (
            <option key={stage} value={stage}>
              {leadStageLabel(stage)} ({stageCounts[stage]})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        {stageOptions.map((stage) => (
          <article key={stage} className="rounded-xl border border-[#e2d6c4] bg-white p-3">
            <p className="text-[10px] uppercase tracking-[0.16em] text-[#8b7e69]">{leadStageLabel(stage)}</p>
            <p className="mt-1 text-2xl font-semibold text-[#2d251a]">{stageCounts[stage]}</p>
          </article>
        ))}
      </div>

      <div className="mt-5 space-y-3">
        {filteredLeads.length === 0 ? (
          <p className="rounded-xl border border-dashed border-[#d8ccb8] p-4 text-sm text-[#6d6253]">
            Bu aşamada lead bulunmuyor.
          </p>
        ) : (
          filteredLeads.slice(0, 20).map((lead) => {
            const property = propertyBySlug.get(lead.propertySlug);
            return (
              <article key={lead.id} className="rounded-xl border border-[#e2d7c5] bg-white p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#8e816b]">
                      {leadSourceLabel(lead.source)}
                    </p>
                    <h3 className="text-lg font-semibold text-[#2c251a]">{lead.name}</h3>
                    <p className="text-sm text-[#665d50]">
                      {lead.phone} • {lead.email}
                    </p>
                    {property ? (
                      <p className="mt-1 text-sm text-[#5c5347]">
                        Portföy: <span className="font-semibold">{property.title}</span>
                      </p>
                    ) : null}
                    {lead.assignedAdvisorId ? (
                      <p className="mt-1 text-sm text-[#5c5347]">
                        Danışman:{" "}
                        <span className="font-semibold">
                          {advisorById.get(lead.assignedAdvisorId)?.name ?? "Atanmamış"}
                        </span>
                      </p>
                    ) : null}
                    {lead.preferredDate && lead.preferredTime ? (
                      <p className="mt-1 text-sm text-[#6a4f22]">
                        Randevu: {lead.preferredDate} • {lead.preferredTime}
                      </p>
                    ) : null}
                    <p className="mt-1 text-sm text-[#6a5f50]">{lead.message}</p>
                  </div>

                  <div className="min-w-[200px] space-y-2">
                    <select
                      value={lead.stage}
                      disabled={savingLeadId === lead.id}
                      onChange={(event) =>
                        updateLead(lead, event.target.value as LeadStage, lead.pipelineNote)
                      }
                      className="input"
                    >
                      {stageOptions.map((stage) => (
                        <option key={stage} value={stage}>
                          {leadStageLabel(stage)}
                        </option>
                      ))}
                    </select>

                    <form
                      onSubmit={(event) => {
                        event.preventDefault();
                        const formData = new FormData(event.currentTarget);
                        const pipelineNote = String(formData.get("pipelineNote") ?? "");
                        void updateLead(lead, lead.stage, pipelineNote);
                      }}
                      className="grid gap-2"
                    >
                      <input
                        name="pipelineNote"
                        defaultValue={lead.pipelineNote ?? ""}
                        className="input"
                        placeholder="Pipeline notu"
                      />
                      <button
                        type="submit"
                        disabled={savingLeadId === lead.id}
                        className="cursor-pointer rounded-full border border-[#d0c2ad] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.15em] text-[#6f5a3c] transition hover:bg-[#f1e6d5] disabled:cursor-not-allowed"
                      >
                        {savingLeadId === lead.id ? "Kaydediliyor" : "Notu Kaydet"}
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>
    </section>
  );
}
