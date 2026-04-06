import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, HeartHandshake, Briefcase, MapPin, FileCheck, ArrowRight, Building2, IndianRupee } from "lucide-react";
import {
  useGetStatsSummary, getGetStatsSummaryQueryKey,
  useListSchemes, getListSchemesQueryKey,
  useListJobs, getListJobsQueryKey,
  useListAssistanceCenters, getListAssistanceCentersQueryKey,
} from "@workspace/api-client-react";

const schemeTypeColor: Record<string, string> = {
  scholarship: "bg-blue-100 text-blue-700",
  housing: "bg-orange-100 text-orange-700",
  employment: "bg-green-100 text-green-700",
  health: "bg-red-100 text-red-700",
  food: "bg-yellow-100 text-yellow-700",
  pension: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

const jobCategoryColor: Record<string, string> = {
  daily_wage: "bg-orange-100 text-orange-700",
  government: "bg-blue-100 text-blue-700",
  skilled: "bg-green-100 text-green-700",
  ngo: "bg-purple-100 text-purple-700",
  healthcare: "bg-red-100 text-red-700",
  construction: "bg-yellow-100 text-yellow-700",
};

const centerTypeColor: Record<string, string> = {
  hospital: "bg-red-100 text-red-700",
  ngo: "bg-green-100 text-green-700",
  food_center: "bg-yellow-100 text-yellow-700",
  shelter: "bg-blue-100 text-blue-700",
  legal_aid: "bg-purple-100 text-purple-700",
  employment_office: "bg-orange-100 text-orange-700",
};

export default function Home() {
  const { t } = useLanguage();
  const { data: stats } = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });
  const { data: schemes } = useListSchemes({}, { query: { queryKey: getListSchemesQueryKey({}) } });
  const { data: jobs } = useListJobs({}, { query: { queryKey: getListJobsQueryKey({}) } });
  const { data: centers } = useListAssistanceCenters({}, { query: { queryKey: getListAssistanceCentersQueryKey({}) } });

  const featuredSchemes = schemes?.slice(0, 4) ?? [];
  const featuredJobs = jobs?.slice(0, 4) ?? [];
  const featuredCenters = centers?.slice(0, 4) ?? [];

  const features = [
    {
      title: t("Eligibility Check", "पात्रता जांच"),
      description: t("Find government schemes you qualify for in minutes.", "उन सरकारी योजनाओं को खोजें जिनके लिए आप मिनटों में पात्र हैं।"),
      icon: ShieldCheck,
      href: "/eligibility",
      color: "bg-orange-100 text-orange-700"
    },
    {
      title: t("Nearby Support", "निकटतम सहायता"),
      description: t("Locate NGOs, hospitals, and food centers near you.", "अपने आस-पास एनजीओ, अस्पताल और खाद्य केंद्र खोजें।"),
      icon: MapPin,
      href: "/assistance",
      color: "bg-green-100 text-green-700"
    },
    {
      title: t("Job Opportunities", "नौकरी के अवसर"),
      description: t("Find daily wage and skilled jobs in your area.", "अपने क्षेत्र में दैनिक वेतन और कुशल नौकरियां खोजें।"),
      icon: Briefcase,
      href: "/jobs",
      color: "bg-blue-100 text-blue-700"
    },
    {
      title: t("Document Verification", "दस्तावेज़ सत्यापन"),
      description: t("Upload and verify your documents securely.", "अपने दस्तावेज़ों को सुरक्षित रूप से अपलोड और सत्यापित करें।"),
      icon: FileCheck,
      href: "/documents",
      color: "bg-purple-100 text-purple-700"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden bg-primary/5 py-16 md:py-24 lg:py-32">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <HeartHandshake className="mr-2 h-4 w-4" />
              {t("A compassionate digital bridge", "एक दयालु डिजिटल सेतु")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground text-balance">
              {t("Your Guide to ", "सरकारी सहायता के लिए ")}
              <span className="text-primary">{t("Government Support", "आपका मार्गदर्शक")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
              {t(
                "Smart Aid connects you with welfare schemes, nearby assistance centers, and job opportunities. We are here to help you access the support you deserve.",
                "स्मार्ट ऐड आपको कल्याणकारी योजनाओं, निकटतम सहायता केंद्रों और नौकरी के अवसरों से जोड़ता है।"
              )}
            </p>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-4">
              <Link href="/eligibility" data-testid="link-hero-eligibility">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  {t("Check Eligibility Now", "अभी पात्रता जांचें")}
                </Button>
              </Link>
              <Link href="/schemes" data-testid="link-hero-schemes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8">
                  {t("Browse All Schemes", "सभी योजनाएं देखें")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-background border-y">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalSchemes ?? "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Active Schemes", "सक्रिय योजनाएं")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalAssistanceCenters ?? "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Assistance Centers", "सहायता केंद्र")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalJobs ?? "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Job Openings", "नौकरी के अवसर")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalUsers ?? "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("People Helped", "लोग जिनकी मदद की गई")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold tracking-tight mb-4">
              {t("How Can We Help You Today?", "हम आपकी कैसे मदद कर सकते हैं?")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Our platform is designed to be simple and accessible. Choose a service below to get started.",
                "हमारा प्लेटफ़ॉर्म सरल और सुलभ होने के लिए डिज़ाइन किया गया है।"
              )}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href} data-testid={`link-feature-${idx}`}>
                <Card className="h-full transition-all hover:-translate-y-1 hover:shadow-md border-border/50 cursor-pointer group">
                  <CardContent className="p-6 flex flex-col items-start gap-4">
                    <div className={`p-3 rounded-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Schemes Section */}
      {featuredSchemes.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold">{t("Featured Government Schemes", "प्रमुख सरकारी योजनाएं")}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{t("Central government welfare schemes for eligible citizens", "पात्र नागरिकों के लिए केंद्र सरकार की कल्याणकारी योजनाएं")}</p>
              </div>
              <Link href="/schemes">
                <Button variant="outline" size="sm" className="gap-1">
                  {t("View All", "सभी देखें")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredSchemes.map((scheme) => (
                <Link key={scheme.id} href={`/schemes/${scheme.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge className={`text-xs font-medium ${schemeTypeColor[scheme.schemeType] ?? "bg-gray-100 text-gray-700"}`} variant="outline">
                          {scheme.schemeType}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">{scheme.category}</Badge>
                      </div>
                      <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{scheme.name}</h3>
                      {scheme.benefitAmount && (
                        <p className="text-xs text-primary font-medium flex items-center gap-1">
                          <IndianRupee className="h-3 w-3" />
                          <span className="line-clamp-1">{scheme.benefitAmount}</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{scheme.ministry}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Jobs Section */}
      {featuredJobs.length > 0 && (
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold">{t("Latest Job Openings", "नवीनतम नौकरियां")}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{t("Government, NGO, and skilled jobs across India", "भारत भर में सरकारी, एनजीओ और कुशल नौकरियां")}</p>
              </div>
              <Link href="/jobs">
                <Button variant="outline" size="sm" className="gap-1">
                  {t("View All", "सभी देखें")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredJobs.map((job) => (
                <Link key={job.id} href={`/jobs/${job.id}`}>
                  <Card className="h-full hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-5">
                      <Badge className={`text-xs font-medium mb-3 ${jobCategoryColor[job.category] ?? "bg-gray-100 text-gray-700"}`} variant="outline">
                        {job.category.replace("_", " ")}
                      </Badge>
                      <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{job.title}</h3>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <Building2 className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{job.organization}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span>{job.city}, {job.state}</span>
                      </div>
                      {job.salaryRange && (
                        <p className="text-xs text-primary font-medium mt-1">{job.salaryRange}</p>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Assistance Centers Section */}
      {featuredCenters.length > 0 && (
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-serif font-bold">{t("Nearby Assistance Centers", "निकटतम सहायता केंद्र")}</h2>
                <p className="text-muted-foreground mt-1 text-sm">{t("Hospitals, NGOs, food centers and more across India", "भारत भर में अस्पताल, एनजीओ, खाद्य केंद्र और अधिक")}</p>
              </div>
              <Link href="/assistance">
                <Button variant="outline" size="sm" className="gap-1">
                  {t("View All", "सभी देखें")} <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredCenters.map((center) => (
                <Card key={center.id} className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <Badge className={`text-xs font-medium mb-3 ${centerTypeColor[center.type] ?? "bg-gray-100 text-gray-700"}`} variant="outline">
                      {center.type.replace("_", " ")}
                    </Badge>
                    <h3 className="font-semibold text-sm leading-snug mb-2 line-clamp-2">{center.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                      <MapPin className="h-3 w-3 shrink-0" />
                      <span>{center.city}, {center.state}</span>
                    </div>
                    {center.phone && (
                      <p className="text-xs text-primary mt-1 font-medium">{center.phone}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-balance">
            {t("Don't let lack of information hold you back.", "जानकारी के अभाव को अपने रास्ते की रुकावट न बनने दें।")}
          </h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
            {t(
              "Start by taking a 2-minute eligibility test to see which government schemes are available for you.",
              "यह जानने के लिए 2 मिनट का पात्रता परीक्षण दें कि आपके लिए कौन सी सरकारी योजनाएं उपलब्ध हैं।"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/eligibility">
              <Button size="lg" variant="secondary" className="bg-background text-secondary hover:bg-background/90 text-base h-12 px-8">
                {t("Take Eligibility Test", "पात्रता परीक्षण दें")}
              </Button>
            </Link>
            <Link href="/schemes">
              <Button size="lg" variant="outline" className="border-secondary-foreground/30 text-secondary-foreground hover:bg-secondary-foreground/10 text-base h-12 px-8">
                {t("Browse Schemes", "योजनाएं देखें")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
