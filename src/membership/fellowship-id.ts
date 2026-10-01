const YEAR_LABEL = /^(\d{4})\/(\d{4})$/;
const MAX_SEQUENCE = 9999;

export function fellowshipYearStart(label: string): number {
  const match = YEAR_LABEL.exec(label);
  if (!match) {
    throw new Error("Fellowship year label must look like 2026/2027.");
  }

  const startYear = Number(match[1]);
  const endYear = Number(match[2]);
  if (endYear !== startYear + 1) {
    throw new Error("Fellowship year label must span two consecutive years.");
  }
  return startYear;
}

export function birthDay(dateOfBirth: Date): number {
  if (Number.isNaN(dateOfBirth.getTime())) {
    throw new Error("Date of birth is required to allocate a Fellowship ID.");
  }
  return dateOfBirth.getUTCDate();
}

export function formatFellowshipId(
  startYear: number,
  dayOfBirth: number,
  sequence: number,
): string {
  if (!Number.isInteger(dayOfBirth) || dayOfBirth < 1 || dayOfBirth > 31) {
    throw new Error("Fellowship ID day of birth must be from 1 to 31.");
  }
  if (!Number.isInteger(sequence) || sequence < 1 || sequence > MAX_SEQUENCE) {
    throw new Error("Fellowship ID sequence must be from 1 to 9999.");
  }

  const yearDigits = (startYear % 100).toString().padStart(2, "0");
  const dayDigits = dayOfBirth.toString().padStart(2, "0");
  const sequenceDigits = sequence.toString().padStart(4, "0");
  return `${yearDigits}${dayDigits}${sequenceDigits}`;
}

export function allocateFellowshipId(
  label: string,
  dateOfBirth: Date,
  lastIssuedMemberNumber: number,
): { fellowshipId: string; lastIssuedMemberNumber: number } {
  const sequence = lastIssuedMemberNumber + 1;
  return {
    fellowshipId: formatFellowshipId(
      fellowshipYearStart(label),
      birthDay(dateOfBirth),
      sequence,
    ),
    lastIssuedMemberNumber: sequence,
  };
}
