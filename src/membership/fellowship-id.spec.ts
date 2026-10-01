import { allocateFellowshipId } from "./fellowship-id";

describe("fellowship id", () => {
  const bornOn16December = new Date("2000-12-16T00:00:00.000Z");

  it("joins the year digits, the birth day, and the approval sequence", () => {
    expect(allocateFellowshipId("2026/2027", bornOn16December, 0)).toEqual({
      fellowshipId: "26160001",
      lastIssuedMemberNumber: 1,
    });
    expect(
      allocateFellowshipId("2026/2027", bornOn16December, 1).fellowshipId,
    ).toBe("26160002");
    expect(
      allocateFellowshipId("2027/2028", new Date("1999-01-05T00:00:00.000Z"), 0)
        .fellowshipId,
    ).toBe("27050001");
  });

  it("rejects a year label that is not two consecutive years", () => {
    expect(() => allocateFellowshipId("2026", bornOn16December, 0)).toThrow(
      "Fellowship year label must look like 2026/2027.",
    );
    expect(() =>
      allocateFellowshipId("2026/2028", bornOn16December, 0),
    ).toThrow("Fellowship year label must span two consecutive years.");
  });

  it("stops at 9999 members in one year", () => {
    expect(() =>
      allocateFellowshipId("2026/2027", bornOn16December, 9999),
    ).toThrow("Fellowship ID sequence must be from 1 to 9999.");
  });
});
