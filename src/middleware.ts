import {
  NextFetchEvent,
  NextMiddleware,
  NextRequest,
  NextResponse,
} from "next/server";

type MiddlewareFactory = (middleware: NextMiddleware) => NextMiddleware;

/**
 * 여러개의 미들웨어 함수를 연결해주는 함수 입니다.
 */
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

/**
 * 로그를 볼 수 있습니다.
 */
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

/**
 * 아이피 제한을 걸어주는 미들웨어 함수 입니다.
 */
function iPRestrict(middleware: NextMiddleware) {
  return (request: NextRequest, event: NextFetchEvent) => {
    const blockRoutes = new Set(["/blocked"]);
    const { pathname } = request.nextUrl;
    if (blockRoutes.has(pathname)) {
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

/**
 * 미들웨어가 전역에서 실행될 수 있도록 설정합니다.
 */
export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/(api|trpc)(.*)"],
};

export default chainMiddlewares([withLogging, iPRestrict]);
