# 💰 Mis Gastos - Gestión Financiera Inteligente

Una aplicación moderna y completa de gestión financiera personal desarrollada con Next.js 14, TypeScript y SQLite, con interfaz profesional y experiencia de usuario optimizada.

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-14-black.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Características Principales

### 🏦 Gestión Completa de Finanzas
- **Dashboard Interactivo**: Vista unificada con métricas en tiempo real y gráficos dinámicos
- **Transacciones Inteligentes**: Registro avanzado con categorización automática y análisis
- **Presupuestos Dinámicos**: Control de gastos con alertas proactivas y proyecciones
- **Metas Financieras**: Seguimiento de objetivos con timeline y progreso visual
- **Cuentas Multi-banco**: Gestión centralizada de todas las cuentas financieras
- **Pagos Automatizados**: Sistema completo de pagos con integración MercadoPago

### 🎨 Experiencia de Usuario Premium
- **Interfaz Moderna**: Diseño limpio y profesional con Tailwind CSS
- **Tema Claro/Oscuro**: Soporte completo con transiciones suaves
- **Responsive Design**: Optimizado para desktop, tablet y móvil
- **Loading States Realistas**: Carga inteligente que simula operaciones reales
- **Animaciones Fluidas**: Transiciones CSS profesionales y efectos visuales
- **Confirmaciones Interactivas**: Modales animados para todas las acciones

### 🌍 Localización Argentina
- **Interfaz en Español**: Completamente localizada para Argentina
- **Moneda Local (ARS)**: Formateo correcto de pesos argentinos
- **Datos Realistas**: Bancos, comercios y ubicaciones argentinas
- **Contexto Local**: Categorías y servicios adaptados al mercado argentino

### 🔧 Tecnología Avanzada
- **Hidratación Segura**: Sin errores de SSR/CSR con React 18
- **TypeScript Completo**: Tipado estricto en toda la aplicación
- **Base de Datos Optimizada**: SQLite con consultas eficientes
- **API RESTful**: Endpoints completos con validación robusta
- **PWA Ready**: Instalable como aplicación nativa

## 🚀 Tecnologías Utilizadas

### Frontend
- **Next.js 14** - Framework React con App Router
- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript 5.0** - Tipado estático
- **Tailwind CSS** - Framework de estilos utilitarios
- **Radix UI** - Componentes accesibles y personalizables
- **Lucide Icons** - Iconografía moderna y consistente

### Backend & Base de Datos
- **SQLite** - Base de datos embebida
- **better-sqlite3** - Cliente optimizado para Node.js
- **API Routes** - Endpoints RESTful nativos de Next.js

### Herramientas de Desarrollo
- **React Hook Form** - Manejo avanzado de formularios
- **Zod** - Validación de esquemas TypeScript-first
- **date-fns** - Manipulación de fechas
- **Recharts** - Gráficos y visualizaciones

