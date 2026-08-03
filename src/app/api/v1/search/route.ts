import { NextResponse } from "next/server";
import { LOCAL_USER_ID } from "@/lib/constants";
import { search } from "@/server/services/search.service";

export async function GET(request: Request) {
  const query = new URL(request.url).searchParams.get("q") ?? "";
  const results = await search(LOCAL_USER_ID, query);
  return NextResponse.json({ results });
}
