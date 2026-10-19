import { ArrowLeft, Compass } from "lucide-react";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("Erro 404: rota inexistente acessada:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="surface-gradient flex min-h-screen items-center justify-center p-6">
      <Card className="card-gradient w-full max-w-md border-border/70 shadow-card">
        <CardContent className="flex flex-col items-center gap-3 py-12 text-center">
          <span className="brand-gradient flex h-12 w-12 items-center justify-center rounded-2xl text-primary-foreground shadow-elegant">
            <Compass className="h-6 w-6" />
          </span>
          <p className="text-3xl font-bold">404</p>
          <p className="text-lg font-semibold">Página não encontrada</p>
          <p className="max-w-xs text-sm text-muted-foreground">
            O endereço acessado não existe neste sistema. Volte para o dashboard para continuar.
          </p>
          <Button asChild variant="hero" className="mt-2">
            <a href="/">
              <ArrowLeft className="h-4 w-4" />
              Voltar para o dashboard
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotFound;
