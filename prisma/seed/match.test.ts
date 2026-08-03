import { describe, expect, it } from "vitest";

import { COLLEGE_SEEDS } from "./data/colleges";
import { matchKeys, normalize } from "./match";

describe("normalize", () => {
  it("keeps institution-type words that distinguish real schools", () => {
    // The bug this guards: stripping "college"/"university"/"institute" folded
    // these pairs onto one key, so one school could be enriched with the
    // other's admit rate and score ranges.
    expect(normalize("Boston College")).not.toBe(normalize("Boston University"));
    expect(normalize("University of Georgia")).not.toBe(
      normalize("Georgia Institute of Technology"),
    );
    expect(normalize("University of Rochester")).not.toBe(
      normalize("Rochester Institute of Technology"),
    );
    expect(normalize("University of Miami")).not.toBe(normalize("Miami University"));
  });

  it("folds the IPEDS -Main Campus suffix onto the plain name", () => {
    expect(normalize("Georgia Institute of Technology-Main Campus")).toBe(
      normalize("Georgia Institute of Technology"),
    );
    expect(normalize("Ohio State University-Main Campus")).toBe(
      normalize("The Ohio State University"),
    );
  });

  it("folds case, punctuation, ampersands, and the standalone 'the'", () => {
    expect(normalize("Texas A&M University")).toBe("texas a and m university");
    expect(normalize("  Yale   University!  ")).toBe("yale university");
    expect(normalize("The New School")).toBe("new school");
  });

  it("does not strip 'main campus' from the middle of a name", () => {
    expect(normalize("Main Campus College")).toBe("main campus college");
  });
});

describe("matchKeys", () => {
  it("ranks the official name ahead of aliases", () => {
    expect(matchKeys("Boston College", ["BC"])[0]).toBe("boston college");
  });

  it("drops nicknames too short to identify a school", () => {
    // "The U" normalizes to "u" and belongs to both Miami and Utah.
    expect(matchKeys("University of Miami", ["UMiami", "The U"])).toEqual([
      "university of miami",
      "umiami",
    ]);
  });

  it("assigns every curated college a unique set of match keys", () => {
    const claimedBy = new Map<string, string>();
    const collisions: string[] = [];

    for (const college of COLLEGE_SEEDS) {
      for (const key of matchKeys(college.name, college.aliases ?? [])) {
        const claimant = claimedBy.get(key);
        if (claimant !== undefined && claimant !== college.name) {
          collisions.push(`"${key}": ${claimant} vs ${college.name}`);
        }
        claimedBy.set(key, college.name);
      }
    }

    expect(collisions).toEqual([]);
  });
});
