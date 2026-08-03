export interface AwardInput {
  costOfAttendanceCents: number;
  institutionalGrantCents: number;
  federalGrantCents: number;
  stateGrantCents: number;
  meritScholarshipCents: number;
  outsideScholarshipCents: number;
  workStudyCents: number;
  subsidizedLoanCents: number;
  unsubsidizedLoanCents: number;
  parentPlusLoanCents: number;
}

export interface NetPrice {
  giftAidCents: number;
  netPriceCents: number;
  fourYearCents: number;
  loansOfferedCents: number;
  workStudyCents: number;
  /** Share of the "aid" package that is actually debt. */
  debtShare: number;
}

/**
 * Net price = cost of attendance − gift aid.
 *
 * Loans and work-study are deliberately excluded. They are debt and wages, not
 * discounts, and award letters routinely present them as though they reduce the
 * price. Roughly a third of letters omit cost of attendance entirely, which is
 * why this recomputes from components rather than trusting a stated "net cost".
 */
export function computeNetPrice(award: AwardInput): NetPrice {
  const giftAidCents =
    award.institutionalGrantCents +
    award.federalGrantCents +
    award.stateGrantCents +
    award.meritScholarshipCents +
    award.outsideScholarshipCents;

  const netPriceCents = Math.max(0, award.costOfAttendanceCents - giftAidCents);

  const loansOfferedCents =
    award.subsidizedLoanCents + award.unsubsidizedLoanCents + award.parentPlusLoanCents;

  const packaged = giftAidCents + loansOfferedCents + award.workStudyCents;

  return {
    giftAidCents,
    netPriceCents,
    // Tuition rises, but a four-year multiple is the standard comparison and
    // avoids inventing an inflation rate.
    fourYearCents: netPriceCents * 4,
    loansOfferedCents,
    workStudyCents: award.workStudyCents,
    debtShare: packaged === 0 ? 0 : loansOfferedCents / packaged,
  };
}

export function formatCents(cents: number): string {
  return `$${Math.round(cents / 100).toLocaleString("en-US")}`;
}
