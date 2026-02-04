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

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get(ACCESS_TOKEN_KEY)?.value;

    const isAuthenticated = !!accessToken;
    const isAuthRoute = AUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const isUnauthRoute = UNAUTH_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
    const isCompleteProfileRoute = pathname === "/complete-profile" || pathname.startsWith("/complete-profile/");

    // Unauthenticated user trying to access protected route -> redirect to login
    if (!isAuthenticated && isAuthRoute) {
        const loginUrl = new URL("/login", request.url);
        loginUrl.searchParams.set("redirect", pathname);
        return NextResponse.redirect(loginUrl);
    }

    // If user is authenticated, check latest profile status from backend
    if (isAuthenticated) {
        const apiBaseUrl = 'https://api-staging.akxr.in';

        try {
            // Call the backend /user endpoint to get fresh profile_status
            const userResponse = await fetch(`${apiBaseUrl}/user`, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (userResponse.ok) {
                const userData = await userResponse.json();
                const profileStatus = userData?.data?.profile_status;

                // If profile is incomplete (AUTHENTICATED), force user to stay on /complete-profile
                if (profileStatus === "AUTHENTICATED" && !isCompleteProfileRoute) {
                    return NextResponse.redirect(new URL("/complete-profile", request.url));
                }

                // If profile is completed, prevent access to /complete-profile
                if (profileStatus === "PROFILE_CREATED" && isCompleteProfileRoute) {
                    return NextResponse.redirect(new URL("/", request.url));
                }
            } else if (userResponse.status === 401) {
                // Token invalid/expired – treat as unauthenticated
                const loginUrl = new URL("/login", request.url);
                loginUrl.searchParams.set("redirect", pathname);
                return NextResponse.redirect(loginUrl);
            }
        } catch {
            // If the user check fails (network/backend issue), just fall through
            // and let the request continue to avoid blocking the app
        }
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
