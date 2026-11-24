import { describe, expect, it } from "vitest";
import {
  ageFromTitle,
  birthdayTitle,
  composeDescription,
  endsBeforeStart,
  splitPartyNotes,
  timesFromDescription,
} from "./party";
import { getTemplate } from "./templates";

describe("party copy", () => {
  it("builds a birthday title from a sensible age", () => {
    expect(birthdayTitle("Sophie", "6")).toBe("Sophie's 6th birthday");
    expect(birthdayTitle("Sam", "")).toBe("Sam's party");
    expect(ageFromTitle("Sophie's 6th birthday")).toBe(6);
    expect(ageFromTitle("Sam's party")).toBeNull();
  });

  it("keeps the party time separate from the note", () => {
    const description = composeDescription({
      start: "14:00",
      end: "16:00",
      notes: "Bring a jumper",
      wording: "Come hungry.",
    });
    expect(description.startsWith("From 2pm to 4pm")).toBe(true);
    expect(splitPartyNotes(description)).toEqual({
      timeLabel: "2pm – 4pm",
      body: "Bring a jumper\n\nCome hungry.",
    });
  });

  it("rejects a party that finishes before it starts", () => {
    expect(endsBeforeStart("16:00", "14:00")).toBe(true);
    expect(endsBeforeStart("14:00", "16:00")).toBe(false);
    expect(endsBeforeStart("14:00", "14:00")).toBe(false);
  });

  it("reads a stored time line back into form times", () => {
    const description = composeDescription({
      start: "14:00",
      end: "16:30",
      wording: "Come hungry.",
    });
    expect(timesFromDescription(description)).toEqual({ start: "14:00", end: "16:30" });
    expect(splitPartyNotes(description).body).toBe("Come hungry.");
    expect(timesFromDescription("Just a note")).toBeNull();
  });

  it("maps older invitation styles onto the new themes", () => {
    expect(getTemplate("classic_cream").id).toBe("classic");
    expect(getTemplate("midnight_disco").dark).toBe(true);
    expect(getTemplate("made-up").id).toBe("classic");
  });
});
