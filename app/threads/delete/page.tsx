import type { Metadata } from 'next';
import DataDeletionClientPage from './DataDeletionClientPage';

export const metadata: Metadata = {
  title: 'Instrucciones para Eliminar Datos',
  description: 'Cómo solicitar la eliminación de tus datos de nuestra aplicación.',
};

export default function DataDeletionPage() {
  return <DataDeletionClientPage />;
}