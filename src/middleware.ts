import { NextRequest, NextResponse } from "next/server";

const whitelist: string = process.env.WHITELIST || "";

export function middleware(request: NextRequest) {
  if (
    request.nextUrl.pathname.match(/\/(?!.*\..*|_next).*/) ||
    request.nextUrl.pathname.match(/\/(api|trpc)(.*)/) ||
    request.nextUrl.pathname === "/blocked"
  ) {
    const log = {
      ip: request.ip,
      geo: request.geo,
      url: request.nextUrl.pathname,
    };
    console.log(JSON.stringify(log, (k, v) => (v === undefined ? null : v)));
  }

  const ipWhiteList = new Set(
    whitelist?.split(",").map((item: string) => {
      return item.trim();
    })
  );

  if (request.ip && !ipWhiteList.has(request.ip as string)) {
    const log = {
      message: `Access denied from ${request.ip}`,
      ip: request.ip,
    };
    console.log(log);
    return new NextResponse(null, { status: 401 });
  }

  return NextResponse.next();
}