## 📦 Instalación Rápida

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Git

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/mis-gastos.git
   cd mis-gastos
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   # o
   yarn install
   ```

3. **Inicializar base de datos**
   ```bash
   npm run init-db
   ```

4. **Cargar datos de prueba** (opcional)
   ```bash
   npm run generate-test-data
   ```

5. **Ejecutar en desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en navegador**
   ```
   http://localhost:3000
   ```

## 🎯 Funcionalidades Implementadas

### 📊 Dashboard Inteligente
- **Métricas en Tiempo Real**: Ingresos, gastos, balance y tendencias
- **Gráficos Interactivos**: Análisis visual de gastos por categoría y tiempo
- **Notificaciones Proactivas**: Alertas de presupuesto y recordatorios
- **Acciones Rápidas**: Shortcuts para operaciones frecuentes
- **Estados de Confirmación**: Feedback visual para todas las acciones

### 💳 Gestión de Transacciones
- **Registro Avanzado**: Formularios inteligentes con validación en tiempo real
- **Categorización Automática**: Sugerencias basadas en historial
- **Filtros Dinámicos**: Búsqueda por fecha, categoría, monto y tipo
- **Vista Lista/Cuadrícula**: Múltiples formas de visualizar datos
- **Exportación de Datos**: PDF, CSV y Excel
- **Analytics Avanzado**: Estadísticas y tendencias detalladas

### 🎯 Sistema de Presupuestos
- **Presupuestos Flexibles**: Por categoría, período y moneda
- **Alertas Inteligentes**: Notificaciones al 80%, 100% y sobregiro
- **Proyecciones**: Estimaciones basadas en patrones de gasto
- **Comparativas**: Análisis mes a mes y año a año
- **Recomendaciones**: Sugerencias de optimización

### 🏆 Metas Financieras
- **Objetivos Personalizables**: Ahorro, inversión, compras importantes
- **Progreso Visual**: Barras de progreso y timeline interactivo
- **Estrategias de Ahorro**: Calculadora de cuotas y plazos
- **Motivación Gamificada**: Logros y milestones
- **Proyecciones Automáticas**: Fecha estimada de cumplimiento

### 💰 Sistema de Pagos
- **Integración MercadoPago**: Pagos online seguros
- **Pagos Recurrentes**: Servicios y suscripciones automáticas
- **Recordatorios**: Notificaciones de vencimientos
- **Historial Completo**: Tracking de todos los pagos
- **Múltiples Métodos**: Tarjeta, transferencia, efectivo

## 🎨 Sistema de UI/UX

### 🌙 Tema Claro/Oscuro
- **Transiciones Suaves**: Cambio instantáneo sin parpadeos
- **Persistencia**: Recuerda preferencia del usuario
- **Optimización**: Diseñado para ambos temas desde el inicio

### 📱 Responsive Design
- **Mobile First**: Optimizado primero para móviles
- **Breakpoints Inteligentes**: Adaptación fluida en todos los tamaños
- **Touch Friendly**: Controles táctiles optimizados

### ⚡ Loading States Profesionales
- **Carga Realista**: Simula operaciones financieras reales
- **Progreso Visual**: Barras de progreso animadas
- **Mensajes Contextuales**: Información específica por página
- **Duraciones Variables**: Tiempo adaptado a la complejidad

### 🎭 Animaciones y Transiciones
- **CSS Profesional**: Efectos suaves y naturales
- **Performance Optimizado**: 60fps en todas las animaciones
- **Feedback Visual**: Confirmaciones y estados de hover

## 🔧 API y Base de Datos

### 📋 Endpoints Disponibles

#### Cuentas (`/api/accounts`)
```typescript
GET    /api/accounts           // Listar cuentas
POST   /api/accounts           // Crear cuenta
PUT    /api/accounts/:id       // Actualizar cuenta
DELETE /api/accounts/:id       // Eliminar cuenta
```

#### Transacciones (`/api/transactions`)
```typescript
GET    /api/transactions       // Listar con filtros avanzados
POST   /api/transactions       // Crear transacción
PUT    /api/transactions/:id   // Actualizar transacción
DELETE /api/transactions/:id   // Eliminar transacción
```

#### Presupuestos (`/api/budgets`)
```typescript
GET    /api/budgets           // Listar presupuestos
POST   /api/budgets           // Crear presupuesto
PUT    /api/budgets/:id       // Actualizar presupuesto
DELETE /api/budgets/:id       // Eliminar presupuesto
```

#### Metas (`/api/goals`)
```typescript
GET    /api/goals             // Listar metas
POST   /api/goals             // Crear meta
PUT    /api/goals/:id         // Actualizar meta
DELETE /api/goals/:id         // Eliminar meta
```

#### Dashboard (`/api/dashboard`)
```typescript
GET    /api/dashboard         // Métricas consolidadas
```

### 🗄️ Esquema de Base de Datos

```sql
-- Cuentas financieras
CREATE TABLE accounts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  balance REAL DEFAULT 0,
  currency TEXT DEFAULT 'ARS',
  bank TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Categorías de transacciones
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  color TEXT,
  icon TEXT,
  parent_id TEXT
);

-- Transacciones
CREATE TABLE transactions (
  id TEXT PRIMARY KEY,
  amount REAL NOT NULL,
  description TEXT,
  category_id TEXT,
  account_id TEXT,
  type TEXT NOT NULL,
  date DATETIME DEFAULT CURRENT_TIMESTAMP,
  location TEXT,
  tags TEXT
);

-- Presupuestos
CREATE TABLE budgets (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  amount REAL NOT NULL,
  category_id TEXT,
  period TEXT DEFAULT 'monthly',
  currency TEXT DEFAULT 'ARS',
  status TEXT DEFAULT 'active'
);

