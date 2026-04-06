import { useLanguage } from "@/lib/language-context";
import { useGetJob, getGetJobQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useParams } from "wouter";
import { ChevronLeft, MapPin, Building2, Phone, User, CheckCircle, IndianRupee, Calendar } from "lucide-react";

const categoryColor: Record<string, string> = {
  daily_wage: "bg-orange-100 text-orange-700",
  skilled: "bg-blue-100 text-blue-700",
  unskilled: "bg-gray-100 text-gray-700",
  government: "bg-green-100 text-green-700",
  ngo: "bg-purple-100 text-purple-700",
};

export default function JobDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const jobId = parseInt(id || "0");

  const { data: job, isLoading } = useGetJob(jobId, {
    query: { enabled: !!jobId, queryKey: getGetJobQueryKey(jobId) },
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

  if (!job) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
        <p className="text-muted-foreground">{t("Job not found.", "नौकरी नहीं मिली।")}</p>
        <Link href="/jobs">
          <Button variant="outline" className="mt-4">{t("Back to Jobs", "नौकरियों पर वापस जाएं")}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <Link href="/jobs">
        <Button variant="ghost" className="mb-6" data-testid="btn-back">
          <ChevronLeft className="mr-1 h-4 w-4" />
          {t("Back to Jobs", "नौकरियों पर वापस जाएं")}
        </Button>
      </Link>

      <Badge className={categoryColor[job.category] || "bg-gray-100 text-gray-700"} >
        {job.category.replace("_", " ")}
      </Badge>

      <h1 className="text-3xl font-serif font-bold text-foreground mt-3 mb-2">{job.title}</h1>

      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-1">
          <Building2 className="h-4 w-4" />
          {job.organization}
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {job.location}, {job.city}, {job.state}
        </div>
        {job.salaryRange && (
          <div className="flex items-center gap-1">
            <IndianRupee className="h-4 w-4" />
            {job.salaryRange}
          </div>
        )}
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {t("Posted: ", "पोस्ट: ")}{new Date(job.postedAt).toLocaleDateString("en-IN")}
        </div>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader><CardTitle>{t("Job Description", "नौकरी विवरण")}</CardTitle></CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">{job.description}</p>
          </CardContent>
        </Card>

        {job.requirements.length > 0 && (
          <Card>
            <CardHeader><CardTitle>{t("Requirements", "आवश्यकताएं")}</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {(job.contactPerson || job.contactPhone) && (
          <Card>
            <CardHeader><CardTitle>{t("Contact Information", "संपर्क जानकारी")}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {job.contactPerson && (
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-muted-foreground" />
                  <span>{job.contactPerson}</span>
                </div>
              )}
              {job.contactPhone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <a href={`tel:${job.contactPhone}`} className="text-primary hover:underline" data-testid="link-phone">
                    {job.contactPhone}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {job.contactPhone && (
          <a href={`tel:${job.contactPhone}`}>
            <Button className="w-full" size="lg" data-testid="btn-contact">
              <Phone className="mr-2 h-4 w-4" />
              {t("Call to Apply", "आवेदन के लिए कॉल करें")}
            </Button>
          </a>
        )}
      </div>
    </div>
  );
}
