import { withPasswordProtect } from "@tommyvez/passfort/next";

export default withPasswordProtect({
  paths: ["/jobs"],
  loginPath: "/login",
  excludePaths: ["/api/cron", "/_next", "/favicon.ico"],
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
