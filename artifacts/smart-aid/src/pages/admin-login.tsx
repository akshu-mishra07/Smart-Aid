import { SignIn, useUser } from "@clerk/react";
import { useLanguage } from "@/lib/language-context";
import { Redirect } from "wouter";
import { Shield } from "lucide-react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

export default function AdminLogin() {
  const { t } = useLanguage();
  const { isSignedIn } = useUser();

  if (isSignedIn) {
    return <Redirect to="/admin" />;
  }

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 px-4">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-800 text-white mb-4">
          <Shield className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-slate-800 dark:text-slate-100">
          {t("Admin Portal", "एडमिन पोर्टल")}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {t("Sign in with your administrator account", "अपने व्यवस्थापक खाते से साइन इन करें")}
        </p>
      </div>
      <SignIn
        routing="path"
        path={`${basePath}/admin-login`}
        signUpUrl={`${basePath}/sign-up`}
        fallbackRedirectUrl={`${basePath}/admin`}
        appearance={{
          elements: {
            rootBox: "w-full max-w-md",
            card: "shadow-xl border border-slate-200 dark:border-slate-700",
            headerTitle: "hidden",
            headerSubtitle: "hidden",
            formButtonPrimary: "bg-slate-800 hover:bg-slate-700 text-white",
            footerActionLink: "text-slate-700 hover:text-slate-900",
          },
        }}
      />
    </div>
  );
}
