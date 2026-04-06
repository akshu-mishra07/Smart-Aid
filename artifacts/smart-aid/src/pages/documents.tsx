import { useState } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListDocuments, useUploadDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, CheckCircle, Clock, XCircle } from "lucide-react";

const statusConfig = {
  pending: { color: "bg-yellow-100 text-yellow-700", icon: Clock, label: "Pending", labelHi: "लंबित" },
  verified: { color: "bg-green-100 text-green-700", icon: CheckCircle, label: "Verified", labelHi: "सत्यापित" },
  rejected: { color: "bg-red-100 text-red-700", icon: XCircle, label: "Rejected", labelHi: "अस्वीकृत" },
};

const docTypeLabels: Record<string, { en: string; hi: string }> = {
  aadhar: { en: "Aadhar Card", hi: "आधार कार्ड" },
  pan: { en: "PAN Card", hi: "पैन कार्ड" },
  income_certificate: { en: "Income Certificate", hi: "आय प्रमाण पत्र" },
  caste_certificate: { en: "Caste Certificate", hi: "जाति प्रमाण पत्र" },
  domicile: { en: "Domicile Certificate", hi: "निवास प्रमाण पत्र" },
  other: { en: "Other Document", hi: "अन्य दस्तावेज़" },
};

export default function Documents() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [fileName, setFileName] = useState("");
  const [documentType, setDocumentType] = useState("");

  const { data: docs, isLoading } = useListDocuments({
    query: { queryKey: getListDocumentsQueryKey() },
  });

  const mutation = useUploadDocument();

  const handleUpload = () => {
    if (!fileName || !documentType) return;
    mutation.mutate({
      fileName,
      documentType: documentType as "aadhar" | "pan" | "income_certificate" | "caste_certificate" | "domicile" | "other",
      fileContent: "placeholder_base64",
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
        setDialogOpen(false);
        setFileName("");
        setDocumentType("");
      },
    });
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground mb-2">
            {t("My Documents", "मेरे दस्तावेज़")}
          </h1>
          <p className="text-muted-foreground">
            {t("Upload and track your identity documents for scheme applications", "योजना आवेदनों के लिए अपने पहचान दस्तावेज़ अपलोड करें और ट्रैक करें")}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="btn-upload">
              <Upload className="mr-2 h-4 w-4" />
              {t("Upload Document", "दस्तावेज़ अपलोड करें")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("Upload Document", "दस्तावेज़ अपलोड करें")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("Document Type", "दस्तावेज़ प्रकार")}</Label>
                <Select value={documentType} onValueChange={setDocumentType}>
                  <SelectTrigger data-testid="select-doc-type">
                    <SelectValue placeholder={t("Select document type", "दस्तावेज़ प्रकार चुनें")} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(docTypeLabels).map(([value, labels]) => (
                      <SelectItem key={value} value={value}>
                        {language === "hi" ? labels.hi : labels.en}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fileName">{t("File Name", "फ़ाइल का नाम")}</Label>
                <Input
                  id="fileName"
                  placeholder={t("e.g. aadhar_card.pdf", "उदा. aadhar_card.pdf")}
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  data-testid="input-filename"
                />
              </div>
              <div className="p-4 border-2 border-dashed rounded-lg text-center text-muted-foreground text-sm">
                {t("Document upload simulation — file browsing not required for demo", "दस्तावेज़ अपलोड सिमुलेशन — डेमो के लिए फ़ाइल ब्राउज़ करना आवश्यक नहीं")}
              </div>
              <Button
                className="w-full"
                onClick={handleUpload}
                disabled={!fileName || !documentType || mutation.isPending}
                data-testid="btn-submit-upload"
              >
                {mutation.isPending ? t("Uploading...", "अपलोड हो रहा है...") : t("Submit Document", "दस्तावेज़ जमा करें")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}><CardContent className="pt-6"><Skeleton className="h-16 w-full" /></CardContent></Card>
          ))}
        </div>
      ) : docs?.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">{t("No documents uploaded yet", "अभी तक कोई दस्तावेज़ अपलोड नहीं किया गया")}</p>
            <p className="text-sm text-muted-foreground mt-1">{t("Upload your identity documents to get started with scheme applications.", "योजना आवेदनों से शुरुआत करने के लिए अपने पहचान दस्तावेज़ अपलोड करें।")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {docs?.map((doc) => {
            const status = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.pending;
            const StatusIcon = status.icon;
            return (
              <Card key={doc.id} data-testid={`doc-card-${doc.id}`}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 p-2 bg-muted rounded-lg">
                        <FileText className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{doc.fileName}</p>
                        <p className="text-sm text-muted-foreground">
                          {language === "hi"
                            ? docTypeLabels[doc.documentType]?.hi || doc.documentType
                            : docTypeLabels[doc.documentType]?.en || doc.documentType}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {t("Uploaded: ", "अपलोड: ")}{new Date(doc.uploadedAt).toLocaleDateString("en-IN")}
                        </p>
                        {doc.notes && (
                          <p className="text-xs text-muted-foreground mt-1 italic">{doc.notes}</p>
                        )}
                      </div>
                    </div>
                    <Badge className={status.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {language === "hi" ? status.labelHi : status.label}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
