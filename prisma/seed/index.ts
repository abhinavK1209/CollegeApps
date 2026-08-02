import { PrismaClient } from "@prisma/client";
import { COLLEGE_SEEDS } from "./data/colleges";
import { LOCAL_USER_EMAIL, LOCAL_USER_ID } from "../../src/lib/constants";

const db = new PrismaClient();

async function seedLocalUser() {
  const user = await db.user.upsert({
    where: { id: LOCAL_USER_ID },
    update: {},
    create: {
      id: LOCAL_USER_ID,
      email: LOCAL_USER_EMAIL,
      name: "You",
    },
  });

  await db.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: { userId: user.id },
  });

  return user;
}

/**
 * Colleges are upserted on slug and only ever write identity fields, so a reseed
 * never clobbers statistics that `db:import:scorecard` populated.
 */
async function seedColleges() {
  let created = 0;
  let updated = 0;

  for (const seed of COLLEGE_SEEDS) {
    const identity = {
      name: seed.name,
      aliases: seed.aliases,
      city: seed.city,
      state: seed.state,
      country: "US",
      type: seed.type,
      platforms: seed.platforms,
      isQuestBridgePartner: seed.isQuestBridgePartner ?? false,
      requiresCssProfile: seed.requiresCssProfile ?? false,
      website: seed.website ?? null,
      dataSource: "curated",
    };

    const existing = await db.college.findUnique({
      where: { slug: seed.slug },
      select: { id: true },
    });

    await db.college.upsert({
      where: { slug: seed.slug },
      update: identity,
      create: { slug: seed.slug, ...identity },
    });

    if (existing) updated += 1;
    else created += 1;
  }

  return { created, updated };
}

async function main() {
  console.warn("Seeding…");

  const user = await seedLocalUser();
  console.warn(`  user      ${user.email}`);

  const colleges = await seedColleges();
  console.warn(`  colleges  ${colleges.created} created, ${colleges.updated} updated`);

  const withStats = await db.college.count({ where: { admitRate: { not: null } } });
  const total = await db.college.count();

  console.warn(`\nDone. ${total} colleges.`);
  if (withStats === 0) {
    console.warn(
      "\nNo admission statistics yet — the seed deliberately ships none.\n" +
        "Run `pnpm db:import:scorecard` to pull real admit rates, test score\n" +
        "ranges, cost, and enrollment from the U.S. Department of Education.",
    );
  } else {
    console.warn(`${withStats} of ${total} have College Scorecard statistics.`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => void db.$disconnect());
