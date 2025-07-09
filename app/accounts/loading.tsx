import { AdvancedLoading } from '@/components/ui/advanced-loading';

export default function Loading() {
  return <AdvancedLoading message="Cargando cuentas y balances..." showProgress={true} />;
}
