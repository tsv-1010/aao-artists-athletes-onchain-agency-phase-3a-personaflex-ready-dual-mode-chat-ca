import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, User } from 'lucide-react';

export default function Header() {
  const navigate = useNavigate();
  const { identity, clear, loginStatus } = useInternetIdentity();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    // Navigate to landing page after logout
    navigate({ to: '/' });
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-3">
          <img 
            src="/assets/generated/aao-logo-transparent.dim_200x200.png" 
            alt="AAO Logo" 
            className="h-10 w-10"
          />
          <div>
            <h1 className="text-xl font-bold tracking-tight">AAO</h1>
            <p className="text-xs text-muted-foreground">Artists & Athletes Onchain</p>
          </div>
        </div>

        {isAuthenticated && (
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="max-w-[150px] truncate">
                {identity.getPrincipal().toString().slice(0, 8)}...
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              disabled={loginStatus === 'logging-in'}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
