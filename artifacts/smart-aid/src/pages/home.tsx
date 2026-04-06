import { Link } from "wouter";
import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck, HeartHandshake, Briefcase, MapPin, FileCheck } from "lucide-react";
import { useGetStatsSummary, getGetStatsSummaryQueryKey } from "@workspace/api-client-react";

export default function Home() {
  const { t } = useLanguage();
  const { data: stats } = useGetStatsSummary({ query: { queryKey: getGetStatsSummaryQueryKey() } });

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
                "स्मार्ट ऐड आपको कल्याणकारी योजनाओं, निकटतम सहायता केंद्रों और नौकरी के अवसरों से जोड़ता है। हम आपको वह सहायता प्राप्त करने में मदद करने के लिए यहाँ हैं जिसके आप हकदार हैं।"
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
              <span className="text-3xl font-bold text-primary">{stats?.totalSchemes || "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Active Schemes", "सक्रिय योजनाएं")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalAssistanceCenters || "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Assistance Centers", "सहायता केंद्र")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalJobs || "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("Job Openings", "नौकरी के अवसर")}</span>
            </div>
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold text-primary">{stats?.totalUsers || "-"}</span>
              <span className="text-sm font-medium text-muted-foreground">{t("People Helped", "लोग जिनकी मदद की गई")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4 md:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold tracking-tight mb-4">
              {t("How Can We Help You Today?", "हम आपकी कैसे मदद कर सकते हैं?")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t(
                "Our platform is designed to be simple and accessible. Choose a service below to get started.",
                "हमारा प्लेटफ़ॉर्म सरल और सुलभ होने के लिए डिज़ाइन किया गया है। आरंभ करने के लिए नीचे एक सेवा चुनें।"
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
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4 md:px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-balance">
            {t("Don't let lack of information hold you back.", "जानकारी के अभाव को अपने रास्ते की रुकावट न बनने दें।")}
          </h2>
          <p className="text-secondary-foreground/80 mb-8 max-w-2xl mx-auto text-lg">
            {t(
              "Start by taking a 2-minute eligibility test to see which government schemes are available for you.",
              "यह जानने के लिए कि आपके लिए कौन सी सरकारी योजनाएं उपलब्ध हैं, 2 मिनट का पात्रता परीक्षण देकर शुरुआत करें।"
            )}
          </p>
          <Link href="/eligibility">
            <Button size="lg" variant="secondary" className="bg-background text-secondary hover:bg-background/90 text-base h-12 px-8">
              {t("Take Eligibility Test", "पात्रता परीक्षण दें")}
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
