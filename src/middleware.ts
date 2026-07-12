import { NextResponse } from "next/server";

export function middleware() {
  if (process.env.PUBLIC_DEMO_MODE !== "true") {
    return NextResponse.next();
  }

  return NextResponse.json({ error: "Bu API public demo modunda kullanılamaz." }, { status: 403 });
}

export const config = {
  matcher: ["/api/:path*"],
};
