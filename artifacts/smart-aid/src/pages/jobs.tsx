import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListJobs, getListJobsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { MapPin, Building2, IndianRupee } from "lucide-react";

const categoryColor: Record<string, string> = {
  daily_wage: "bg-orange-100 text-orange-700",
  skilled: "bg-blue-100 text-blue-700",
  unskilled: "bg-gray-100 text-gray-700",
  government: "bg-green-100 text-green-700",
  ngo: "bg-purple-100 text-purple-700",
};

export default function Jobs() {
  const { t } = useLanguage();
  const [category, setCategory] = useState("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("all");

  const params = {
    ...(category !== "all" ? { category } : {}),
    ...(city ? { city } : {}),
    ...(state !== "all" ? { state } : {}),
  };

  const { data: jobs, isLoading } = useListJobs(params, {
    query: { queryKey: getListJobsQueryKey(params) },
  });

  const STATES = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Bihar", "Punjab", "Gujarat", "Rajasthan"];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("Employment Opportunities", "रोजगार के अवसर")}
        </h1>
        <p className="text-muted-foreground">
          {t("Find daily wage and skilled jobs in your area", "अपने क्षेत्र में दैनिक वेतन और कुशल नौकरियां खोजें")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-category">
            <SelectValue placeholder={t("Category", "श्रेणी")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Categories", "सभी श्रेणियां")}</SelectItem>
            <SelectItem value="daily_wage">{t("Daily Wage", "दैनिक मजदूरी")}</SelectItem>
            <SelectItem value="skilled">{t("Skilled", "कुशल")}</SelectItem>
            <SelectItem value="unskilled">{t("Unskilled", "अकुशल")}</SelectItem>
            <SelectItem value="government">{t("Government", "सरकारी")}</SelectItem>
            <SelectItem value="ngo">{t("NGO", "एनजीओ")}</SelectItem>
          </SelectContent>
        </Select>
        <Input
          placeholder={t("Filter by city...", "शहर से फ़िल्टर करें...")}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="flex-1"
          data-testid="input-city"
        />
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-state">
            <SelectValue placeholder={t("State", "राज्य")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All States", "सभी राज्य")}</SelectItem>
            {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-24 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : jobs?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("No jobs found for the selected filters.", "चयनित फ़िल्टर के लिए कोई नौकरी नहीं मिली।")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {jobs?.map((job) => (
            <Card key={job.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                  <div className="flex-1">
                    <Badge className={categoryColor[job.category] || "bg-gray-100 text-gray-700"} >
                      {job.category.replace("_", " ")}
                    </Badge>
                    <h3 className="text-lg font-semibold text-foreground mt-2" data-testid={`job-title-${job.id}`}>
                      {job.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Building2 className="h-4 w-4" />
                        {job.organization}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.city}, {job.state}
                      </div>
                      {job.salaryRange && (
                        <div className="flex items-center gap-1">
                          <IndianRupee className="h-4 w-4" />
                          {job.salaryRange}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{job.description}</p>
                  </div>
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm" variant="outline" data-testid={`btn-view-job-${job.id}`}>
                      {t("View Details", "विवरण देखें")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
