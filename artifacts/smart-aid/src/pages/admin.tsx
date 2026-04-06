import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useAdminAuth } from "@/lib/admin-auth";
import { Link, Redirect } from "wouter";
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
import { BookOpen, Briefcase, MapPin, Users, Plus, Trash2, Eye, Clock, FileText, CheckCircle, XCircle, Paperclip, LogOut, Shield } from "lucide-react";
import { useQueryClient, useQuery, useMutation } from "@tanstack/react-query";

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

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

const docTypeLabels: Record<string, { en: string; hi: string }> = {
  aadhar: { en: "Aadhar Card", hi: "आधार कार्ड" },
  pan: { en: "PAN Card", hi: "पैन कार्ड" },
  income_certificate: { en: "Income Certificate", hi: "आय प्रमाण पत्र" },
  caste_certificate: { en: "Caste Certificate", hi: "जाति प्रमाण पत्र" },
  domicile: { en: "Domicile Certificate", hi: "निवास प्रमाण पत्र" },
  other: { en: "Other Document", hi: "अन्य दस्तावेज़" },
};

const statusConfig = {
  pending: { color: "bg-amber-100 text-amber-800 border-amber-200", label: "Pending", labelHi: "लंबित" },
  verified: { color: "bg-emerald-100 text-emerald-800 border-emerald-200", label: "Approved", labelHi: "स्वीकृत" },
  rejected: { color: "bg-red-100 text-red-800 border-red-200", label: "Rejected", labelHi: "अस्वीकृत" },
};

