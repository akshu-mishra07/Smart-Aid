import { useLanguage } from "@/lib/language-context";
import { useGetScheme, getGetSchemeQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import { ChevronLeft, ExternalLink, FileText, CheckCircle } from "lucide-react";

const schemeTypeColor: Record<string, string> = {
  scholarship: "bg-blue-100 text-blue-700",
  housing: "bg-orange-100 text-orange-700",
  employment: "bg-green-100 text-green-700",
  health: "bg-red-100 text-red-700",
  food: "bg-yellow-100 text-yellow-700",
  pension: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

export default function SchemeDetail() {
  const { t, language } = useLanguage();
  const { id } = useParams();
  const schemeId = parseInt(id || "0");

  const { data: scheme, isLoading } = useGetScheme(schemeId, {
    query: { enabled: !!schemeId, queryKey: getGetSchemeQueryKey(schemeId) },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Skeleton className="h-8 w-1/2 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (!scheme) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <p className="text-muted-foreground">{t("Scheme not found.", "योजना नहीं मिली।")}</p>
        <Link href="/schemes">
          <Button variant="outline" className="mt-4">{t("Back to Schemes", "योजनाओं पर वापस जाएं")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/schemes">
        <Button variant="ghost" className="mb-6" data-testid="btn-back">
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("Back to Schemes", "योजनाओं पर वापस जाएं")}
        </Button>
      </Link>

      <div className="flex flex-wrap gap-2 mb-4">
        <Badge className={schemeTypeColor[scheme.schemeType] || "bg-gray-100 text-gray-700"}>
          {scheme.schemeType}
        </Badge>
        <Badge variant="outline">{scheme.category}</Badge>
        {!scheme.isActive && <Badge variant="destructive">{t("Inactive", "निष्क्रिय")}</Badge>}
      </div>

      <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
        {language === "hi" ? scheme.nameHindi : scheme.name}
      </h1>
      {language === "en" && (
        <p className="text-lg text-muted-foreground mb-6">{scheme.nameHindi}</p>
      )}

      <div className="grid gap-6">
        <Card>
          <CardHeader><CardTitle>{t("About this Scheme", "इस योजना के बारे में")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              {language === "hi" ? scheme.descriptionHindi : scheme.description}
            </p>
          </CardContent>
        </Card>

        <div className="grid sm:grid-cols-2 gap-4">
          {scheme.benefitAmount && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">{t("Benefit Amount", "लाभ राशि")}</p>
                    <p className="font-semibold text-primary">{scheme.benefitAmount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t("Ministry", "मंत्रालय")}</p>
                  <p className="font-medium">{scheme.ministry}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>{t("Eligibility Criteria", "पात्रता मानदंड")}</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("Category", "श्रेणी")}</span>
              <span className="font-medium capitalize">{scheme.category}</span>
            </div>
            {scheme.minAge && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Minimum Age", "न्यूनतम आयु")}</span>
                <span className="font-medium">{scheme.minAge} {t("years", "वर्ष")}</span>
              </div>
            )}
            {scheme.maxAge && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Maximum Age", "अधिकतम आयु")}</span>
                <span className="font-medium">{scheme.maxAge} {t("years", "वर्ष")}</span>
              </div>
            )}
            {scheme.maxIncome && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("Maximum Annual Income", "अधिकतम वार्षिक आय")}</span>
                <span className="font-medium">Rs. {scheme.maxIncome.toLocaleString("en-IN")}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {scheme.documents.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t("Required Documents", "आवश्यक दस्तावेज़")}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {scheme.documents.map((doc, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {doc}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {scheme.applicationUrl && (
          <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
            <Button className="w-full" size="lg" data-testid="btn-apply">
              {t("Apply for this Scheme", "इस योजना के लिए आवेदन करें")}
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
