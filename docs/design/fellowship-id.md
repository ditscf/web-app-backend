# Fellowship ID

Issued once, when a person becomes an Active Member. It does not change when they take an office, leave an office, or move to a later fellowship year.

## Flow

```text
Applicant records a date of birth, for example 16/12/2000
        ↓
General Secretary approval, then Vice General Secretary approval
        ↓
Operative fellowship year, for example 2026/2027
        ↓
Next sequence for that year, starting at 1
        ↓
Fellowship ID, for example 26160001
```

## Algorithm

The ID is eight digits: year, day of birth, sequence.

1. Read the operative fellowship year label. It must look like `2026/2027`, and the second year must be the first year plus one.
2. Take the last two digits of the start year. `2026` contributes `26`. This is the fellowship year of approval, not the profile field `yearOfStudy`.
3. Take the calendar day of birth, from 1 to 31. `16/12/2000` contributes `16`. The month and the birth year are not used. The day is read in UTC because the stored value is a date, not a time of day.
4. Take the last issued sequence for that fellowship year. A new year starts at `0`. Add 1. The sequence must stay between `1` and `9999`.
5. Join them as two year digits, two day digits, and four sequence digits. A day below 10 is padded, so the 5th is `05`.

```text
Born 16/12/2000, first approval in 2026/2027  → 26160001
Born 16/12/2000, second approval in 2026/2027 → 26160002
Born 05/01/1999, first approval in 2027/2028  → 27050001
```

Two members can share a birth day. The sequence still makes each ID unique inside that fellowship year. The ID column is also unique across all years.

The counter lives on the fellowship year (`lastIssuedMemberNumber`) and is incremented in the same database transaction that creates the membership.

An officer who already has an ID is not issued another one when a new year starts. The new year only adds an office assignment that points at the existing person.

The first-year script uses this same rule for the first five members.
