import { useLanguage } from "@/lib/language-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { HeartHandshake, ShieldCheck, MapPin, Briefcase, FileText, Globe } from "lucide-react";

export default function About() {
  const { t } = useLanguage();

  const features = [
    {
      icon: ShieldCheck,
      title: t("AI-Based Eligibility Checker", "एआई-आधारित पात्रता जांचकर्ता"),
      description: t("Our intelligent system analyzes your profile — income, age, category, and more — to match you with relevant government schemes instantly.", "हमारा बुद्धिमान सिस्टम आपकी प्रोफ़ाइल — आय, आयु, श्रेणी, और अधिक — का विश्लेषण करके आपको तुरंत प्रासंगिक सरकारी योजनाओं से मिलाता है।"),
      color: "bg-blue-100 text-blue-700",
    },
    {
      icon: MapPin,
      title: t("Nearby Assistance Locator", "निकटतम सहायता लोकेटर"),
      description: t("Find NGOs, hospitals, and food distribution centers in your area with contact details and operating hours.", "अपने क्षेत्र में संपर्क विवरण और कार्य समय के साथ एनजीओ, अस्पताल और खाद्य वितरण केंद्र खोजें।"),
      color: "bg-green-100 text-green-700",
    },
    {
      icon: Briefcase,
      title: t("Employment Assistance", "रोजगार सहायता"),
      description: t("Browse daily wage, skilled, government, and NGO jobs in your city and state. Connect directly with employers.", "अपने शहर और राज्य में दैनिक मजदूरी, कुशल, सरकारी और एनजीओ नौकरियां ब्राउज़ करें। नियोक्ताओं से सीधे जुड़ें।"),
      color: "bg-orange-100 text-orange-700",
    },
    {
      icon: FileText,
      title: t("Document Management", "दस्तावेज़ प्रबंधन"),
      description: t("Securely upload and track your identity documents — Aadhar, PAN, income certificates, and more — for scheme applications.", "योजना आवेदनों के लिए अपने पहचान दस्तावेज़ — आधार, पैन, आय प्रमाण पत्र, और अधिक — को सुरक्षित रूप से अपलोड करें और ट्रैक करें।"),
      color: "bg-purple-100 text-purple-700",
    },
    {
      icon: Globe,
      title: t("Multilingual Support", "बहुभाषी समर्थन"),
      description: t("Access all content in English and Hindi, with plans to expand to more regional languages to serve diverse communities.", "अंग्रेजी और हिंदी में सभी सामग्री तक पहुंचें, अधिक क्षेत्रीय भाषाओं तक विस्तार करने की योजना के साथ विविध समुदायों की सेवा करें।"),
      color: "bg-yellow-100 text-yellow-700",
    },
  ];

  const sdgs = [
    t("SDG 1: No Poverty", "एसडीजी 1: कोई गरीबी नहीं"),
    t("SDG 8: Decent Work and Economic Growth", "एसडीजी 8: उचित कार्य और आर्थिक विकास"),
    t("SDG 10: Reduced Inequalities", "एसडीजी 10: असमानताओं में कमी"),
    t("SDG 16: Peace, Justice and Strong Institutions", "एसडीजी 16: शांति, न्याय और मजबूत संस्थाएं"),
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
          <HeartHandshake className="h-8 w-8" />
        </div>
        <h1 className="text-4xl font-serif font-bold text-foreground mb-4">
          {t("About Smart Aid", "स्मार्ट एड के बारे में")}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          {t(
            "Smart Aid is not just a website, but a digital bridge between needy people and underutilized resources.",
            "स्मार्ट एड सिर्फ एक वेबसाइट नहीं है, बल्कि जरूरतमंद लोगों और अप्रयुक्त संसाधनों के बीच एक डिजिटल सेतु है।"
          )}
        </p>
      </div>

      {/* Mission */}
      <Card className="mb-12 bg-primary/5 border-primary/20">
        <CardContent className="pt-8 pb-8">
          <h2 className="text-2xl font-serif font-bold text-foreground mb-4">
            {t("Our Mission", "हमारा मिशन")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {t(
              "Despite various government initiatives, many people in India face difficulties accessing welfare benefits due to lack of awareness, complex eligibility criteria, and no centralized information system. Smart Aid bridges this gap by providing a compassionate, accessible platform that connects economically weaker sections with the support systems available to them.",
              "विभिन्न सरकारी पहलों के बावजूद, भारत में कई लोगों को जागरूकता की कमी, जटिल पात्रता मानदंड और कोई केंद्रीकृत सूचना प्रणाली नहीं होने के कारण कल्याण लाभों तक पहुंचने में कठिनाइयों का सामना करना पड़ता है। स्मार्ट एड इस अंतर को पाटता है, आर्थिक रूप से कमजोर वर्गों को उनके लिए उपलब्ध सहायता प्रणालियों से जोड़ने वाला एक दयालु, सुलभ प्लेटफॉर्म प्रदान करके।"
            )}
          </p>
        </CardContent>
      </Card>

      {/* Features */}
      <h2 className="text-2xl font-serif font-bold text-foreground mb-6">
        {t("Key Features", "मुख्य विशेषताएं")}
      </h2>
      <div className="space-y-4 mb-12">
        {features.map((feature, i) => {
          const Icon = feature.icon;
          return (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${feature.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-1">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* SDG Alignment */}
      <Card className="mb-12">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("UN Sustainable Development Goals Alignment", "संयुक्त राष्ट्र सतत विकास लक्ष्यों के साथ संरेखण")}
          </h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {sdgs.map((sdg, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                {sdg}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Technology */}
      <Card className="mb-12">
        <CardContent className="pt-6">
          <h2 className="text-xl font-semibold text-foreground mb-4">
            {t("How It Works", "यह कैसे काम करता है")}
          </h2>
          <ol className="space-y-4">
            {[
              t("Enter your personal and financial details in the Eligibility Checker", "पात्रता जांचकर्ता में अपना व्यक्तिगत और वित्तीय विवरण दर्ज करें"),
              t("Our rule-based AI analyzes your profile against all active government schemes", "हमारी नियम-आधारित एआई आपकी प्रोफ़ाइल का सभी सक्रिय सरकारी योजनाओं के विरुद्ध विश्लेषण करती है"),
              t("Receive a personalized list of schemes you are eligible for with application links", "आवेदन लिंक के साथ उन योजनाओं की व्यक्तिगत सूची प्राप्त करें जिनके लिए आप पात्र हैं"),
              t("Find nearby NGOs, hospitals, and food centers for immediate support", "तत्काल सहायता के लिए निकटतम एनजीओ, अस्पताल और खाद्य केंद्र खोजें"),
              t("Browse job opportunities and connect directly with employers", "नौकरी के अवसर ब्राउज़ करें और सीधे नियोक्ताओं से जुड़ें"),
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold shrink-0">
                  {i + 1}
                </span>
                <span className="text-sm text-muted-foreground mt-0.5">{step}</span>
              </li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="text-center">
        <Link href="/eligibility">
          <Button size="lg" data-testid="btn-get-started">
            {t("Get Started — Check Your Eligibility", "शुरू करें — अपनी पात्रता जांचें")}
          </Button>
        </Link>
      </div>
    </div>
  );
}
