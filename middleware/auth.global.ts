export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip middleware on server-side rendering
  if (process.server) return;

  // Public routes that don't require authentication
  const publicRoutes = ['/auth/login'];
  
  // Check if the current route is public
  const isPublicRoute = publicRoutes.some(route => to.path.startsWith(route));
  
  // If it's a public route, allow access
  if (isPublicRoute) {
    return;
  }

  // For protected routes, check authentication
  const { user, initAuth } = useAuth();
  
  // Initialize auth if not already done
  if (!user.value) {
    await initAuth();
  }

  // If still no user after init, redirect to login
  if (!user.value) {
    return navigateTo('/auth/login');
  }
});
