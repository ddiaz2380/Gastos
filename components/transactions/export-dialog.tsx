'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Download, 
  FileText, 
  Table, 
  Code, 
  Calculator,
  Calendar,
  DollarSign,
  Tag,
  CreditCard,
  Clock,
  Filter,
  Settings,
  FileSpreadsheet,
  Database
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account_name: string;
  date: string;
  tags?: string[];
  recurring?: boolean;
}

interface ExportDialogProps {
  transactions: Transaction[];
  onClose: () => void;
}

interface ExportField {
  key: keyof Transaction | 'formatted_date' | 'amount_formatted' | 'type_label';
  label: string;
  description: string;
  enabled: boolean;
  formula?: string;
}

const defaultFields: ExportField[] = [
  { key: 'id', label: 'ID', description: 'Identificador único de la transacción', enabled: true },
  { key: 'date', label: 'Fecha (Original)', description: 'Fecha en formato ISO', enabled: false },
  { key: 'formatted_date', label: 'Fecha (Formateada)', description: 'Fecha en formato legible', enabled: true },
  { key: 'type', label: 'Tipo (Código)', description: 'income/expense', enabled: false },
  { key: 'type_label', label: 'Tipo (Etiqueta)', description: 'Ingreso/Gasto', enabled: true },
  { key: 'amount', label: 'Monto (Numérico)', description: 'Valor numérico del monto', enabled: true },
  { key: 'amount_formatted', label: 'Monto (Formateado)', description: 'Monto con formato de moneda', enabled: false },
  { key: 'description', label: 'Descripción', description: 'Descripción de la transacción', enabled: true },
  { key: 'category', label: 'Categoría', description: 'Categoría de la transacción', enabled: true },
  { key: 'account_name', label: 'Cuenta', description: 'Nombre de la cuenta', enabled: true },
  { key: 'tags', label: 'Etiquetas', description: 'Etiquetas asociadas', enabled: false },
  { key: 'recurring', label: 'Recurrente', description: 'Si es una transacción recurrente', enabled: false }
];

