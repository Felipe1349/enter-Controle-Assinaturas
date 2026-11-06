import { lazy } from "react";

import { AppLayout } from "./components/layout/AppLayout";
import NotFound from "./pages/NotFound";

// Cada módulo é carregado sob demanda (code-splitting por rota).
const Dashboard = lazy(() => import("./pages/dashboard"));
const Clientes = lazy(() => import("./pages/clientes"));
const ClienteDetalhes = lazy(() => import("./pages/cliente-detalhes"));
const Pagamentos = lazy(() => import("./pages/pagamentos"));
const Calendario = lazy(() => import("./pages/calendario"));
const Caixa = lazy(() => import("./pages/caixa"));
const Configuracoes = lazy(() => import("./pages/configuracoes"));

export const routers = [
  {
    path: "/",
    name: "app",
    element: <AppLayout />,
    children: [
      {
        index: true,
        name: "dashboard",
        element: <Dashboard />,
      },
      {
        path: "clientes",
        name: "clientes",
        element: <Clientes />,
      },
      {
        path: "clientes/:id",
        name: "clienteDetalhes",
        element: <ClienteDetalhes />,
      },
      {
        path: "pagamentos",
        name: "pagamentos",
        element: <Pagamentos />,
      },
      {
        path: "calendario",
        name: "calendario",
        element: <Calendario />,
      },
      {
        path: "caixa",
        name: "caixa",
        element: <Caixa />,
      },
      {
        path: "configuracoes",
        name: "configuracoes",
        element: <Configuracoes />,
      },
    ],
  },
  /* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */
  {
    path: "*",
    name: "404",
    element: <NotFound />,
  },
];

declare global {
  interface Window {
    __routers__: typeof routers;
  }
}

window.__routers__ = routers;
