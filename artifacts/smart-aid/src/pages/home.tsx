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
  scholarship: "bg-sky-50 text-sky-700 border-sky-200",
  housing: "bg-amber-50 text-amber-700 border-amber-200",
  employment: "bg-emerald-50 text-emerald-700 border-emerald-200",
  health: "bg-rose-50 text-rose-700 border-rose-200",
  food: "bg-yellow-50 text-yellow-700 border-yellow-200",
  pension: "bg-violet-50 text-violet-700 border-violet-200",
  other: "bg-slate-50 text-slate-600 border-slate-200",
};

const jobCategoryColor: Record<string, string> = {
  daily_wage: "bg-amber-50 text-amber-700 border-amber-200",
  government: "bg-sky-50 text-sky-700 border-sky-200",
  skilled: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ngo: "bg-violet-50 text-violet-700 border-violet-200",
  healthcare: "bg-rose-50 text-rose-700 border-rose-200",
  construction: "bg-yellow-50 text-yellow-700 border-yellow-200",
};

const centerTypeColor: Record<string, string> = {
  hospital: "bg-rose-50 text-rose-700 border-rose-200",
  ngo: "bg-emerald-50 text-emerald-700 border-emerald-200",
  food_center: "bg-yellow-50 text-yellow-700 border-yellow-200",
  shelter: "bg-sky-50 text-sky-700 border-sky-200",
  legal_aid: "bg-violet-50 text-violet-700 border-violet-200",
  employment_office: "bg-amber-50 text-amber-700 border-amber-200",
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
      color: "bg-teal-50 text-teal-700"
    },
    {
      title: t("Nearby Support", "निकटतम सहायता"),
      description: t("Locate NGOs, hospitals, and food centers near you.", "अपने आस-पास एनजीओ, अस्पताल और खाद्य केंद्र खोजें।"),
      icon: MapPin,
      href: "/assistance",
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      title: t("Job Opportunities", "नौकरी के अवसर"),
      description: t("Find daily wage and skilled jobs in your area.", "अपने क्षेत्र में दैनिक वेतन और कुशल नौकरियां खोजें।"),
      icon: Briefcase,
      href: "/jobs",
      color: "bg-sky-50 text-sky-700"
    },
    {
      title: t("Document Verification", "दस्तावेज़ सत्यापन"),
      description: t("Upload and verify your documents securely.", "अपने दस्तावेज़ों को सुरक्षित रूप से अपलोड और सत्यापित करें।"),
      icon: FileCheck,
      href: "/documents",
      color: "bg-amber-50 text-amber-700"
    }
  ];

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full overflow-hidden py-20 md:py-28 lg:py-36">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,_hsl(174_62%_32%_/_0.08),transparent)]" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="container relative z-10 mx-auto px-4 md:px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center rounded-full border border-primary/15 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
              <HeartHandshake className="mr-2 h-4 w-4" />
              {t("A compassionate digital bridge", "एक दयालु डिजिटल सेतु")}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold tracking-tight text-foreground text-balance leading-[1.1]">
              {t("Your Guide to ", "सरकारी सहायता के लिए ")}
              <span className="bg-gradient-to-r from-primary to-teal-500 bg-clip-text text-transparent">{t("Government Support", "आपका मार्गदर्शक")}</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
              {t(
                "Smart Aid connects you with welfare schemes, nearby assistance centers, and job opportunities. We are here to help you access the support you deserve.",
                "स्मार्ट ऐड आपको कल्याणकारी योजनाओं, निकटतम सहायता केंद्रों और नौकरी के अवसरों से जोड़ता है।"
              )}
            </p>
            <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-4 pt-4">
              <Link href="/eligibility" data-testid="link-hero-eligibility">
                <Button size="lg" className="w-full sm:w-auto text-base h-12 px-8 shadow-md shadow-primary/15 hover:shadow-lg hover:shadow-primary/20 transition-all">
                  {t("Check Eligibility Now", "अभी पात्रता जांचें")}
                </Button>
              </Link>
              <Link href="/schemes" data-testid="link-hero-schemes">
                <Button variant="outline" size="lg" className="w-full sm:w-auto text-base h-12 px-8 hover:bg-primary/5 transition-all">
                  {t("Browse All Schemes", "सभी योजनाएं देखें")}
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Stats Section */}
      <section className="py-14 bg-white/60 border-y border-border/50">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: stats?.totalSchemes, label: t("Active Schemes", "सक्रिय योजनाएं") },
              { val: stats?.totalAssistanceCenters, label: t("Assistance Centers", "सहायता केंद्र") },
              { val: stats?.totalJobs, label: t("Job Openings", "नौकरी के अवसर") },
              { val: stats?.totalUsers, label: t("Registered Users", "पंजीकृत उपयोगकर्ता") },
            ].map((s, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary to-teal-600 bg-clip-text text-transparent">
                  {s.val ?? "-"}
                </span>
                <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-serif font-bold tracking-tight mb-4">
              {t("How Can We Help You Today?", "हम आपकी कैसे मदद कर सकते हैं?")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              {t(
                "Our platform is designed to be simple and accessible. Choose a service below to get started.",
                "हमारा प्लेटफ़ॉर्म सरल और सुलभ होने के लिए डिज़ाइन किया गया है।"
              )}
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => (
              <Link key={idx} href={feature.href} data-testid={`link-feature-${idx}`}>
                <Card className="h-full transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg border-border/40 cursor-pointer group bg-white">
                  <CardContent className="p-7 flex flex-col items-start gap-5">
                    <div className={`p-3.5 rounded-2xl ${feature.color} group-hover:scale-110 transition-transform duration-300`}>
                      <feature.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition-colors">{feature.title}</h3>
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
      <section className="relative py-20 md:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-primary/30" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_hsl(174_62%_32%_/_0.15),transparent)]" />
        <div className="container relative z-10 mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-balance text-white">
            {t("Don't let lack of information hold you back.", "जानकारी के अभाव को अपने रास्ते की रुकावट न बनने दें।")}
          </h2>
          <p className="text-slate-300 mb-10 max-w-2xl mx-auto text-lg leading-relaxed">
            {t(
              "Start by taking a 2-minute eligibility test to see which government schemes are available for you.",
              "यह जानने के लिए 2 मिनट का पात्रता परीक्षण दें कि आपके लिए कौन सी सरकारी योजनाएं उपलब्ध हैं।"
            )}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/eligibility">
              <Button size="lg" className="text-base h-12 px-8 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all">
                {t("Take Eligibility Test", "पात्रता परीक्षण दें")}
              </Button>
            </Link>
            <Link href="/schemes">
              <Button size="lg" variant="outline" className="border-slate-500 text-white hover:bg-white/10 text-base h-12 px-8 transition-all">
                {t("Browse Schemes", "योजनाएं देखें")}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
