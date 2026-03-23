import { RouterProvider, createRouter, createRootRoute, createRoute, redirect, Outlet } from '@tanstack/react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useQueries';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import OnboardingFlow from './pages/OnboardingFlow';
import Dashboard from './pages/Dashboard';
import { Toaster } from '@/components/ui/sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

// Root layout component
function RootLayout() {
  return (
    <>
      <Outlet />
      <Toaster />
    </>
  );
}

// Loading component
function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
}

// Error component
function ErrorScreen({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Authentication Error</AlertTitle>
        <AlertDescription className="mt-2">
          {message}
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Try Again
            </button>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}

// Authenticated layout wrapper
function AuthenticatedLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

// Dashboard wrapper that handles profile loading
function DashboardWrapper() {
  const { data: userProfile, isLoading } = useGetCallerUserProfile();

  if (isLoading) {
    return <LoadingScreen message="Loading your profile..." />;
  }

  if (!userProfile) {
    return <LoadingScreen message="Redirecting to onboarding..." />;
  }

  return <Dashboard userProfile={userProfile} />;
}

// Onboarding wrapper
function OnboardingWrapper() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        <OnboardingFlow />
      </main>
      <Footer />
    </div>
  );
}

// Define root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Landing page route - accessible only when not authenticated
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: LandingPage,
  beforeLoad: async () => {
    // Wait for auth client to be available
    const authClient = (window as any).__authClient;
    if (!authClient) {
      // Auth client not ready yet, allow landing page to show
      return;
    }
    
    try {
      const isAuthenticated = await authClient.isAuthenticated();
      if (isAuthenticated) {
        // User is authenticated, redirect to dashboard
        throw redirect({ to: '/dashboard' });
      }
    } catch (error) {
      // If error is a redirect, throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
      // Otherwise, allow landing page to show
      console.error('Error checking authentication:', error);
    }
  },
});

// Onboarding route - requires authentication but no profile
const onboardingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/onboarding',
  component: OnboardingWrapper,
  beforeLoad: async () => {
    // Wait for auth client to be available
    const authClient = (window as any).__authClient;
    if (!authClient) {
      throw redirect({ to: '/' });
    }
    
    try {
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        throw redirect({ to: '/' });
      }
    } catch (error) {
      // If error is a redirect, throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
      // Otherwise redirect to landing
      throw redirect({ to: '/' });
    }
  },
});

// Create authenticated parent route
const authenticatedRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'authenticated',
  component: AuthenticatedLayout,
  beforeLoad: async () => {
    // Wait for auth client to be available
    const authClient = (window as any).__authClient;
    if (!authClient) {
      throw redirect({ to: '/' });
    }
    
    try {
      const isAuthenticated = await authClient.isAuthenticated();
      if (!isAuthenticated) {
        throw redirect({ to: '/' });
      }
    } catch (error) {
      // If error is a redirect, throw it
      if (error && typeof error === 'object' && 'to' in error) {
        throw error;
      }
      // Otherwise redirect to landing
      throw redirect({ to: '/' });
    }
  },
});

// Dashboard route - requires authentication and profile
const dashboardRoute = createRoute({
  getParentRoute: () => authenticatedRoute,
  path: '/dashboard',
  component: DashboardWrapper,
});

// Catch-all route - redirect to home
const catchAllRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '*',
  component: () => {
    throw redirect({ to: '/' });
  },
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  onboardingRoute,
  authenticatedRoute.addChildren([dashboardRoute]),
  catchAllRoute,
]);

// Create router instance
const router = createRouter({ 
  routeTree,
  defaultPreload: 'intent',
  context: {
    queryClient,
  },
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// App wrapper with providers
function AppContent() {
  const { loginStatus, loginError, login } = useInternetIdentity();

  // Show loading screen while initializing
  if (loginStatus === 'initializing') {
    return <LoadingScreen message="Initializing authentication..." />;
  }

  // Show error screen if initialization failed
  if (loginStatus === 'loginError' && loginError) {
    return (
      <ErrorScreen 
        message={loginError.message} 
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <RouterProvider router={router} />;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
