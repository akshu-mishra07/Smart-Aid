import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAdminAuth } from "@/lib/admin-auth";
import { Redirect } from "wouter";
import { Shield, Lock, User, AlertCircle, Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading, login } = useAdminAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("Loading...", "लोड हो रहा है...")}</div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Redirect to="/admin" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!username.trim() || !password.trim()) {
      setError(t("Please enter both username and password", "कृपया उपयोगकर्ता नाम और पासवर्ड दोनों दर्ज करें"));
      return;
    }
    setSubmitting(true);
    const result = await login(username.trim(), password.trim());
    setSubmitting(false);
    if (!result.success) {
      setError(t("Invalid username or password", "गलत उपयोगकर्ता नाम या पासवर्ड"));
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/80 to-primary shadow-lg shadow-primary/20 mb-5">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-white mb-2">
            {t("Admin Portal", "एडमिन पोर्टल")}
          </h1>
          <p className="text-slate-400 text-sm">
            {t("Restricted access. Authorized administrators only.", "प्रतिबंधित पहुंच। केवल अधिकृत व्यवस्थापक।")}
          </p>
        </div>

        <Card className="border-slate-700/50 bg-slate-800/80 backdrop-blur-sm shadow-2xl">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">{t("Admin Username", "एडमिन उपयोगकर्ता नाम")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("Enter admin username", "एडमिन उपयोगकर्ता नाम दर्ज करें")}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/30 h-11"
                    autoComplete="username"
                    data-testid="input-admin-username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300 text-sm font-medium">{t("Password", "पासवर्ड")}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("Enter password", "पासवर्ड दर्ज करें")}
                    className="pl-10 pr-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-primary focus:ring-primary/30 h-11"
                    autoComplete="current-password"
                    data-testid="input-admin-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-400 shrink-0" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <Button
                type="submit"
                className="w-full h-11 font-medium bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-white shadow-lg shadow-primary/20"
                disabled={submitting}
                data-testid="btn-admin-login"
              >
                {submitting
                  ? t("Signing in...", "साइन इन हो रहा है...")
                  : t("Sign In to Admin", "एडमिन में साइन इन करें")}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-slate-500 mt-6">
          {t("This portal is for platform administrators only. Regular users should use the main sign-in.",
             "यह पोर्टल केवल प्लेटफॉर्म व्यवस्थापकों के लिए है। सामान्य उपयोगकर्ता मुख्य साइन-इन का उपयोग करें।")}
        </p>
      </div>
    </div>
  );
}
