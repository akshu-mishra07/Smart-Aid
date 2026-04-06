import { useLanguage } from "@/lib/language-context";
import { Button } from "@/components/ui/button";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setLanguage(language === "en" ? "hi" : "en")}
      className="font-medium text-primary hover:text-primary-foreground hover:bg-primary border-primary transition-colors"
      data-testid="button-language-toggle"
    >
      {language === "en" ? "A / अ" : "A / अ"}
    </Button>
  );
}
