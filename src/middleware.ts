import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

function withLogging(middleware: NextMiddleware) {
  return (request: NextRequest, event: NextFetchEvent) => {
    if (
      request.nextUrl.pathname.match(/\/(?!.*\..*|_next).*/) ||
      request.nextUrl.pathname.match(/\/(api|trpc)(.*)/)
    ) {
      const log = {
        ip: request.ip,
        geo: request.geo,
        url: request.nextUrl.pathname,
        clientIp: request.headers.get("x-forwarded-for"),
      };
      console.log(JSON.stringify(log, (k, v) => (v === undefined ? null : v)));
    }
    return middleware(request, event);
  };
}

function iPRestrict(middleware: NextMiddleware) {
  return (request: NextRequest, event: NextFetchEvent) => {
    // blcoked 페이지에서만 아이피 제한이 실행됩니다.
    if (request.nextUrl.pathname === "/blocked") {
      const whitelist: string = process.env.WHITELIST || "";
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

      return middleware(request, event);
    }

    return middleware(request, event);
  };
}

export default withLogging(iPRestrict(() => NextResponse.next()));
