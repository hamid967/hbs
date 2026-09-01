import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  const handleGoHome = () => {
    setLocation("/");
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-ds-neutral-50 via-white to-ds-brand-50/20" dir="rtl">
      <Card className="w-full max-w-lg mx-4 shadow-xl border border-ds-neutral-200 bg-white/95 backdrop-blur-sm rounded-3xl">
        <CardContent className="pt-8 pb-8 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="relative">
              <div className="absolute inset-0 bg-red-100 dark:bg-red-950/40 rounded-full animate-pulse" />
              <AlertCircle className="relative h-16 w-16 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-black text-ds-ink">404</h1>

          <h2 className="text-xl font-bold text-ds-ink">
            الصفحة غير موجودة · Page Not Found
          </h2>

          <p className="text-sm text-ds-neutral-600 leading-relaxed max-w-sm mx-auto">
            عذراً، الصفحة التي تبحث عنها غير متوفرة أو قد تم نقلها أو حذفها.
          </p>

          <div
            id="not-found-button-group"
            className="flex flex-col sm:flex-row gap-3 justify-center pt-2"
          >
            <Button
              onClick={handleGoHome}
              className="bg-ds-brand-600 hover:bg-ds-brand-700 text-white px-6 py-2.5 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg font-bold"
            >
              <Home className="w-4 h-4 ml-2" />
              العودة للرئيسية
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
