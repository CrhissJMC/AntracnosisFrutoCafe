import { Button, Heading, Text } from '../components/atoms';
import { MainLayout } from '../components/templates';

export function NotFoundPage() {
  return (
    <MainLayout>
      <div className="container" style={{ textAlign: 'center', paddingBlock: 'var(--space-16)', display: 'grid', gap: 'var(--space-4)', justifyItems: 'center' }}>
        <Heading as="h1" size="xl">
          Página no encontrada
        </Heading>
        <Text>La dirección que buscas no existe o fue movida.</Text>
        <Button to="/">Volver al inicio</Button>
      </div>
    </MainLayout>
  );
}
