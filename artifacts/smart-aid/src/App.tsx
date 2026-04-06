import { useEffect, useRef } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, SignIn, SignUp, Show, useClerk } from "@clerk/react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
import { AdminAuthProvider } from "@/lib/admin-auth";
import { Layout } from "@/components/layout";
import NotFound from "@/pages/not-found";

import Home from "@/pages/home";
import Eligibility from "@/pages/eligibility";
import Schemes from "@/pages/schemes";
import SchemeDetail from "@/pages/scheme-detail";
import Assistance from "@/pages/assistance";
import Jobs from "@/pages/jobs";
import JobDetail from "@/pages/job-detail";
import Documents from "@/pages/documents";
import Admin from "@/pages/admin";
import AdminLogin from "@/pages/admin-login";
import About from "@/pages/about";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

if (!clerkPubKey) {
  throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");
}

function SignInPage() {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <SignIn
        routing="path"
        path={`${basePath}/sign-in`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/documents`}
      />
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="flex justify-center items-center min-h-[80vh]">
      <SignUp
        routing="path"
        path={`${basePath}/sign-up`}
        signInUrl={`${basePath}/sign-in`}
        fallbackRedirectUrl={`${basePath}/documents`}
      />
    </div>
  );
}

function DocumentsRoute() {
  return (
    <>
      <Show when="signed-in">
        <Documents />
      </Show>
      <Show when="signed-out">
        <Redirect to="/sign-in" />
      </Show>
    </>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (
        prevUserIdRef.current !== undefined &&
        prevUserIdRef.current !== userId
      ) {
        queryClient.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);

  return null;
}

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/eligibility" component={Eligibility} />
        <Route path="/schemes" component={Schemes} />
        <Route path="/schemes/:id" component={SchemeDetail} />
        <Route path="/assistance" component={Assistance} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/documents" component={DocumentsRoute} />
        <Route path="/admin-login/*?">
          <AdminAuthProvider><AdminLogin /></AdminAuthProvider>
        </Route>
        <Route path="/admin">
          <AdminAuthProvider><Admin /></AdminAuthProvider>
        </Route>
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryClientCacheInvalidator />
        <LanguageProvider>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </LanguageProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
