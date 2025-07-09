// Script para precompilar todas las rutas
const routes = [
  '/',
  '/accounts',
  '/accounts/analysis', 
  '/accounts/goals',
  '/budget',
  '/goals',
  '/payments',
  '/payments/analytics',
  '/payments/new',
  '/payments/settings',
  '/payments/success',
  '/settings',
  '/transactions'
];

async function precompileRoutes() {
  console.log('🚀 Precompilando rutas...');
  
  for (const route of routes) {
    try {
      const response = await fetch(`http://localhost:3000${route}`, {
        method: 'HEAD'
      });
      console.log(`✅ ${route}: ${response.status}`);
    } catch (error) {
      console.log(`❌ ${route}: Error`);
    }
  }
  
  console.log('✨ Precompilación completada');
}

if (typeof window !== 'undefined') {
  // Solo ejecutar en el navegador
  setTimeout(precompileRoutes, 2000);
}
