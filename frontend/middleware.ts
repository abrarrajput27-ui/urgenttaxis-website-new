import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginRoute = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginRoute) {
    if (!user) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    // RBAC Authorization Check
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role_id, roles(role_code)')
      .eq('user_id', user.id);

    const rolesList =
      (userRoles as unknown as Array<{ roles: { role_code: string } | { role_code: string }[] | null }>)
        ?.map((ur) => (Array.isArray(ur.roles) ? ur.roles[0]?.role_code : ur.roles?.role_code))
        .filter((role): role is string => Boolean(role)) || [];
    const hasAdminAccess = rolesList.some((role: string) =>
      ['super_admin', 'admin', 'fleet_manager', 'dispatcher', 'billing_clerk', 'content_manager'].includes(role)
    );

    if (!hasAdminAccess) {
      // User is authenticated in Supabase but lacks an assigned Admin role
      return NextResponse.redirect(new URL('/admin/login?error=UnauthorizedAccess', request.url));
    }
  }

  if (isLoginRoute && user) {
    // If logged in user hits login, redirect to dashboard
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/admin/:path*'],
};
