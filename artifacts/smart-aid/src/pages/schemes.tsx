import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListSchemes, getListSchemesQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { Search, ExternalLink } from "lucide-react";

const schemeTypeColor: Record<string, string> = {
  scholarship: "bg-blue-100 text-blue-700",
  housing: "bg-orange-100 text-orange-700",
  employment: "bg-green-100 text-green-700",
  health: "bg-red-100 text-red-700",
  food: "bg-yellow-100 text-yellow-700",
  pension: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

export default function Schemes() {
  const { t, language } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [schemeType, setSchemeType] = useState("all");

  const params = {
    ...(search ? { search } : {}),
    ...(category !== "all" ? { category } : {}),
    ...(schemeType !== "all" ? { schemeType } : {}),
  };

  const { data: schemes, isLoading } = useListSchemes(params, {
    query: { queryKey: getListSchemesQueryKey(params) },
  });

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("Government Welfare Schemes", "सरकारी कल्याण योजनाएं")}
        </h1>
        <p className="text-muted-foreground">
          {t("Browse all available central government schemes for economically weaker sections", "आर्थिक रूप से कमजोर वर्गों के लिए सभी उपलब्ध केंद्र सरकार की योजनाओं को ब्राउज़ करें")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t("Search schemes...", "योजनाएं खोजें...")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
            <SelectValue placeholder={t("Category", "श्रेणी")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Categories", "सभी श्रेणियां")}</SelectItem>
            <SelectItem value="general">{t("General", "सामान्य")}</SelectItem>
            <SelectItem value="sc">{t("SC", "एससी")}</SelectItem>
            <SelectItem value="st">{t("ST", "एसटी")}</SelectItem>
            <SelectItem value="obc">{t("OBC", "ओबीसी")}</SelectItem>
            <SelectItem value="minority">{t("Minority", "अल्पसंख्यक")}</SelectItem>
            <SelectItem value="women">{t("Women", "महिला")}</SelectItem>
            <SelectItem value="disability">{t("Disability", "विकलांगता")}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={schemeType} onValueChange={setSchemeType}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-type">
            <SelectValue placeholder={t("Type", "प्रकार")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types", "सभी प्रकार")}</SelectItem>
            <SelectItem value="scholarship">{t("Scholarship", "छात्रवृत्ति")}</SelectItem>
            <SelectItem value="housing">{t("Housing", "आवास")}</SelectItem>
            <SelectItem value="employment">{t("Employment", "रोजगार")}</SelectItem>
            <SelectItem value="health">{t("Health", "स्वास्थ्य")}</SelectItem>
            <SelectItem value="food">{t("Food", "भोजन")}</SelectItem>
            <SelectItem value="pension">{t("Pension", "पेंशन")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="pt-6">
                <Skeleton className="h-4 w-1/3 mb-2" />
                <Skeleton className="h-6 w-2/3 mb-2" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : schemes?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("No schemes found for the selected filters.", "चयनित फ़िल्टर के लिए कोई योजना नहीं मिली।")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {schemes?.map((scheme) => (
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
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {language === "hi" ? scheme.descriptionHindi : scheme.description}
                    </p>
                    {scheme.benefitAmount && (
                      <p className="text-sm font-medium text-primary mt-2">
                        {t("Benefit: ", "लाभ: ")}{scheme.benefitAmount}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{scheme.ministry}</p>
                  </div>
                  <div className="flex flex-col gap-2 min-w-fit">
                    <Link href={`/schemes/${scheme.id}`}>
                      <Button size="sm" variant="outline" data-testid={`btn-view-${scheme.id}`}>
                        {t("View Details", "विवरण देखें")}
                      </Button>
                    </Link>
                    {scheme.applicationUrl && (
                      <a href={scheme.applicationUrl} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full" data-testid={`btn-apply-${scheme.id}`}>
                          {t("Apply", "आवेदन करें")}
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
    </div>
  );
}
