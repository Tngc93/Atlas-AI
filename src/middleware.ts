import { NextResponse } from "next/server";

export function middleware() {
  if (process.env.PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.next();
  }

  return NextResponse.json(
    { error: "This operation is unavailable in the public demo. Reset the demo or continue with fictional data." },
    { status: 403, headers: { "Cache-Control": "no-store" } },
  );
}

export const config = {
  matcher: ["/api/:path*"],
};
