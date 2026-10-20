import { PageHeader } from "@/components/layout/PageHeader";

import { CotacaoCard } from "./CotacaoCard";
import { EmpresasCard } from "./EmpresasCard";
import { MensagemCobrancaCard } from "./MensagemCobrancaCard";
import { PlanosCard } from "./PlanosCard";

const Configuracoes = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        titulo="Configurações"
        descricao="Valores padrão dos planos, empresas, cotação e mensagem de cobrança do sistema."
      />

      <PlanosCard />
      <EmpresasCard />
      <CotacaoCard />
      <MensagemCobrancaCard />
    </div>
  );
};

export default Configuracoes;
