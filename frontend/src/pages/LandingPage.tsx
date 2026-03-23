import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Users, CheckCircle, ArrowRight, AlertCircle, Loader2 } from 'lucide-react';
import Footer from '../components/Footer';

export default function LandingPage() {
  const { login, loginStatus, identity, loginError } = useInternetIdentity();
  const isLoggingIn = loginStatus === 'logging-in';
  const isAuthenticated = !!identity;
  const hasError = loginStatus === 'loginError';

  const handleLogin = async () => {
    if (!isAuthenticated && !isLoggingIn) {
      try {
        await login();
      } catch (error) {
        console.error('Login error:', error);
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur">
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
          {!isAuthenticated && (
            <Button onClick={handleLogin} disabled={isLoggingIn} className="min-w-[120px]">
              {isLoggingIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Get Started'
              )}
            </Button>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        {/* Error Alert */}
        {hasError && loginError && (
          <div className="container pt-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>{loginError.message}</span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="ml-4"
                >
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}

        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 -z-10">
            <img 
              src="/assets/generated/hero-banner.dim_1200x400.png" 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-10"
            />
          </div>
          <div className="container">
            <div className="mx-auto max-w-3xl text-center space-y-8">
              <div className="space-y-4">
                <h2 className="text-4xl md:text-6xl font-bold tracking-tight">
                  Your Identity,
                  <span className="block text-primary">Your Control</span>
                </h2>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join the onchain agency platform built for artists, athletes, and brands. 
                  Secure identity verification and transparent consent management.
                </p>
              </div>
              {!isAuthenticated && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button 
                    size="lg" 
                    onClick={handleLogin} 
                    disabled={isLoggingIn} 
                    className="text-lg px-8 min-w-[180px]"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Get Started
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline"
                    onClick={handleLogin} 
                    disabled={isLoggingIn}
                    className="text-lg px-8 min-w-[180px]"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      'Join AAO'
                    )}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <h3 className="text-3xl font-bold mb-4">Why Choose AAO?</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Built on the Internet Computer with cutting-edge blockchain technology
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <Card>
                <CardHeader>
                  <Shield className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Soulbound Verification</CardTitle>
                  <CardDescription>
                    Non-transferable identity tokens that prove your authenticity and role on-chain
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Role-Based Access</CardTitle>
                  <CardDescription>
                    Tailored experiences for artists, athletes, and brands with specialized features
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <CheckCircle className="h-12 w-12 text-primary mb-4" />
                  <CardTitle>Consent Ledger</CardTitle>
                  <CardDescription>
                    Full transparency and control over your data usage and matching permissions
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!isAuthenticated && (
          <section className="py-20">
            <div className="container">
              <Card className="max-w-3xl mx-auto bg-primary text-primary-foreground">
                <CardHeader className="text-center space-y-4 pb-8">
                  <CardTitle className="text-3xl">Ready to Get Started?</CardTitle>
                  <CardDescription className="text-primary-foreground/80 text-lg">
                    Create your verified onchain identity in minutes
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-center pb-8">
                  <Button 
                    size="lg" 
                    variant="secondary"
                    onClick={handleLogin} 
                    disabled={isLoggingIn}
                    className="text-lg px-8 min-w-[180px]"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      <>
                        Join AAO
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
