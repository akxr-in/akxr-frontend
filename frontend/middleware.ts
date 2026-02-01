import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_TOKEN_KEY } from "./lib/constants";

// Routes that require authentication (protected routes)
const AUTH_ROUTES = [
    "/",
    "/complete-profile",
];

// Routes only for unauthenticated users (public routes)
const UNAUTH_ROUTES = [
    "/login",
    "/signup",
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

    const isAuthenticated = !!accessToken;
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const isUnauthRoute = UNAUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));

    // Unauthenticated user trying to access protected route -> redirect to login
    if (!isAuthenticated && isAuthRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Authenticated user trying to access unauth route -> redirect to home
    if (isAuthenticated && isUnauthRoute) {
        return NextResponse.redirect(new URL("/", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except:
         * - api routes
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico
         * - public files (images, etc)
         */
        "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
    ],
};
