import type { Metadata } from 'next';
import PrivacyPolicyClientPage from './PrivacyPolicyClientPage';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Política de Privacidad para la aplicación de generación de frases motivacionales.',
};

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClientPage />;
}
