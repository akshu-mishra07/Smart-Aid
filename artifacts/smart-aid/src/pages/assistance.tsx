import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListAssistanceCenters, getListAssistanceCentersQueryKey } from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const centerTypeColor: Record<string, string> = {
  ngo: "bg-green-100 text-green-700",
  hospital: "bg-red-100 text-red-700",
  food_center: "bg-yellow-100 text-yellow-700",
};

const centerTypeLabel: Record<string, { en: string; hi: string }> = {
  ngo: { en: "NGO", hi: "एनजीओ" },
  hospital: { en: "Hospital", hi: "अस्पताल" },
  food_center: { en: "Food Center", hi: "खाद्य केंद्र" },
};

export default function Assistance() {
  const { t, language } = useLanguage();
  const [type, setType] = useState("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("all");

  const params = {
    ...(type !== "all" ? { type } : {}),
    ...(city ? { city } : {}),
    ...(state !== "all" ? { state } : {}),
  };

  const { data: centers, isLoading } = useListAssistanceCenters(params, {
    query: { queryKey: getListAssistanceCentersQueryKey(params) },
  });

  const STATES = ["Delhi", "Maharashtra", "Karnataka", "Uttar Pradesh", "Bihar", "Punjab", "Gujarat", "Rajasthan", "Tamil Nadu"];

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("Nearby Assistance Centers", "निकटतम सहायता केंद्र")}
        </h1>
        <p className="text-muted-foreground">
          {t("Find NGOs, hospitals, and food distribution centers near you", "अपने आस-पास एनजीओ, अस्पताल और खाद्य वितरण केंद्र खोजें")}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Select value={type} onValueChange={setType}>
          <SelectTrigger className="w-full sm:w-48" data-testid="select-type">
            <SelectValue placeholder={t("Type", "प्रकार")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("All Types", "सभी प्रकार")}</SelectItem>
            <SelectItem value="ngo">{t("NGO", "एनजीओ")}</SelectItem>
            <SelectItem value="hospital">{t("Hospital", "अस्पताल")}</SelectItem>
            <SelectItem value="food_center">{t("Food Center", "खाद्य केंद्र")}</SelectItem>
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
        <div className="grid sm:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-32 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : centers?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">{t("No assistance centers found for the selected filters.", "चयनित फ़िल्टर के लिए कोई सहायता केंद्र नहीं मिला।")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {centers?.map((center) => (
            <Card key={center.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-3">
                  <Badge className={centerTypeColor[center.type] || "bg-gray-100 text-gray-700"}>
                    {language === "hi"
                      ? centerTypeLabel[center.type]?.hi || center.type
                      : centerTypeLabel[center.type]?.en || center.type}
                  </Badge>
                </div>
                <h3 className="font-semibold text-foreground mb-2" data-testid={`center-name-${center.id}`}>
                  {center.name}
                </h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span>{center.address}, {center.city}, {center.state}</span>
                  </div>
                  {center.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 shrink-0" />
                      <a href={`tel:${center.phone}`} className="hover:text-primary">{center.phone}</a>
                    </div>
                  )}
                  {center.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 shrink-0" />
                      <a href={`mailto:${center.email}`} className="hover:text-primary">{center.email}</a>
                    </div>
                  )}
                  {center.operatingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 shrink-0" />
                      <span>{center.operatingHours}</span>
                    </div>
                  )}
                </div>
                {center.services.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1">
                    {center.services.map((service, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{service}</Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