export function ExportDialog({ transactions, onClose }: ExportDialogProps) {
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json'>('csv');
  const [fields, setFields] = useState<ExportField[]>(defaultFields);
  const [includeHeaders, setIncludeHeaders] = useState(true);
  const [dateFormat, setDateFormat] = useState('dd/MM/yyyy');
  const [customFormula, setCustomFormula] = useState('');
  const [formulaName, setFormulaName] = useState('');
  const [separator, setSeparator] = useState(',');
  const [encoding, setEncoding] = useState('UTF-8');
  const [filterByDateRange, setFilterByDateRange] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);

  const toggleField = (index: number) => {
    const newFields = [...fields];
    if (newFields[index]) {
      newFields[index].enabled = !newFields[index].enabled;
      setFields(newFields);
    }
  };

  const addCustomFormula = () => {
    if (!formulaName.trim() || !customFormula.trim()) {
      toast.error('Por favor, completa el nombre y la fórmula');
      return;
    }

    const newField: ExportField = {
      key: formulaName.toLowerCase().replace(/\s+/g, '_') as any,
      label: formulaName,
      description: `Fórmula personalizada: ${customFormula}`,
      enabled: true,
      formula: customFormula
    };

    setFields([...fields, newField]);
    setFormulaName('');
    setCustomFormula('');
    toast.success('Fórmula agregada exitosamente');
  };

  const removeCustomField = (index: number) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const processTransactionValue = (transaction: Transaction, field: ExportField): any => {
    if (field.formula) {
      // Procesar fórmulas personalizadas
      try {
        let formula = field.formula;
        formula = formula.replace(/\{amount\}/g, transaction.amount.toString());
        formula = formula.replace(/\{type\}/g, transaction.type === 'income' ? '1' : '-1');
        formula = formula.replace(/\{category_count\}/g, transaction.category.length.toString());
        
        // Evaluar fórmulas simples (solo operaciones básicas por seguridad)
        if (/^[\d\s+\-*/().]+$/.test(formula)) {
          return eval(formula);
        }
        return formula;
      } catch {
        return 'Error en fórmula';
      }
    }

    switch (field.key) {
      case 'formatted_date':
        return format(new Date(transaction.date), dateFormat, { locale: es });
      case 'amount_formatted':
        return `$${transaction.amount.toLocaleString()}`;
      case 'type_label':
        return transaction.type === 'income' ? 'Ingreso' : 'Gasto';
      case 'tags':
        return transaction.tags?.join('; ') || '';
      case 'recurring':
        return transaction.recurring ? 'Sí' : 'No';
      default:
        return transaction[field.key as keyof Transaction] || '';
    }
  };

  const getFilteredTransactions = () => {
    if (!filterByDateRange || !startDate || !endDate) {
      return transactions;
    }

    return transactions.filter(transaction => {
      const transactionDate = new Date(transaction.date);
      const start = new Date(startDate);
      const end = new Date(endDate);
      return transactionDate >= start && transactionDate <= end;
    });
  };

  const exportData = async () => {
    setIsExporting(true);
    
    try {
      const filteredTransactions = getFilteredTransactions();
      const enabledFields = fields.filter(field => field.enabled);
      
      if (enabledFields.length === 0) {
        toast.error('Selecciona al menos un campo para exportar');
        return;
      }

      if (filteredTransactions.length === 0) {
        toast.error('No hay transacciones para exportar');
        return;
      }

      let content = '';
      let filename = '';
      let mimeType = '';

      switch (exportFormat) {
        case 'csv':
          const csvRows = [];
          
          if (includeHeaders) {
            csvRows.push(enabledFields.map(field => field.label).join(separator));
          }
          
          filteredTransactions.forEach(transaction => {
            const row = enabledFields.map(field => {
              const value = processTransactionValue(transaction, field);
              const stringValue = String(value);
              // Escapar comillas y envolver en comillas si contiene el separador
              if (stringValue.includes(separator) || stringValue.includes('"') || stringValue.includes('\n')) {
                return `"${stringValue.replace(/"/g, '""')}"`;
              }
              return stringValue;
            });
            csvRows.push(row.join(separator));
          });
          
          content = csvRows.join('\n');
          filename = `transacciones_${format(new Date(), 'yyyy-MM-dd')}.csv`;
          mimeType = 'text/csv;charset=utf-8;';
          break;

        case 'json':
          const jsonData = filteredTransactions.map(transaction => {
            const obj: any = {};
            enabledFields.forEach(field => {
              obj[field.label] = processTransactionValue(transaction, field);
            });
            return obj;
          });
          
          content = JSON.stringify({
            exportDate: new Date().toISOString(),
            totalRecords: jsonData.length,
            fields: enabledFields.map(f => ({ name: f.label, description: f.description })),
            data: jsonData
          }, null, 2);
          filename = `transacciones_${format(new Date(), 'yyyy-MM-dd')}.json`;
          mimeType = 'application/json;charset=utf-8;';
          break;

        case 'excel':
          // Para Excel, generamos un CSV que Excel puede abrir
          const excelRows = [];
          
          if (includeHeaders) {
            excelRows.push(enabledFields.map(field => field.label).join('\t'));
          }
          
          filteredTransactions.forEach(transaction => {
            const row = enabledFields.map(field => {
              return processTransactionValue(transaction, field);
            });
            excelRows.push(row.join('\t'));
          });
          
          content = excelRows.join('\n');
          filename = `transacciones_${format(new Date(), 'yyyy-MM-dd')}.xls`;
          mimeType = 'application/vnd.ms-excel;charset=utf-8;';
          break;
      }

      // Crear y descargar el archivo
      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success(`Archivo ${filename} descargado exitosamente`);
      onClose();
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar los datos');
    } finally {
      setIsExporting(false);
    }
  };

  const enabledFieldsCount = fields.filter(f => f.enabled).length;
  const filteredTransactionsCount = getFilteredTransactions().length;

  return (
    <div className="space-y-6">
      {/* Resumen */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Resumen de Exportación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{filteredTransactionsCount}</p>
              <p className="text-sm text-muted-foreground">Transacciones</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{enabledFieldsCount}</p>
              <p className="text-sm text-muted-foreground">Campos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{exportFormat.toUpperCase()}</p>
              <p className="text-sm text-muted-foreground">Formato</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-orange-600">{encoding}</p>
              <p className="text-sm text-muted-foreground">Codificación</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Configuración de Formato */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración de Formato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Formato de Exportación</Label>
              <Select value={exportFormat} onValueChange={(value: 'csv' | 'excel' | 'json') => setExportFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      CSV (Valores separados por comas)
                    </div>
                  </SelectItem>
                  <SelectItem value="excel">
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4" />
                      Excel (Hoja de cálculo)
                    </div>
                  </SelectItem>
                  <SelectItem value="json">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4" />
                      JSON (Datos estructurados)
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {exportFormat === 'csv' && (
              <>
                <div className="space-y-2">
                  <Label>Separador</Label>
                  <Select value={separator} onValueChange={setSeparator}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value=",">Coma (,)</SelectItem>
                      <SelectItem value=";">Punto y coma (;)</SelectItem>
                      <SelectItem value="\t">Tabulación</SelectItem>
                      <SelectItem value="|">Pipe (|)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Codificación</Label>
                  <Select value={encoding} onValueChange={setEncoding}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTF-8">UTF-8</SelectItem>
                      <SelectItem value="ISO-8859-1">ISO-8859-1</SelectItem>
                      <SelectItem value="Windows-1252">Windows-1252</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label>Formato de Fecha</Label>
              <Select value={dateFormat} onValueChange={setDateFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dd/MM/yyyy">DD/MM/AAAA</SelectItem>
                  <SelectItem value="MM/dd/yyyy">MM/DD/AAAA</SelectItem>
                  <SelectItem value="yyyy-MM-dd">AAAA-MM-DD</SelectItem>
                  <SelectItem value="dd-MM-yyyy">DD-MM-AAAA</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox 
                id="headers" 
                checked={includeHeaders} 
                onCheckedChange={(checked) => setIncludeHeaders(checked === true)} 
              />
              <Label htmlFor="headers">Incluir encabezados</Label>
            </div>
          </CardContent>
        </Card>

        {/* Filtros de Fecha */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Exportación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="dateRange" 
                checked={filterByDateRange} 
                onCheckedChange={(checked) => setFilterByDateRange(checked === true)} 
              />
              <Label htmlFor="dateRange">Filtrar por rango de fechas</Label>
            </div>

            {filterByDateRange && (
              <>
                <div className="space-y-2">
                  <Label>Fecha de inicio</Label>
                  <Input 
                    type="date" 
                    value={startDate} 
                    onChange={(e) => setStartDate(e.target.value)} 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Fecha de fin</Label>
                  <Input 
                    type="date" 
                    value={endDate} 
                    onChange={(e) => setEndDate(e.target.value)} 
                  />
                </div>
              </>
            )}

            <Separator />
            
            <div className="space-y-2">
              <Label>Estadísticas del filtro</Label>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Total de transacciones: {transactions.length}</p>
                <p>• Transacciones a exportar: {filteredTransactionsCount}</p>
                <p>• Campos seleccionados: {enabledFieldsCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Selección de Campos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Table className="h-5 w-5" />
            Campos a Exportar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {fields.map((field, index) => (
              <div key={field.key} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-muted/50">
                <Checkbox 
                  id={`field-${index}`}
                  checked={field.enabled} 
                  onCheckedChange={() => toggleField(index)} 
                />
                <div className="flex-1 min-w-0">
                  <Label htmlFor={`field-${index}`} className="font-medium cursor-pointer">
                    {field.label}
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{field.description}</p>
                  {field.formula && (
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        <Calculator className="h-3 w-3 mr-1" />
                        {field.formula}
                      </Badge>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        onClick={() => removeCustomField(index)}
                      >
                        ×
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fórmulas Personalizadas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Fórmulas Personalizadas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Nombre del Campo</Label>
              <Input 
                placeholder="Ej: Monto con IVA" 
                value={formulaName}
                onChange={(e) => setFormulaName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Fórmula</Label>
              <Input 
                placeholder="Ej: {amount} * 1.21" 
                value={customFormula}
                onChange={(e) => setCustomFormula(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Variables disponibles:</Label>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{'{amount}'} - Monto</Badge>
              <Badge variant="outline">{'{type}'} - Tipo (1=ingreso, -1=gasto)</Badge>
              <Badge variant="outline">{'{category_count}'} - Longitud categoría</Badge>
            </div>
          </div>
          
          <Button onClick={addCustomFormula} className="w-full">
            <Calculator className="h-4 w-4 mr-2" />
            Agregar Fórmula
          </Button>
        </CardContent>
      </Card>

      {/* Acciones */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button 
          onClick={exportData} 
          disabled={isExporting || enabledFieldsCount === 0 || filteredTransactionsCount === 0}
          className="min-w-[120px]"
        >
          {isExporting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Exportando...
            </div>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </>
          )}
        </Button>
      </div>
    </div>
  );
}