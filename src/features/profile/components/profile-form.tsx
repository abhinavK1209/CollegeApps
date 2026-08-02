"use client";

import { useActionState } from "react";
import { Check } from "lucide-react";
import { saveProfile, type ProfileResult } from "@/app/(app)/profile/_actions";
import { US_STATES } from "@/lib/constants";

export interface ProfileDefaults {
  graduationYear: number;
  highSchoolName: string;
  gpaUnweighted: string;
  gpaWeighted: string;
  residencyState: string;
  intendedMajors: string;
  needsFinancialAid: boolean;
  parentsSeparated: boolean;
  isFirstGeneration: boolean;
  satTotal: string;
  actComposite: string;
}

const INPUT =
  "border-border bg-surface text-fg h-9 w-full rounded-[10px] border px-3 text-[13.5px] outline-none focus-visible:border-accent";
const LABEL = "text-fg text-[13px] font-medium";
const HINT = "text-fg-subtle text-[12px]";

type State = ProfileResult | null;

export function ProfileForm({ defaults }: { defaults: ProfileDefaults }) {
  const [state, formAction, pending] = useActionState<State, FormData>(
    async (_prev, formData) => saveProfile(formData),
    null,
  );

  return (
    <form action={formAction} className="space-y-6">
      <section className="border-border bg-surface space-y-4 rounded-[14px] border p-5">
        <h2 className="text-fg text-[15px] font-semibold">School</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="graduationYear">
              Graduation year
            </label>
            <input
              id="graduationYear"
              name="graduationYear"
              type="number"
              defaultValue={defaults.graduationYear}
              className={INPUT}
              required
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="residencyState">
              Home state
            </label>
            <select
              id="residencyState"
              name="residencyState"
              defaultValue={defaults.residencyState}
              className={INPUT}
            >
              <option value="">Not set</option>
              {US_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            <p className={HINT}>Used later for in-state tuition and state aid.</p>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className={LABEL} htmlFor="highSchoolName">
            High school
          </label>
          <input
            id="highSchoolName"
            name="highSchoolName"
            defaultValue={defaults.highSchoolName}
            className={INPUT}
          />
        </div>

        <div className="space-y-1.5">
          <label className={LABEL} htmlFor="intendedMajors">
            Intended majors
          </label>
          <input
            id="intendedMajors"
            name="intendedMajors"
            defaultValue={defaults.intendedMajors}
            placeholder="Biology, Public Policy"
            className={INPUT}
          />
          <p className={HINT}>Comma separated.</p>
        </div>
      </section>

      <section className="border-border bg-surface space-y-4 rounded-[14px] border p-5">
        <div>
          <h2 className="text-fg text-[15px] font-semibold">Academics</h2>
          <p className={HINT}>
            Scores are what make reach / target / likely meaningful rather than
            decorative.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="gpaUnweighted">
              GPA (unweighted)
            </label>
            <input
              id="gpaUnweighted"
              name="gpaUnweighted"
              type="number"
              step="0.001"
              min="0"
              max="5"
              defaultValue={defaults.gpaUnweighted}
              className={INPUT}
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="gpaWeighted">
              GPA (weighted)
            </label>
            <input
              id="gpaWeighted"
              name="gpaWeighted"
              type="number"
              step="0.001"
              min="0"
              max="6"
              defaultValue={defaults.gpaWeighted}
              className={INPUT}
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="satTotal">
              SAT total
            </label>
            <input
              id="satTotal"
              name="satTotal"
              type="number"
              min="400"
              max="1600"
              step="10"
              defaultValue={defaults.satTotal}
              className={INPUT}
            />
          </div>
          <div className="space-y-1.5">
            <label className={LABEL} htmlFor="actComposite">
              ACT composite
            </label>
            <input
              id="actComposite"
              name="actComposite"
              type="number"
              min="1"
              max="36"
              defaultValue={defaults.actComposite}
              className={INPUT}
            />
          </div>
        </div>
      </section>

      <section className="border-border bg-surface space-y-3 rounded-[14px] border p-5">
        <h2 className="text-fg text-[15px] font-semibold">Circumstances</h2>

        <Checkbox
          name="needsFinancialAid"
          defaultChecked={defaults.needsFinancialAid}
          label="I'll be applying for financial aid"
          hint="Turns on FAFSA, CSS Profile, and per-school aid deadlines."
        />
        <Checkbox
          name="parentsSeparated"
          defaultChecked={defaults.parentsSeparated}
          label="My parents are divorced or separated"
          hint="Most CSS Profile schools then require a second Profile filed from the noncustodial parent's own College Board account — a step people routinely discover too late."
        />
        <Checkbox
          name="isFirstGeneration"
          defaultChecked={defaults.isFirstGeneration}
          label="I'll be a first-generation college student"
        />
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-9 items-center rounded-[10px] px-4 text-[13.5px] font-medium transition-colors duration-100 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save profile"}
        </button>

        {state?.ok === true && (
          <span className="text-success flex items-center gap-1.5 text-[13px]">
            <Check className="size-4" strokeWidth={2} />
            Saved
          </span>
        )}
        {state?.ok === false && (
          <span className="text-danger text-[13px]">{state.error}</span>
        )}
      </div>
    </form>
  );
}

function Checkbox({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="accent-accent mt-0.5 size-4 shrink-0"
      />
      <span>
        <span className="text-fg block text-[13.5px]">{label}</span>
        {hint && <span className={`${HINT} block`}>{hint}</span>}
      </span>
    </label>
  );
}
