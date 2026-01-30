import { NextResponse, type NextRequest } from "next/server";
import { getCookieName, isTokenExpired } from "@/lib/jwt";
import { ICompany, IUser } from "./types";

// Constants
const PATHS = {
  auth: {
    signin: "/auth/signin",
    signup: "/auth/signup",
    signupCompany: "/auth/signup/company",
    signupStripe: "/auth/signup/stripe",
    signupPackage: "/auth/signup/package",
    signupPackageSuccess: "/auth/signup/package/success",
    signupPackageCancel: "/auth/signup/package/cancel",
  },
  protected: {
    account: "/account",
    dashboard: "/dashboard",
  },
  invite: "/invite/",
  watch: "/watch",
  room: "room",
  root: "/",
} as const;

const COOKIES = {
  accessToken: getCookieName("accessToken"),
  refreshToken: getCookieName("refreshToken"),
} as const;

const ENV = {
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "",
  watchDomain: process.env.NEXT_PUBLIC_WATCH_URL || "",
  apiUrl: process.env.NEXT_PUBLIC_API_URL || "",
} as const;

// Helper Functions
const createRedirectUrl = (request: NextRequest, targetPath: string): URL => {
  const url = new URL(targetPath, request.url);
  request.nextUrl.searchParams.forEach((value, key) => {
    url.searchParams.set(key, value);
  });
  return url;
};

const clearAuthCookies = (response: NextResponse): NextResponse => {
  response.cookies.delete(COOKIES.accessToken);
  response.cookies.delete(COOKIES.refreshToken);
  return response;
};

const handleWatchDomain = (request: NextRequest): NextResponse | null => {
  const host = request.headers.get("host");
  const { pathname, searchParams } = request.nextUrl;

  if (
    !ENV.watchDomain ||
    !host?.startsWith(new URL(ENV.watchDomain).host) ||
    ENV.appUrl === ENV.watchDomain
  ) {
    return null;
  }

  const pathParts = pathname.split("/").filter(Boolean);
  const slug = pathParts[0];

  if (slug && slug.length > 9) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = PATHS.watch;
    rewriteUrl.searchParams.set("s", slug);
    return NextResponse.rewrite(rewriteUrl);
  }

  if (!pathParts.includes(PATHS.room)) {
    const portalUrl = new URL(pathname, ENV.appUrl);
    searchParams.forEach((value, key) => {
      portalUrl.searchParams.set(key, value);
    });
    return NextResponse.redirect(portalUrl);
  }

  return null;
};

