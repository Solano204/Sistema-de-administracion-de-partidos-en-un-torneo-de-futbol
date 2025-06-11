// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getAuthUserAdmin } from "./app/utils/Domain/AuthenticationActions/AuthUser";

// Define paths that require admin access
const ADMIN_PATHS = ['/Admin', '/Admin/'];

// Define paths that should be excluded from middleware processing
const EXCLUDED_PATHS = [
  '/Soccer/Categories',
  '/Categories',
  // '/agendaSemanal',
    '/agenda',
  '/.well-known/appspecific/com.chrome.devtools.json', // Common browser dev tool path
  '/api/', // Typically API routes
  '/favicon.ico',
  '/_next/', // Next.js internal paths
  '/static/' // Static assets
];

// Helper function to check if a path should be excluded
function isExcludedPath(path: string): boolean {
  return EXCLUDED_PATHS.some(excludedPath => 
    path.startsWith(excludedPath)
  );
}

// Helper function to check if a path requires admin access
function isAdminPath(path: string): boolean {
  return ADMIN_PATHS.some(adminPath => 
    path.startsWith(adminPath)
  );
}

// async function getAuthUserAdmin(): Promise<boolean> {
//   try {
//     // Get the token from cookies
//     const token = (await cookies()).get("session")?.value;
    
//     // For now, we're just checking if the token exists
//     // Later, you can implement actual admin verification logic
//     return !!token; // Returns true if token exists, false otherwise
//   } catch (error) {
//     console.error("Error checking admin status:", error);
//     return false;
//   }
// }

export default async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  console.log("Middleware executing for:", path);
  
  // Skip middleware for excluded paths
  if (isExcludedPath(path)) {
    console.log("Skipping middleware for excluded path:", path);
    return NextResponse.next();
  }

  // Check if this is an admin path
  if (isAdminPath(path)) {
    const isAdmin = await getAuthUserAdmin();
    console.log("isAdmin:", isAdmin);
    
    if (!isAdmin) {
      // Redirect non-admins to /Soccer
      console.log("Not admin, redirecting to /Soccer");
      return NextResponse.redirect(new URL('/Soccer', request.url));
    }
  }

  // Allow the request to proceed
  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon\\.ico).*)',
  ],
};