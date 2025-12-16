import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { SupabaseClient, User } from '@supabase/supabase-js'

async function checkRoleBasedAccess(
  supabase: SupabaseClient,
  user: User,
  request: NextRequest
): Promise<NextResponse | null> {
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single()

  // If user has no profile, they need to be provisioned
  if (profileError || !profile) {
    console.warn(
      `[Middleware] User ${user.email} (${user.id}) has no profile record. Profile error: ${profileError?.message || 'Profile is null'}`
    )

    // Prevent access to protected routes if no profile exists
    const pathname = request.nextUrl.pathname
    if (
      pathname.startsWith('/owner') ||
      pathname.startsWith('/firmsync') ||
      pathname.startsWith('/admin')
    ) {
      const url = request.nextUrl.clone()
      url.pathname = '/auth/profile-not-found'
      return NextResponse.redirect(url)
    }
    return null
  }

  const pathname = request.nextUrl.pathname
  const role = profile.role

  // Super admin access check
  if (pathname.startsWith('/owner') && role !== 'super_admin') {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Admin access check
  if (
    pathname.startsWith('/firmsync/admin') &&
    !['super_admin', 'admin'].includes(role)
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Tenant-specific access check
  const tenantIdRegex = /\/firmsync\/(\d+)/
  const tenantIdMatch = tenantIdRegex.exec(pathname)
  if (tenantIdMatch) {
    const urlTenantId = Number.parseInt(tenantIdMatch[1])
    if (!['super_admin', 'admin'].includes(role) && profile.tenant_id !== urlTenantId) {
      const url = request.nextUrl.clone()
      url.pathname = '/'
      return NextResponse.redirect(url)
    }
  }

  return null
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Role-based route protection
  if (user) {
    const protectionResponse = await checkRoleBasedAccess(
      supabase,
      user,
      request
    )
    if (protectionResponse) {
      return protectionResponse
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