const refreshAccessToken = async (
  request: NextRequest
): Promise<NextResponse | null> => {
  try {
    const response = await fetch(`${ENV.apiUrl}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok) {
      const redirectResponse = NextResponse.redirect(
        createRedirectUrl(request, PATHS.auth.signin)
      );
      return clearAuthCookies(redirectResponse);
    }

    return NextResponse.next();
  } catch (error) {
    const redirectResponse = NextResponse.redirect(
      createRedirectUrl(request, PATHS.auth.signin)
    );
    return clearAuthCookies(redirectResponse);
  }
};

const fetchUser = async (request: NextRequest): Promise<IUser | null> => {
  try {
    const response = await fetch(`${ENV.apiUrl}/users/me`, {
      credentials: "include",
      headers: { Cookie: request.headers.get("cookie") || "" },
    });

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

const fetchCompany = async (
  request: NextRequest,
  companyId: string
): Promise<ICompany | null> => {
  try {
    const response = await fetch(`${ENV.apiUrl}/companies/${companyId}`, {
      credentials: "include",
      headers: { Cookie: request.headers.get("cookie") || "" },
    });

    return response.ok ? await response.json() : null;
  } catch {
    return null;
  }
};

// Path Checkers
const isAuthPath = (pathname: string): boolean =>
  pathname === PATHS.auth.signin || pathname === PATHS.auth.signup;

const isSignupPath = (pathname: string): boolean => {
  const signupPaths = [
    PATHS.auth.signupCompany,
    PATHS.auth.signupStripe,
    PATHS.auth.signupPackage,
  ];

  return (
    signupPaths.some((path) => pathname.startsWith(path)) &&
    !pathname.startsWith(PATHS.auth.signupPackageSuccess) &&
    !pathname.startsWith(PATHS.auth.signupPackageCancel)
  );
};

const isProtectedPath = (pathname: string): boolean =>
  pathname.startsWith(PATHS.protected.account) ||
  pathname.startsWith(PATHS.protected.dashboard);

// Main Middleware
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle watch domain routing
  const watchResponse = handleWatchDomain(request);
  if (watchResponse) return watchResponse;

  // ===========================================
  // UI DEVELOPMENT MODE - AUTH BYPASSED
  // Remove this block to restore auth checks
  // ===========================================
  // Redirect root to dashboard for easy access during UI development
  if (pathname === PATHS.root) {
    return NextResponse.redirect(createRedirectUrl(request, PATHS.protected.dashboard));
  }
  // Allow all pages to render without auth
  return NextResponse.next();
  // ===========================================
  // END UI DEVELOPMENT MODE
  // ===========================================

  // Get authentication tokens
  const accessToken = request.cookies.get(COOKIES.accessToken)?.value;
  const refreshToken = request.cookies.get(COOKIES.refreshToken)?.value;
  const isAccessTokenExpired = accessToken ? isTokenExpired(accessToken) : true;

  // Path categorization
  const pathChecks = {
    isAuth: isAuthPath(pathname),
    isSignup: isSignupPath(pathname),
    isProtected: isProtectedPath(pathname),
    isDashboard: pathname.startsWith(PATHS.protected.dashboard),
    isAccount: pathname.startsWith(PATHS.protected.account),
    isCreateCompany: pathname.startsWith(PATHS.auth.signupCompany),
    isStripeOnboarding: pathname.startsWith(PATHS.auth.signupStripe),
    isPackage: pathname.startsWith(PATHS.auth.signupPackage),
    isInvitation: pathname.startsWith(PATHS.invite),
    isRoot: pathname === PATHS.root,
  };

  // Redirect authenticated users away from auth pages
  if (pathChecks.isAuth && accessToken) {
    return NextResponse.redirect(
      createRedirectUrl(request, PATHS.protected.account)
    );
  }

  // Redirect unauthenticated users from signup/protected paths
  if ((pathChecks.isSignup || pathChecks.isProtected) && !accessToken) {
    console.log("access token is not valid");
    if (pathChecks.isSignup) console.log(pathname);
    return NextResponse.redirect(createRedirectUrl(request, PATHS.auth.signin));
  }

  // Handle expired access token with valid refresh token
  if (pathChecks.isProtected && accessToken && isAccessTokenExpired) {
    console.log("access token is expired");

    if (refreshToken && !isTokenExpired(refreshToken)) {
      const refreshResponse = await refreshAccessToken(request);
      if (refreshResponse) return refreshResponse;
    } else {
      const redirectResponse = NextResponse.redirect(
        createRedirectUrl(request, PATHS.auth.signin)
      );
      return clearAuthCookies(redirectResponse);
    }
  }

  // Fetch user and company data for authenticated requests
  let user: IUser | null = null;
  let company: ICompany | null = null;

  if (accessToken) {
    user = await fetchUser(request);
    if (user?.company?.id) {
      company = await fetchCompany(request, user.company.id);
    }
  }

  // Protected path validations
  if (pathChecks.isProtected && accessToken) {
    if (pathChecks.isDashboard && !pathChecks.isInvitation) {
      if (!user?.isSubscribed) {
        return NextResponse.redirect(
          createRedirectUrl(request, PATHS.auth.signupPackage)
        );
      }
      if (!company && user?.isSubscribed) {
        return NextResponse.redirect(
          createRedirectUrl(request, PATHS.auth.signupCompany)
        );
      }
    }
  }

  // Signup flow validations
  if (pathChecks.isCreateCompany) {
    if (!user?.isSubscribed) {
      return NextResponse.redirect(
        createRedirectUrl(request, PATHS.auth.signupPackage)
      );
    }
    if (user?.company?.id) {
      return NextResponse.redirect(
        createRedirectUrl(request, PATHS.protected.dashboard)
      );
    }
  }

  if (pathChecks.isStripeOnboarding && company?.stripeOnboarding) {
    return NextResponse.redirect(
      createRedirectUrl(request, PATHS.protected.dashboard)
    );
  }

  if (pathChecks.isPackage && user?.isSubscribed) {
    return NextResponse.redirect(
      createRedirectUrl(request, PATHS.protected.dashboard)
    );
  }

  // Root path redirect
  if (pathChecks.isRoot) {
    const redirectPath = company
      ? PATHS.protected.dashboard
      : PATHS.protected.account;
    return NextResponse.redirect(createRedirectUrl(request, redirectPath));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|images).*)"],
};
