import { useState, useRef, useCallback } from "react";
import { useLanguage } from "@/lib/language-context";
import { useListDocuments, useUploadDocument, getListDocumentsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Upload, CheckCircle, Clock, XCircle, Paperclip } from "lucide-react";

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

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "");

function useUpload(options: {
  onSuccess?: (res: { uploadURL: string; objectPath: string }) => void;
  onError?: (err: Error) => void;
} = {}) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<Error | null>(null);

  const uploadFile = useCallback(async (file: File) => {
    setIsUploading(true);
    setError(null);
    setProgress(10);
    try {
      const urlRes = await fetch(`${BASE}/api/storage/uploads/request-url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: file.name, size: file.size, contentType: file.type || "application/octet-stream" }),
      });
      if (!urlRes.ok) throw new Error("Failed to get upload URL");
      const { uploadURL, objectPath } = await urlRes.json();

      setProgress(40);
      const putRes = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });
      if (!putRes.ok) throw new Error("Failed to upload file");

      setProgress(100);
      options.onSuccess?.({ uploadURL, objectPath });
      return objectPath as string;
    } catch (err) {
      const e = err instanceof Error ? err : new Error("Upload failed");
      setError(e);
      options.onError?.(e);
      return null;
    } finally {
      setIsUploading(false);
    }
  }, []);

  return { uploadFile, isUploading, progress, error };
}

export default function Documents() {
  const { t, language } = useLanguage();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [documentType, setDocumentType] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: docs, isLoading } = useListDocuments({
    query: { queryKey: getListDocumentsQueryKey() },
  });

  const mutation = useUploadDocument();

  const { uploadFile, isUploading, progress } = useUpload({
    onError: (e) => setUploadError(e.message),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleSubmit = async () => {
    if (!documentType) return;

    let objectPath: string | null = null;

    if (selectedFile) {
      objectPath = await uploadFile(selectedFile);
      if (!objectPath) return;
    }

    mutation.mutate(
      {
        fileName: selectedFile?.name ?? `document_${Date.now()}`,
        documentType: documentType as "aadhar" | "pan" | "income_certificate" | "caste_certificate" | "domicile" | "other",
        objectPath: objectPath ?? undefined,
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListDocumentsQueryKey() });
          setDialogOpen(false);
          setSelectedFile(null);
          setDocumentType("");
          setUploadError(null);
          if (fileInputRef.current) fileInputRef.current.value = "";
        },
      }
    );
  };

  const isSubmitting = isUploading || mutation.isPending;
  const canSubmit = !!documentType && !isSubmitting;

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
                <Label>{t("Choose File", "फ़ाइल चुनें")}</Label>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/60 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2 text-sm text-foreground">
                      <Paperclip className="h-4 w-4 text-primary" />
                      <span className="font-medium truncate max-w-[200px]">{selectedFile.name}</span>
                      <span className="text-muted-foreground text-xs">
                        ({(selectedFile.size / 1024).toFixed(0)} KB)
                      </span>
                    </div>
                  ) : (
                    <div className="text-muted-foreground text-sm">
                      <Upload className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p>{t("Click to browse or drag a file here", "फ़ाइल चुनने के लिए क्लिक करें")}</p>
                      <p className="text-xs mt-1 opacity-70">PDF, JPG, PNG — max 10 MB</p>
                    </div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={handleFileChange}
                    data-testid="input-file"
                  />
                </div>
              </div>

              {isUploading && (
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">{t("Uploading...", "अपलोड हो रहा है...")}</p>
                  <Progress value={progress} className="h-1.5" />
                </div>
              )}

              {uploadError && (
                <p className="text-sm text-destructive">{uploadError}</p>
              )}

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!canSubmit}
                data-testid="btn-submit-upload"
              >
                {isSubmitting
                  ? t("Saving...", "सहेज रहे हैं...")
                  : t("Submit Document", "दस्तावेज़ जमा करें")}
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
                        {doc.objectPath && (
                          <a
                            href={`${BASE}/api/storage${doc.objectPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-primary mt-1 flex items-center gap-1 hover:underline"
                          >
                            <Paperclip className="h-3 w-3" />
                            {t("View file", "फ़ाइल देखें")}
                          </a>
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
