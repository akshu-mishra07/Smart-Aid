import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useCheckEligibility } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Link } from "wouter";
import { ChevronRight, ChevronLeft, CheckCircle, ExternalLink } from "lucide-react";

type Step = 1 | 2 | 3;

export default function Eligibility() {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<Step>(1);
  const [form, setForm] = useState({
    age: "",
    gender: "",
    category: "",
    annualIncome: "",
    state: "",
    hasDisability: false,
    isStudent: false,
    occupation: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const mutation = useCheckEligibility();

  const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu",
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Delhi", "Jammu and Kashmir", "Ladakh",
  ];

  const handleSubmit = () => {
    if (!form.age || !form.gender || !form.category || !form.annualIncome || !form.state || !form.occupation) return;
    mutation.mutate({
      age: parseInt(form.age),
      gender: form.gender as "male" | "female" | "other",
      category: form.category as "general" | "sc" | "st" | "obc" | "minority",
      annualIncome: parseFloat(form.annualIncome),
      state: form.state,
      hasDisability: form.hasDisability,
      isStudent: form.isStudent,
      occupation: form.occupation as "unemployed" | "daily_wage" | "skilled_worker" | "farmer" | "student" | "other",
    }, {
      onSuccess: () => setSubmitted(true),
    });
  };

  const schemeTypeColor: Record<string, string> = {
    scholarship: "bg-blue-100 text-blue-700",
    housing: "bg-orange-100 text-orange-700",
    employment: "bg-green-100 text-green-700",
    health: "bg-red-100 text-red-700",
    food: "bg-yellow-100 text-yellow-700",
    pension: "bg-purple-100 text-purple-700",
    other: "bg-gray-100 text-gray-700",
  };

  if (submitted && mutation.data) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-4">
            <CheckCircle className="h-8 w-8" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-foreground">
            {t("Your Eligible Schemes", "आपकी पात्र योजनाएं")}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t(`Found ${mutation.data.totalMatched} schemes matching your profile`, `आपकी प्रोफ़ाइल से मेल खाने वाली ${mutation.data.totalMatched} योजनाएं मिलीं`)}
          </p>
        </div>

        {mutation.data.totalMatched === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground text-lg">
                {t("No schemes matched your profile. Please update your details or browse all schemes.", "आपकी प्रोफ़ाइल से कोई योजना मेल नहीं खाई। कृपया अपना विवरण अपडेट करें या सभी योजनाएं ब्राउज़ करें।")}
              </p>
              <Button className="mt-6" onClick={() => { setSubmitted(false); setStep(1); }} variant="outline" data-testid="btn-retry">
                {t("Try Again", "पुनः प्रयास करें")}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {mutation.data.schemes.map((scheme) => (
              <Card key={scheme.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className={schemeTypeColor[scheme.schemeType] || "bg-gray-100 text-gray-700"}>
                          {scheme.schemeType}
                        </Badge>
                        <Badge variant="outline">{scheme.category}</Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-foreground">
                        {language === "hi" ? scheme.nameHindi : scheme.name}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {language === "hi" ? scheme.descriptionHindi : scheme.description}
                      </p>
                      {scheme.benefitAmount && (
                        <p className="text-sm font-medium text-primary mt-2">
                          {t("Benefit: ", "लाभ: ")}{scheme.benefitAmount}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1">
                        {t("Ministry: ", "मंत्रालय: ")}{scheme.ministry}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2 min-w-fit">
                      <Link href={`/schemes/${scheme.id}`}>
                        <Button size="sm" variant="outline" data-testid={`btn-view-scheme-${scheme.id}`}>
                          {t("View Details", "विवरण देखें")}
                        </Button>
                      </Link>
                      {scheme.applicationUrl && (
                        <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                          <Button size="sm" className="w-full" data-testid={`btn-apply-${scheme.id}`}>
                            {t("Apply Now", "अभी आवेदन करें")}
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="text-center mt-8">
          <Button variant="outline" onClick={() => { setSubmitted(false); setStep(1); mutation.reset(); }} data-testid="btn-check-again">
            {t("Check Again", "फिर से जांचें")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-serif font-bold text-foreground">
          {t("Check Your Eligibility", "पात्रता जांचें")}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t("Answer a few questions to find schemes you qualify for", "कुछ सवालों के जवाब दें और जानें कि आप किन योजनाओं के लिए पात्र हैं")}
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
            step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          }`}>
            {s}
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && t("Personal Information", "व्यक्तिगत जानकारी")}
            {step === 2 && t("Financial & Social Details", "वित्तीय और सामाजिक विवरण")}
            {step === 3 && t("Additional Details", "अतिरिक्त विवरण")}
          </CardTitle>
          <CardDescription>
            {t(`Step ${step} of 3`, `चरण ${step} / 3`)}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="age">{t("Age", "आयु")}</Label>
                <Input
                  id="age"
                  type="number"
                  min="1"
                  max="120"
                  placeholder={t("Enter your age", "अपनी आयु दर्ज करें")}
                  value={form.age}
                  onChange={(e) => setForm(f => ({ ...f, age: e.target.value }))}
                  data-testid="input-age"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Gender", "लिंग")}</Label>
                <Select value={form.gender} onValueChange={(v) => setForm(f => ({ ...f, gender: v }))}>
                  <SelectTrigger data-testid="select-gender">
                    <SelectValue placeholder={t("Select gender", "लिंग चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">{t("Male", "पुरुष")}</SelectItem>
                    <SelectItem value="female">{t("Female", "महिला")}</SelectItem>
                    <SelectItem value="other">{t("Other", "अन्य")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t("State", "राज्य")}</Label>
                <Select value={form.state} onValueChange={(v) => setForm(f => ({ ...f, state: v }))}>
                  <SelectTrigger data-testid="select-state">
                    <SelectValue placeholder={t("Select your state", "अपना राज्य चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    {INDIAN_STATES.map(state => (
                      <SelectItem key={state} value={state}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="space-y-2">
                <Label>{t("Social Category", "सामाजिक श्रेणी")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm(f => ({ ...f, category: v }))}>
                  <SelectTrigger data-testid="select-category">
                    <SelectValue placeholder={t("Select category", "श्रेणी चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">{t("General", "सामान्य")}</SelectItem>
                    <SelectItem value="sc">{t("Scheduled Caste (SC)", "अनुसूचित जाति (एससी)")}</SelectItem>
                    <SelectItem value="st">{t("Scheduled Tribe (ST)", "अनुसूचित जनजाति (एसटी)")}</SelectItem>
                    <SelectItem value="obc">{t("Other Backward Class (OBC)", "अन्य पिछड़ा वर्ग (ओबीसी)")}</SelectItem>
                    <SelectItem value="minority">{t("Minority", "अल्पसंख्यक")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">{t("Annual Household Income (Rs.)", "वार्षिक घरेलू आय (रुपये)")}</Label>
                <Input
                  id="income"
                  type="number"
                  min="0"
                  placeholder={t("Enter annual income", "वार्षिक आय दर्ज करें")}
                  value={form.annualIncome}
                  onChange={(e) => setForm(f => ({ ...f, annualIncome: e.target.value }))}
                  data-testid="input-income"
                />
              </div>
              <div className="space-y-2">
                <Label>{t("Occupation", "व्यवसाय")}</Label>
                <Select value={form.occupation} onValueChange={(v) => setForm(f => ({ ...f, occupation: v }))}>
                  <SelectTrigger data-testid="select-occupation">
                    <SelectValue placeholder={t("Select occupation", "व्यवसाय चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unemployed">{t("Unemployed", "बेरोजगार")}</SelectItem>
                    <SelectItem value="daily_wage">{t("Daily Wage Worker", "दैनिक मजदूर")}</SelectItem>
                    <SelectItem value="skilled_worker">{t("Skilled Worker", "कुशल कारीगर")}</SelectItem>
                    <SelectItem value="farmer">{t("Farmer", "किसान")}</SelectItem>
                    <SelectItem value="student">{t("Student", "छात्र")}</SelectItem>
                    <SelectItem value="other">{t("Other", "अन्य")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">{t("Person with Disability", "विकलांग व्यक्ति")}</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{t("Do you have any disability?", "क्या आपको कोई विकलांगता है?")}</p>
                </div>
                <Switch
                  checked={form.hasDisability}
                  onCheckedChange={(v) => setForm(f => ({ ...f, hasDisability: v }))}
                  data-testid="switch-disability"
                />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">{t("Currently a Student", "वर्तमान में छात्र")}</Label>
                  <p className="text-sm text-muted-foreground mt-0.5">{t("Are you enrolled in any educational institution?", "क्या आप किसी शैक्षणिक संस्थान में नामांकित हैं?")}</p>
                </div>
                <Switch
                  checked={form.isStudent}
                  onCheckedChange={(v) => setForm(f => ({ ...f, isStudent: v }))}
                  data-testid="switch-student"
                />
              </div>
            </>
          )}

          <div className="flex justify-between pt-4">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => (s - 1) as Step)} data-testid="btn-prev">
                <ChevronLeft className="mr-1 h-4 w-4" />
                {t("Previous", "पिछला")}
              </Button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <Button
                onClick={() => setStep((s) => (s + 1) as Step)}
                disabled={
                  (step === 1 && (!form.age || !form.gender || !form.state)) ||
                  (step === 2 && (!form.category || !form.annualIncome || !form.occupation))
                }
                data-testid="btn-next"
              >
                {t("Next", "अगला")}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={mutation.isPending}
                data-testid="btn-check-eligibility"
              >
                {mutation.isPending ? t("Checking...", "जांच रही है...") : t("Check Eligibility", "पात्रता जांचें")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