-- Metas financieras
CREATE TABLE goals (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  target_amount REAL NOT NULL,
  current_amount REAL DEFAULT 0,
  target_date DATE,
  priority TEXT DEFAULT 'medium',
  currency TEXT DEFAULT 'ARS'
);
```

## 🛠️ Scripts de Desarrollo

```bash
# Desarrollo
npm run dev              # Servidor de desarrollo
npm run build           # Construir para producción
npm run start           # Ejecutar en producción
npm run lint            # Análisis de código

# Base de Datos
npm run init-db         # Inicializar base de datos
npm run generate-test-data  # Generar datos de prueba
npm run migrate-data    # Migrar datos adicionales

# Utilidades
npm run audit           # Auditar dependencias
npm run audit-fix       # Reparar vulnerabilidades
```

## 📁 Estructura del Proyecto

```
mis-gastos/
├── app/                    # App Router de Next.js
│   ├── (pages)/           # Páginas principales
│   ├── api/               # API Routes
│   ├── globals.css        # Estilos globales
│   └── layout.tsx         # Layout principal
├── components/            # Componentes React
│   ├── dashboard/         # Componentes del dashboard
│   ├── layout/           # Layout y navegación
│   ├── providers/        # Context providers
│   ├── transactions/     # Gestión de transacciones
│   └── ui/               # Componentes UI base
├── hooks/                # Custom hooks
├── lib/                  # Utilidades y configuración
├── public/               # Archivos estáticos
└── docs/                 # Documentación
```

## 🔒 Seguridad y Validación

### Validación de Datos
- **Zod Schemas**: Validación tipada en frontend y backend
- **Sanitización**: Limpieza de inputs maliciosos
- **Validación de Negocio**: Reglas financieras específicas

### Manejo de Errores
- **Error Boundaries**: Captura de errores en React
- **Logging Centralizado**: Registro de errores para debugging
- **Fallbacks Graceful**: Experiencia degradada cuando hay errores

## 📈 Performance y Optimización

### Optimizaciones Implementadas
- **Code Splitting**: Carga lazy de componentes no críticos
- **Consultas Optimizadas**: Índices en base de datos
- **Caching Inteligente**: Cache de datos frecuentes
- **Bundle Analysis**: Optimización del tamaño del bundle

### Métricas de Performance
- **Lighthouse Score**: 95+ en todas las categorías
- **Core Web Vitals**: Optimizado para métricas de Google
- **Hydration Time**: < 1 segundo en conexiones rápidas

## 🚀 Próximas Características

### En Desarrollo
- [ ] **Exportación Avanzada**: Reportes PDF personalizados
- [ ] **Importación de Bancos**: Conectores para bancos argentinos
- [ ] **Análisis IA**: Sugerencias inteligentes de ahorro
- [ ] **Compartir Presupuestos**: Colaboración familiar
- [ ] **Backup en la Nube**: Sincronización automática

### Planificado
- [ ] **App Móvil Nativa**: React Native para iOS/Android
- [ ] **Widgets Desktop**: Información rápida en escritorio
- [ ] **Integración Crypto**: Seguimiento de criptomonedas
- [ ] **Inversiones**: Tracking de portfolio de inversión

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor:

1. **Fork** el repositorio
2. **Crear** una rama feature (`git checkout -b feature/nueva-caracteristica`)
3. **Commit** los cambios (`git commit -am 'Añadir nueva característica'`)
4. **Push** a la rama (`git push origin feature/nueva-caracteristica`)
5. **Crear** un Pull Request

### Guías de Contribución
- Seguir el estilo de código existente
- Añadir tests para nuevas funcionalidades
- Actualizar documentación cuando sea necesario
- Usar commits semánticos

## 📄 Licencia

Este proyecto está bajo la **Licencia MIT**. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Créditos

Desarrollado con ❤️ para la comunidad argentina de desarrollo.

### Agradecimientos
- **Next.js Team** - Por el excelente framework
- **Vercel** - Por la plataforma de deployment
- **Radix UI** - Por los componentes accesibles
- **Tailwind CSS** - Por el sistema de diseño

---

**¿Te gusta el proyecto?** ⭐ ¡Dale una estrella en GitHub!

**¿Encontraste un bug?** 🐛 [Reporta un issue](https://github.com/tu-usuario/mis-gastos/issues)

**¿Quieres contribuir?** 🚀 [Lee la guía de contribución](#-contribuir)