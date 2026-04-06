import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LanguageProvider } from "@/lib/language-context";
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
import About from "@/pages/about";

const queryClient = new QueryClient();

function Router() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/eligibility" component={Eligibility} />
        <Route path="/schemes" component={Schemes} />
        <Route path="/schemes/:id" component={SchemeDetail} />
        <Route path="/assistance" component={Assistance} />
        <Route path="/jobs" component={Jobs} />
        <Route path="/jobs/:id" component={JobDetail} />
        <Route path="/documents" component={Documents} />
        <Route path="/admin" component={Admin} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