function useAdminFetch<T>(key: string[], url: string) {
  const { token } = useAdminAuth();
  return useQuery<T>({
    queryKey: key,
    queryFn: async () => {
      const res = await fetch(`${BASE}/api${url}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled: !!token,
  });
}

function useAdminMutation<TBody, TResult = unknown>(method: string, urlFn: (vars: any) => string) {
  const { token } = useAdminAuth();
  return useMutation<TResult, Error, { url?: string; body?: TBody } & Record<string, any>>({
    mutationFn: async (vars) => {
      const url = urlFn(vars);
      const res = await fetch(`${BASE}/api${url}`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: vars.body !== undefined ? JSON.stringify(vars.body) : undefined,
      });
      if (!res.ok) throw new Error("Failed");
      if (res.status === 204) return null as TResult;
      return res.json();
    },
  });
}

function AdminContent() {
  const { t, language } = useLanguage();
  const { logout } = useAdminAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [form, setForm] = useState(emptySchemeForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [rejectDialogDoc, setRejectDialogDoc] = useState<number | null>(null);
  const [rejectNotes, setRejectNotes] = useState("");
  const [docFilter, setDocFilter] = useState<"all" | "pending" | "verified" | "rejected">("all");

  const { data: stats, isLoading: statsLoading } = useAdminFetch<any>(["admin-stats"], "/stats/summary");
  const { data: schemesByCategory } = useAdminFetch<any[]>(["admin-schemes-category"], "/stats/schemes-by-category");
  const { data: activity } = useAdminFetch<any[]>(["admin-activity"], "/stats/recent-activity");
  const { data: users } = useAdminFetch<any[]>(["admin-users"], "/admin/users");
  const { data: schemes, isLoading: schemesLoading } = useAdminFetch<any[]>(["admin-schemes"], "/schemes");
  const { data: adminDocs, isLoading: docsLoading } = useAdminFetch<any[]>(["admin-docs"], "/admin/documents");

  const deleteMutation = useAdminMutation("DELETE", (v: any) => `/admin/schemes/${v.id}`);
  const createMutation = useAdminMutation("POST", () => "/admin/schemes");
  const statusMutation = useAdminMutation("PATCH", (v: any) => `/admin/documents/${v.id}/status`);

  const handleDelete = (id: number) => {
    if (!window.confirm(t("Are you sure you want to delete this scheme?", "क्या आप इस योजना को हटाना चाहते हैं?"))) return;
    deleteMutation.mutate({ id } as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-schemes"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin-schemes-category"] });
      },
    });
  };

  const handleAddScheme = () => {
    setFormError(null);
    if (!form.name.trim() || !form.nameHindi.trim() || !form.description.trim() || !form.descriptionHindi.trim() || !form.ministry.trim()) {
      setFormError(t("Please fill in all required fields.", "कृपया सभी आवश्यक फ़ील्ड भरें।"));
      return;
    }

    createMutation.mutate({ body: {
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
    }} as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-schemes"] });
        queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
        queryClient.invalidateQueries({ queryKey: ["admin-schemes-category"] });
        setAddDialogOpen(false);
        setForm(emptySchemeForm);
        setFormError(null);
      },
      onError: () => {
        setFormError(t("Failed to create scheme. Please try again.", "योजना बनाने में विफल। कृपया पुनः प्रयास करें।"));
      },
    });
  };

  const handleApprove = (docId: number) => {
    statusMutation.mutate({ id: docId, body: { status: "verified" } } as any, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["admin-docs"] }),
    });
  };

  const handleReject = (docId: number) => {
    statusMutation.mutate({ id: docId, body: { status: "rejected", notes: rejectNotes.trim() || null } } as any, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["admin-docs"] });
        setRejectDialogDoc(null);
        setRejectNotes("");
      },
    });
  };

  const chartData = schemesByCategory?.map((item: any) => ({
    name: item.category,
    count: item.count,
  })) || [];

  const statCards = [
    { label: t("Total Schemes", "कुल योजनाएं"), value: stats?.totalSchemes, icon: BookOpen, color: "text-blue-600 bg-blue-50" },
    { label: t("Total Jobs", "कुल नौकरियां"), value: stats?.totalJobs, icon: Briefcase, color: "text-emerald-600 bg-emerald-50" },
    { label: t("Assistance Centers", "सहायता केंद्र"), value: stats?.totalAssistanceCenters, icon: MapPin, color: "text-amber-600 bg-amber-50" },
    { label: t("Registered Users", "पंजीकृत उपयोगकर्ता"), value: stats?.totalUsers, icon: Users, color: "text-violet-600 bg-violet-50" },
  ];

  const filteredDocs = adminDocs?.filter((doc: any) => {
    if (docFilter === "all") return true;
    return doc.status === docFilter;
  }) ?? [];

  const pendingCount = adminDocs?.filter((d: any) => d.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-primary/20">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-bold">
                  {t("Admin Dashboard", "एडमिन डैशबोर्ड")}
                </h1>
                <p className="text-slate-400 text-sm">
                  {t("Smart Aid Platform Management", "स्मार्ट ऐड प्लेटफॉर्म प्रबंधन")}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={logout}
              className="text-slate-300 hover:text-white hover:bg-slate-700"
              data-testid="btn-admin-logout"
            >
              <LogOut className="h-4 w-4 mr-2" />
              {t("Logout", "लॉगआउट")}
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-8 bg-white shadow-sm border" data-testid="admin-tabs">
            <TabsTrigger value="overview" data-testid="tab-overview">{t("Overview", "अवलोकन")}</TabsTrigger>
            <TabsTrigger value="documents" data-testid="tab-documents" className="relative">
              {t("Documents", "दस्तावेज़")}
              {pendingCount > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center w-5 h-5 text-xs font-bold bg-amber-500 text-white rounded-full">
                  {pendingCount}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="schemes" data-testid="tab-schemes">{t("Schemes", "योजनाएं")}</TabsTrigger>
            <TabsTrigger value="users" data-testid="tab-users">{t("Users", "उपयोगकर्ता")}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {statCards.map((card, i) => {
                const Icon = card.icon;
                return (
                  <Card key={i} className="border-0 shadow-sm">
                    <CardContent className="pt-6">
                      {statsLoading ? (
                        <Skeleton className="h-14 w-full" />
                      ) : (
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{card.label}</p>
                            <p className="text-3xl font-bold text-foreground mt-1">{card.value ?? 0}</p>
                          </div>
                          <div className={`p-2.5 rounded-xl ${card.color}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{t("Schemes by Category", "श्रेणी के अनुसार योजनाएं")}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">{t("Recent Activity", "हालिया गतिविधि")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {!activity ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => <Skeleton key={i} className="h-12 w-full" />)}
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {activity.map((item: any) => (
                        <div key={item.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors" data-testid={`activity-${item.id}`}>
                          <div className="mt-0.5 p-1.5 bg-slate-100 rounded-lg">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
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

          <TabsContent value="documents">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
              <h2 className="text-lg font-semibold">{t("Document Review", "दस्तावेज़ समीक्षा")}</h2>
              <div className="flex gap-2">
                {(["all", "pending", "verified", "rejected"] as const).map((f) => (
                  <Button
                    key={f}
                    size="sm"
                    variant={docFilter === f ? "default" : "outline"}
                    onClick={() => setDocFilter(f)}
                    className="text-xs"
                    data-testid={`filter-${f}`}
                  >
                    {f === "all" ? t("All", "सभी") :
                     f === "pending" ? t("Pending", "लंबित") :
                     f === "verified" ? t("Approved", "स्वीकृत") :
                     t("Rejected", "अस्वीकृत")}
                  </Button>
                ))}
              </div>
            </div>

            {docsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full" />)}
              </div>
            ) : filteredDocs.length === 0 ? (
              <Card className="border-0 shadow-sm">
                <CardContent className="py-12 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-40" />
                  <p className="text-muted-foreground font-medium">
                    {docFilter === "all"
                      ? t("No documents uploaded yet", "अभी तक कोई दस्तावेज़ नहीं")
                      : t("No documents with this status", "इस स्थिति वाले कोई दस्तावेज़ नहीं")}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredDocs.map((doc: any) => {
                  const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
                  return (
                    <Card key={doc.id} className="border-0 shadow-sm" data-testid={`admin-doc-${doc.id}`}>
                      <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className="mt-0.5 p-2.5 bg-slate-100 rounded-xl shrink-0">
                              <FileText className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground truncate">{doc.fileName}</p>
                              <p className="text-sm text-muted-foreground">
                                {language === "hi"
                                  ? docTypeLabels[doc.documentType]?.hi || doc.documentType
                                  : docTypeLabels[doc.documentType]?.en || doc.documentType}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {t("Uploaded by: ", "द्वारा अपलोड: ")}
                                <span className="font-medium text-foreground">{doc.userName}</span>
                                {doc.userEmail && <span className="ml-1 text-slate-400">({doc.userEmail})</span>}
                              </p>
                              <p className="text-xs text-slate-400">
                                {new Date(doc.uploadedAt).toLocaleDateString("en-IN", {
                                  year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                                })}
                              </p>
                              {doc.notes && (
                                <p className="text-xs mt-1 italic text-muted-foreground">
                                  {t("Notes: ", "टिप्पणी: ")}{doc.notes}
                                </p>
                              )}
                              {doc.objectPath && (
                                <a
                                  href={`${BASE}/api/storage${doc.objectPath}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-primary mt-1 inline-flex items-center gap-1 hover:underline"
                                >
                                  <Paperclip className="h-3 w-3" />
                                  {t("View file", "फ़ाइल देखें")}
                                </a>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge className={`${status.color} border text-xs`} variant="outline">
                              {language === "hi" ? status.labelHi : status.label}
                            </Badge>
                            {doc.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8"
                                  onClick={() => handleApprove(doc.id)}
                                  disabled={statusMutation.isPending}
                                  data-testid={`btn-approve-${doc.id}`}
                                >
                                  <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                  {t("Approve", "स्वीकृत")}
                                </Button>
                                <Dialog open={rejectDialogDoc === doc.id} onOpenChange={(open) => { if (!open) { setRejectDialogDoc(null); setRejectNotes(""); } }}>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 text-xs h-8"
                                      onClick={() => setRejectDialogDoc(doc.id)}
                                      data-testid={`btn-reject-${doc.id}`}
                                    >
                                      <XCircle className="h-3.5 w-3.5 mr-1" />
                                      {t("Reject", "अस्वीकृत")}
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent>
                                    <DialogHeader>
                                      <DialogTitle>{t("Reject Document", "दस्तावेज़ अस्वीकृत करें")}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 mt-4">
                                      <div className="space-y-2">
                                        <Label>{t("Reason for rejection (optional)", "अस्वीकृति का कारण (वैकल्पिक)")}</Label>
                                        <Textarea
                                          placeholder={t("e.g. Document is unclear, please re-upload", "जैसे दस्तावेज़ स्पष्ट नहीं है, कृपया पुनः अपलोड करें")}
                                          value={rejectNotes}
                                          onChange={(e) => setRejectNotes(e.target.value)}
                                          rows={3}
                                          data-testid="input-reject-notes"
                                        />
                                      </div>
                                      <Button
                                        className="w-full"
                                        variant="destructive"
                                        onClick={() => handleReject(doc.id)}
                                        disabled={statusMutation.isPending}
                                        data-testid="btn-confirm-reject"
                                      >
                                        {statusMutation.isPending
                                          ? t("Updating...", "अपडेट हो रहा है...")
                                          : t("Confirm Rejection", "अस्वीकृति की पुष्टि करें")}
                                      </Button>
                                    </div>
                                  </DialogContent>
                                </Dialog>
                              </>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schemes">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">{t("Manage Schemes", "योजनाएं प्रबंधित करें")}</h2>
              <Dialog open={addDialogOpen} onOpenChange={(open) => { setAddDialogOpen(open); if (!open) { setForm(emptySchemeForm); setFormError(null); } }}>
                <DialogTrigger asChild>
                  <Button data-testid="btn-add-scheme" size="sm">
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
                        <Input placeholder="Pradhan Mantri..." value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} data-testid="input-scheme-name" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Name (Hindi)", "नाम (हिंदी)")} *</Label>
                        <Input placeholder="प्रधानमंत्री..." value={form.nameHindi} onChange={e => setForm(f => ({ ...f, nameHindi: e.target.value }))} data-testid="input-scheme-name-hindi" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Description (English)", "विवरण (अंग्रेजी)")} *</Label>
                        <Textarea placeholder="Scheme description..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} data-testid="input-scheme-description" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Description (Hindi)", "विवरण (हिंदी)")} *</Label>
                        <Textarea placeholder="योजना का विवरण..." value={form.descriptionHindi} onChange={e => setForm(f => ({ ...f, descriptionHindi: e.target.value }))} rows={3} data-testid="input-scheme-description-hindi" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Scheme Type", "योजना प्रकार")}</Label>
                        <Select value={form.schemeType} onValueChange={v => setForm(f => ({ ...f, schemeType: v as typeof f.schemeType }))}>
                          <SelectTrigger data-testid="select-scheme-type"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["scholarship", "housing", "employment", "health", "food", "pension", "other"].map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Category", "श्रेणी")}</Label>
                        <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v as typeof f.category }))}>
                          <SelectTrigger data-testid="select-scheme-category"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {["general", "sc", "st", "obc", "minority", "women", "disability", "all"].map(v => (<SelectItem key={v} value={v}>{v}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>{t("Ministry", "मंत्रालय")} *</Label>
                      <Input placeholder="Ministry of..." value={form.ministry} onChange={e => setForm(f => ({ ...f, ministry: e.target.value }))} data-testid="input-scheme-ministry" />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Min Age", "न्यूनतम आयु")}</Label>
                        <Input type="number" placeholder="e.g. 18" value={form.minAge} onChange={e => setForm(f => ({ ...f, minAge: e.target.value }))} data-testid="input-scheme-min-age" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Max Age", "अधिकतम आयु")}</Label>
                        <Input type="number" placeholder="e.g. 60" value={form.maxAge} onChange={e => setForm(f => ({ ...f, maxAge: e.target.value }))} data-testid="input-scheme-max-age" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Max Income", "अधिकतम आय")}</Label>
                        <Input type="number" placeholder="e.g. 250000" value={form.maxIncome} onChange={e => setForm(f => ({ ...f, maxIncome: e.target.value }))} data-testid="input-scheme-max-income" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t("Benefit Amount", "लाभ राशि")}</Label>
                        <Input placeholder="e.g. Rs 10,000 per year" value={form.benefitAmount} onChange={e => setForm(f => ({ ...f, benefitAmount: e.target.value }))} data-testid="input-scheme-benefit" />
                      </div>
                      <div className="space-y-2">
                        <Label>{t("Application URL", "आवेदन URL")}</Label>
                        <Input placeholder="https://..." value={form.applicationUrl} onChange={e => setForm(f => ({ ...f, applicationUrl: e.target.value }))} data-testid="input-scheme-url" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <input type="checkbox" id="isActive" checked={form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="h-4 w-4" data-testid="checkbox-scheme-active" />
                      <Label htmlFor="isActive">{t("Active (visible to users)", "सक्रिय (उपयोगकर्ताओं को दिखाई दे)")}</Label>
                    </div>
                    {formError && <p className="text-sm text-destructive">{formError}</p>}
                    <Button className="w-full" onClick={handleAddScheme} disabled={createMutation.isPending} data-testid="btn-submit-scheme">
                      {createMutation.isPending ? t("Saving...", "सहेज रहे हैं...") : t("Create Scheme", "योजना बनाएं")}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {schemesLoading ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="space-y-3">
                {schemes?.map((scheme: any) => (
                  <Card key={scheme.id} className="border-0 shadow-sm">
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
                            <Button size="sm" variant="ghost" data-testid={`btn-view-scheme-${scheme.id}`}><Eye className="h-4 w-4" /></Button>
                          </Link>
                          <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive" onClick={() => handleDelete(scheme.id)} disabled={deleteMutation.isPending} data-testid={`btn-delete-scheme-${scheme.id}`}>
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
            <h2 className="text-lg font-semibold mb-6">{t("Registered Users", "पंजीकृत उपयोगकर्ता")}</h2>
            {!users ? (
              <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
            ) : (
              <div className="space-y-3">
                {users.map((user: any) => (
                  <Card key={user.id} className="border-0 shadow-sm">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-medium" data-testid={`user-name-${user.id}`}>{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                          <p className="text-xs text-slate-400">{user.state}</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="secondary">{user.documentsCount} {t("docs", "दस्तावेज़")}</Badge>
                          <p className="text-xs text-slate-400 mt-1">{new Date(user.createdAt).toLocaleDateString("en-IN")}</p>
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
    </div>
  );
}

export default function Admin() {
  const { t } = useLanguage();
  const { isAuthenticated, isLoading } = useAdminAuth();

  if (isLoading) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">{t("Loading...", "लोड हो रहा है...")}</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/admin-login" />;
  }

  return <AdminContent />;
}
