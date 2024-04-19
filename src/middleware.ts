import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

function chainMiddlewares(
  functions: MiddlewareFactory[] = [],
  index = 0
): NextMiddleware {
  const current = functions[index];
  if (current) {
    const next = chainMiddlewares(functions, index + 1);
    return current(next);
  }
  return () => NextResponse.next();
}

function withLogging(middleware: NextMiddleware) {
  return (request: NextRequest, event: NextFetchEvent) => {
    const log = {
      ip: request.ip,
      geo: request.geo,
      url: request.nextUrl.pathname,
      clientIp: request.headers.get("x-forwarded-for"),
    };
    console.log(JSON.stringify(log, (k, v) => (v === undefined ? null : v)));
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

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

export default chainMiddlewares([withLogging, iPRestrict]);
