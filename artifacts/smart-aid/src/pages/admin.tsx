import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { Link } from "wouter";
import {
  useGetStatsSummary, getGetStatsSummaryQueryKey,
  useGetSchemesByCategory, getGetSchemesByCategoryQueryKey,
  useGetRecentActivity, getGetRecentActivityQueryKey,
  useListUsers, getListUsersQueryKey,
  useListSchemes, getListSchemesQueryKey,
  useDeleteScheme,
  useCreateScheme,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { BookOpen, Briefcase, MapPin, Users, Plus, Trash2, Eye, Clock } from "lucide-react";

const activityIcons: Record<string, string> = {
  scheme_added: "BookOpen",
  job_posted: "Briefcase",
  center_added: "MapPin",
  document_uploaded: "FileText",
};

const emptySchemeForm = {
  name: "",
  nameHindi: "",
  description: "",
  descriptionHindi: "",
  schemeType: "other" as const,
  category: "general" as const,
  ministry: "",
  benefitAmount: "",
  applicationUrl: "",
  minAge: "",
  maxAge: "",
  maxIncome: "",
  isActive: true,
  documents: [] as string[],
};

export default function Admin() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState(emptySchemeForm);
  const [formError, setFormError] = useState<string | null>(null);

  const { data: stats, isLoading: statsLoading } = useGetStatsSummary({
    query: { queryKey: getGetStatsSummaryQueryKey() },
  });

  const { data: schemesByCategory } = useGetSchemesByCategory({
    query: { queryKey: getGetSchemesByCategoryQueryKey() },
  });

  const { data: activity } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() },
  });

  const { data: users } = useListUsers({
    query: { queryKey: getListUsersQueryKey() },
  });

  const { data: schemes, isLoading: schemesLoading } = useListSchemes({}, {
    query: { queryKey: getListSchemesQueryKey({}) },
  });

  const deleteMutation = useDeleteScheme();
  const createMutation = useCreateScheme();

  const handleDelete = (id: number) => {
    if (!window.confirm(t("Are you sure you want to delete this scheme?", "क्या आप इस योजना को हटाना चाहते हैं?"))) return;
    deleteMutation.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSchemesQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSchemesByCategoryQueryKey() });
      },
    });
  };

  const handleAddScheme = () => {
    setFormError(null);
    if (!form.name.trim() || !form.nameHindi.trim() || !form.description.trim() || !form.descriptionHindi.trim() || !form.ministry.trim()) {
      setFormError(t("Please fill in all required fields.", "कृपया सभी आवश्यक फ़ील्ड भरें।"));
      return;
    }

    createMutation.mutate({ data: {
      name: form.name.trim(),
      nameHindi: form.nameHindi.trim(),
      description: form.description.trim(),
      descriptionHindi: form.descriptionHindi.trim(),
      schemeType: form.schemeType,
      category: form.category,
      ministry: form.ministry.trim(),
      benefitAmount: form.benefitAmount.trim() || null,
      applicationUrl: form.applicationUrl.trim() || null,
      minAge: form.minAge ? parseInt(form.minAge) : null,
      maxAge: form.maxAge ? parseInt(form.maxAge) : null,
      maxIncome: form.maxIncome ? parseInt(form.maxIncome) : null,
      isActive: form.isActive,
      documents: form.documents,
    }}, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListSchemesQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetStatsSummaryQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetSchemesByCategoryQueryKey() });
        setAddDialogOpen(false);
        setForm(emptySchemeForm);
        setFormError(null);
      },
      onError: () => {
        setFormError(t("Failed to create scheme. Please try again.", "योजना बनाने में विफल। कृपया पुनः प्रयास करें।"));
      },
    });
  };

  const chartData = schemesByCategory?.map(item => ({
    name: item.category,
    count: item.count,
  })) || [];

  const statCards = [
    { label: t("Total Schemes", "कुल योजनाएं"), value: stats?.totalSchemes, icon: BookOpen, color: "text-blue-600" },
    { label: t("Total Jobs", "कुल नौकरियां"), value: stats?.totalJobs, icon: Briefcase, color: "text-green-600" },
    { label: t("Assistance Centers", "सहायता केंद्र"), value: stats?.totalAssistanceCenters, icon: MapPin, color: "text-orange-600" },
    { label: t("Registered Users", "पंजीकृत उपयोगकर्ता"), value: stats?.totalUsers, icon: Users, color: "text-purple-600" },
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
          {t("Admin Dashboard", "एडमिन डैशबोर्ड")}
        </h1>
        <p className="text-muted-foreground">
          {t("Manage schemes, monitor platform activity, and view user statistics", "योजनाएं प्रबंधित करें, प्लेटफॉर्म गतिविधि मॉनिटर करें और उपयोगकर्ता आंकड़े देखें")}
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8" data-testid="admin-tabs">
          <TabsTrigger value="overview" data-testid="tab-overview">{t("Overview", "अवलोकन")}</TabsTrigger>
          <TabsTrigger value="schemes" data-testid="tab-schemes">{t("Schemes", "योजनाएं")}</TabsTrigger>
          <TabsTrigger value="users" data-testid="tab-users">{t("Users", "उपयोगकर्ता")}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, i) => {
              const Icon = card.icon;
              return (
                <Card key={i}>
                  <CardContent className="pt-6">
                    {statsLoading ? (
                      <Skeleton className="h-14 w-full" />
                    ) : (
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">{card.label}</p>
                          <p className="text-3xl font-bold text-foreground mt-1">{card.value ?? 0}</p>
                        </div>
                        <Icon className={`h-5 w-5 ${card.color}`} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("Schemes by Category", "श्रेणी के अनुसार योजनाएं")}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("Recent Activity", "हालिया गतिविधि")}</CardTitle>
              </CardHeader>
              <CardContent>
                {!activity ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {activity.map((item) => (
                      <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50" data-testid={`activity-${item.id}`}>
                        <div className="mt-0.5 p-1.5 bg-background rounded-md">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.description}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(item.timestamp).toLocaleDateString("en-IN")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="schemes">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">{t("Manage Schemes", "योजनाएं प्रबंधित करें")}</h2>
            <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) { setForm(emptySchemeForm); setFormError(null); } }}>
              <DialogTrigger asChild>
                <Button data-testid="btn-add-scheme">
                  <Plus className="mr-2 h-4 w-4" />
                  {t("Add Scheme", "योजना जोड़ें")}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{t("Add New Scheme", "नई योजना जोड़ें")}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Name (English)", "नाम (अंग्रेजी)")} *</Label>
                      <Input
                        placeholder="Pradhan Mantri..."
                        value={form.name}
                        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        data-testid="input-scheme-name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Name (Hindi)", "नाम (हिंदी)")} *</Label>
                      <Input
                        placeholder="प्रधानमंत्री..."
                        value={form.nameHindi}
                        onChange={e => setForm(f => ({ ...f, nameHindi: e.target.value }))}
                        data-testid="input-scheme-name-hindi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Description (English)", "विवरण (अंग्रेजी)")} *</Label>
                      <Textarea
                        placeholder="Scheme description..."
                        value={form.description}
                        onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                        rows={3}
                        data-testid="input-scheme-description"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Description (Hindi)", "विवरण (हिंदी)")} *</Label>
                      <Textarea
                        placeholder="योजना का विवरण..."
                        value={form.descriptionHindi}
                        onChange={e => setForm(f => ({ ...f, descriptionHindi: e.target.value }))}
                        rows={3}
                        data-testid="input-scheme-description-hindi"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Scheme Type", "योजना प्रकार")}</Label>
                      <Select value={form.schemeType} onValueChange={v => setForm(f => ({ ...f, schemeType: v as typeof f.schemeType }))}>
                        <SelectTrigger data-testid="select-scheme-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["scholarship", "housing", "employment", "health", "food", "pension", "other"].map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Category", "श्रेणी")}</Label>
                      <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as typeof f.category }))}>
                        <SelectTrigger data-testid="select-scheme-category">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {["general", "sc", "st", "obc", "minority", "women", "disability", "all"].map(v => (
                            <SelectItem key={v} value={v}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("Ministry", "मंत्रालय")} *</Label>
                    <Input
                      placeholder="Ministry of..."
                      value={form.ministry}
                      onChange={e => setForm(f => ({ ...f, ministry: e.target.value }))}
                      data-testid="input-scheme-ministry"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Min Age", "न्यूनतम आयु")}</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 18"
                        value={form.minAge}
                        onChange={e => setForm(f => ({ ...f, minAge: e.target.value }))}
                        data-testid="input-scheme-min-age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Max Age", "अधिकतम आयु")}</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 60"
                        value={form.maxAge}
                        onChange={e => setForm(f => ({ ...f, maxAge: e.target.value }))}
                        data-testid="input-scheme-max-age"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Max Income (₹/yr)", "अधिकतम आय")}</Label>
                      <Input
                        type="number"
                        placeholder="e.g. 250000"
                        value={form.maxIncome}
                        onChange={e => setForm(f => ({ ...f, maxIncome: e.target.value }))}
                        data-testid="input-scheme-max-income"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>{t("Benefit Amount", "लाभ राशि")}</Label>
                      <Input
                        placeholder="e.g. ₹10,000 per year"
                        value={form.benefitAmount}
                        onChange={e => setForm(f => ({ ...f, benefitAmount: e.target.value }))}
                        data-testid="input-scheme-benefit"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Application URL", "आवेदन URL")}</Label>
                      <Input
                        placeholder="https://..."
                        value={form.applicationUrl}
                        onChange={e => setForm(f => ({ ...f, applicationUrl: e.target.value }))}
                        data-testid="input-scheme-url"
                      />
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      checked={form.isActive}
                      onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                      className="h-4 w-4"
                      data-testid="checkbox-scheme-active"
                    />
                    <Label htmlFor="isActive">{t("Active (visible to users)", "सक्रिय (उपयोगकर्ताओं को दिखाई दे)")}</Label>
                  </div>

                  {formError && (
                    <p className="text-sm text-destructive">{formError}</p>
                  )}

                  <Button
                    className="w-full"
                    onClick={handleAddScheme}
                    disabled={createMutation.isPending}
                    data-testid="btn-submit-scheme"
                  >
                    {createMutation.isPending
                      ? t("Saving...", "सहेज रहे हैं...")
                      : t("Create Scheme", "योजना बनाएं")}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {schemesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {schemes?.map((scheme) => (
                <Card key={scheme.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">{scheme.schemeType}</Badge>
                          <Badge variant="secondary" className="text-xs">{scheme.category}</Badge>
                          {!scheme.isActive && <Badge variant="destructive" className="text-xs">{t("Inactive", "निष्क्रिय")}</Badge>}
                        </div>
                        <p className="font-medium truncate" data-testid={`scheme-name-${scheme.id}`}>
                          {language === "hi" ? scheme.nameHindi : scheme.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{scheme.ministry}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Link href={`/schemes/${scheme.id}`}>
                          <Button size="sm" variant="ghost" data-testid={`btn-view-scheme-${scheme.id}`}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleDelete(scheme.id)}
                          disabled={deleteMutation.isPending}
                          data-testid={`btn-delete-scheme-${scheme.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          <h2 className="text-xl font-semibold mb-6">{t("Registered Users", "पंजीकृत उपयोगकर्ता")}</h2>
          {!users ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardContent className="py-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-medium" data-testid={`user-name-${user.id}`}>{user.name}</p>
                        <p className="text-sm text-muted-foreground">{user.email}</p>
                        <p className="text-xs text-muted-foreground">{user.state}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary">
                          {user.documentsCount} {t("docs", "दस्तावेज़")}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(user.createdAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
