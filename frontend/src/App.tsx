import { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { ErrorBoundary } from '@/components/error-boundary';
import { AppShell } from '@/components/app-shell';
import { StationProvider } from '@/context/station-context';
import NotFound from '@/pages/not-found';
import Onboarding from '@/pages/onboarding';
import HomePage from '@/pages/home';
import WeatherPage from '@/pages/weather';
import CropsPage from '@/pages/crops';
import ProfilePage from '@/pages/profile';
import { LanguageProvider } from '@/context/language-context';

const queryClient = new QueryClient();

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        <Route path="/" component={Onboarding} />
        <Route path="/home"><AppShell><HomePage /></AppShell></Route>
        <Route path="/weather"><AppShell><WeatherPage /></AppShell></Route>
        <Route path="/crops"><AppShell><CropsPage /></AppShell></Route>
        <Route path="/profile"><AppShell><ProfilePage /></AppShell></Route>
        <Route component={NotFound} />
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <StationProvider>
          <WouterRouter>
            <Router />
          </WouterRouter>
        </StationProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}


export default App;