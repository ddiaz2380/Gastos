import { AdvancedLoading } from '@/components/ui/advanced-loading';

export default function Loading() {
  return <AdvancedLoading message="Cargando transacciones..." showProgress={true} />;
}
