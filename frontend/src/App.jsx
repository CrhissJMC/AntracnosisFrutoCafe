import { AdminGuard } from './components/templates';
import { AuthProvider } from './context/AuthContext.jsx';
import { SiteProvider } from './context/SiteContext.jsx';
import { matchPath, RouterProvider, useRouter } from './lib/router.jsx';
import { HomePage } from './pages/HomePage.jsx';
import { AboutPage } from './pages/AboutPage.jsx';
import { MethodologyPage } from './pages/MethodologyPage.jsx';
import { BlogPage } from './pages/BlogPage.jsx';
import { ArticlePage } from './pages/ArticlePage.jsx';
import { ContactPage } from './pages/ContactPage.jsx';
import { LoginPage, RegisterPage } from './pages/AuthPages.jsx';
import { NotFoundPage } from './pages/NotFoundPage.jsx';
import { DashboardPage } from './pages/admin/DashboardPage.jsx';
import { ArticlesAdminPage } from './pages/admin/ArticlesAdminPage.jsx';
import { ArticleEditPage } from './pages/admin/ArticleEditPage.jsx';
import { CommentsAdminPage } from './pages/admin/CommentsAdminPage.jsx';
import { ContentAdminPage } from './pages/admin/ContentAdminPage.jsx';
import { SettingsAdminPage } from './pages/admin/SettingsAdminPage.jsx';
import { MessagesAdminPage } from './pages/admin/MessagesAdminPage.jsx';
import { UsersAdminPage } from './pages/admin/UsersAdminPage.jsx';
import { TraceabilityPage } from './pages/TraceabilityPage.jsx';
import { DiagnosisPage } from './pages/DiagnosisPage.jsx';
import { TraceabilityAdminPage } from './pages/admin/TraceabilityAdminPage.jsx';

// Tabla de rutas: patrón → página
const ROUTES = [
  ['/', HomePage],
  ['/nosotros', AboutPage],
  ['/metodologia', MethodologyPage],
  ['/servicios', MethodologyPage], // enlaces antiguos
  ['/blog', BlogPage],
  ['/blog/:slug', ArticlePage],
  ['/diagnostico', DiagnosisPage],
  ['/trazabilidad', TraceabilityPage],
  ['/contacto', ContactPage],
  ['/login', LoginPage],
  ['/registro', RegisterPage],
  ['/admin', DashboardPage],
  ['/admin/articulos', ArticlesAdminPage],
  ['/admin/articulos/:id', ArticleEditPage],
  ['/admin/comentarios', CommentsAdminPage],
  ['/admin/trazabilidad', TraceabilityAdminPage],
  ['/admin/contenido', ContentAdminPage],
  ['/admin/textos', SettingsAdminPage],
  ['/admin/mensajes', MessagesAdminPage],
  ['/admin/usuarios', UsersAdminPage],
];

function Routes() {
  const { pathname } = useRouter();
  for (const [pattern, Page] of ROUTES) {
    const params = matchPath(pattern, pathname);
    if (!params) continue;
    const page = <Page key={pattern + JSON.stringify(params)} {...params} />;
    return pattern.startsWith('/admin') ? <AdminGuard>{page}</AdminGuard> : page;
  }
  return <NotFoundPage />;
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <SiteProvider>
          <Routes />
        </SiteProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
