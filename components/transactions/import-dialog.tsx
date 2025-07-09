'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  X,
  Eye,
  Download,
  FileSpreadsheet,
  Code,
  AlertTriangle,
  Info,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

interface ImportDialogProps {
  onImportComplete: () => void;
  onClose: () => void;
}

interface ParsedTransaction {
  type: 'income' | 'expense';
  amount: number;
  description: string;
  category: string;
  account_name: string;
  date: string;
  tags?: string[];
  recurring?: boolean;
  errors?: string[];
  warnings?: string[];
}

interface ImportResult {
  success: number;
  errors: number;
  warnings: number;
  total: number;
  transactions: ParsedTransaction[];
}

export function ImportDialog({ onImportComplete, onClose }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [importFormat, setImportFormat] = useState<'csv' | 'json' | 'excel'>('csv');
  const [separator, setSeparator] = useState(',');
  const [hasHeaders, setHasHeaders] = useState(true);
  const [encoding, setEncoding] = useState('UTF-8');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [previewData, setPreviewData] = useState<ParsedTransaction[]>([]);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [step, setStep] = useState<'upload' | 'preview' | 'result'>('upload');
  const [fieldMapping, setFieldMapping] = useState<{[key: string]: string}>({
    date: '',
    type: '',
    amount: '',
    description: '',
    category: '',
    account_name: ''
  });
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setFileContent(content);
      
      if (importFormat === 'csv') {
        parseCSVHeaders(content);
      }
    };
    
    reader.readAsText(selectedFile, encoding);
  };

  const parseCSVHeaders = (content: string) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) return;
    
    const firstLine = lines[0];
    if (!firstLine) return;
    
    const headers = firstLine.split(separator).map(h => h.trim().replace(/"/g, ''));
    setAvailableColumns(headers);
    
    // Auto-mapear campos comunes
    const autoMapping: {[key: string]: string} = {};
    headers.forEach(header => {
      const lowerHeader = header.toLowerCase();
      if (lowerHeader.includes('fecha') || lowerHeader.includes('date')) {
        autoMapping.date = header;
      } else if (lowerHeader.includes('tipo') || lowerHeader.includes('type')) {
        autoMapping.type = header;
      } else if (lowerHeader.includes('monto') || lowerHeader.includes('amount') || lowerHeader.includes('valor')) {
        autoMapping.amount = header;
      } else if (lowerHeader.includes('descripcion') || lowerHeader.includes('description') || lowerHeader.includes('concepto')) {
        autoMapping.description = header;
      } else if (lowerHeader.includes('categoria') || lowerHeader.includes('category')) {
        autoMapping.category = header;
      } else if (lowerHeader.includes('cuenta') || lowerHeader.includes('account')) {
        autoMapping.account_name = header;
      }
    });
    
    setFieldMapping(prev => ({ ...prev, ...autoMapping }));
  };

  const validateAndParseData = (): ParsedTransaction[] => {
    if (!fileContent) return [];
    
    try {
      let data: any[] = [];
      
      if (importFormat === 'json') {
        const jsonData = JSON.parse(fileContent);
        data = Array.isArray(jsonData) ? jsonData : jsonData.data || [];
      } else if (importFormat === 'csv') {
        const lines = fileContent.split('\n').filter(line => line.trim());
        const startIndex = hasHeaders ? 1 : 0;
        
        data = lines.slice(startIndex).map(line => {
          const values = line.split(separator).map(v => v.trim().replace(/"/g, ''));
          const obj: any = {};
          
          Object.entries(fieldMapping).forEach(([field, column]) => {
            if (column) {
              const columnIndex = availableColumns.indexOf(column);
              if (columnIndex !== -1 && values[columnIndex] !== undefined) {
                obj[field] = values[columnIndex];
              }
            }
          });
          
          return obj;
        });
      }
      
      return data.map((item, index) => {
        const transaction: ParsedTransaction = {
          type: 'expense',
          amount: 0,
          description: '',
          category: 'Otros',
          account_name: 'Principal',
          date: new Date().toISOString(),
          errors: [],
          warnings: []
        };
        
        // Validar y convertir tipo
        if (item.type) {
          const typeValue = item.type.toLowerCase();
          if (typeValue.includes('ingreso') || typeValue.includes('income') || typeValue === '+' || typeValue === '1') {
            transaction.type = 'income';
          } else if (typeValue.includes('gasto') || typeValue.includes('expense') || typeValue === '-' || typeValue === '0') {
            transaction.type = 'expense';
          } else {
            transaction.errors?.push(`Tipo no reconocido: ${item.type}`);
          }
        } else {
          transaction.warnings?.push('Tipo no especificado, asumiendo gasto');
        }
        
        // Validar y convertir monto
        if (item.amount) {
          const amountStr = String(item.amount).replace(/[$,\s]/g, '');
          const amount = parseFloat(amountStr);
          if (isNaN(amount) || amount < 0) {
            transaction.errors?.push(`Monto inválido: ${item.amount}`);
          } else {
            transaction.amount = amount;
          }
        } else {
          transaction.errors?.push('Monto requerido');
        }
        
        // Validar descripción
        if (item.description) {
          transaction.description = String(item.description).trim();
          if (transaction.description.length > 200) {
            transaction.warnings?.push('Descripción muy larga, será truncada');
            transaction.description = transaction.description.substring(0, 200);
          }
        } else {
          transaction.errors?.push('Descripción requerida');
        }
        
        // Validar fecha
        if (item.date) {
          try {
            const date = new Date(item.date);
            if (isNaN(date.getTime())) {
              transaction.errors?.push(`Fecha inválida: ${item.date}`);
            } else {
              transaction.date = date.toISOString();
            }
          } catch {
            transaction.errors?.push(`Error al procesar fecha: ${item.date}`);
          }
        } else {
          transaction.warnings?.push('Fecha no especificada, usando fecha actual');
        }
        
        // Asignar otros campos
        if (item.category) {
          transaction.category = String(item.category).trim();
        }
        
        if (item.account_name) {
          transaction.account_name = String(item.account_name).trim();
        }
        
        if (item.tags) {
          if (typeof item.tags === 'string') {
            transaction.tags = item.tags.split(';').map((tag: string) => tag.trim()).filter(Boolean);
          } else if (Array.isArray(item.tags)) {
            transaction.tags = item.tags.map((tag: any) => String(tag).trim()).filter(Boolean);
          }
        }
        
        if (item.recurring !== undefined) {
          transaction.recurring = Boolean(item.recurring);
        }
        
        return transaction;
      });
    } catch (error) {
      toast.error('Error al procesar el archivo');
      return [];
    }
  };

  const processFile = async () => {
    if (!file || !fileContent) {
      toast.error('Por favor selecciona un archivo');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const parsedData = validateAndParseData();
      setPreviewData(parsedData);
      setStep('preview');
    } catch (error) {
      toast.error('Error al procesar el archivo');
    } finally {
      setIsProcessing(false);
    }
  };

  const importTransactions = async () => {
    setIsImporting(true);
    
    try {
      const validTransactions = previewData.filter(t => !t.errors || t.errors.length === 0);
      
      if (validTransactions.length === 0) {
        toast.error('No hay transacciones válidas para importar');
        return;
      }
      
      const response = await fetch('/api/transactions/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transactions: validTransactions }),
      });
      
      if (response.ok) {
        const result = await response.json();
        setImportResult({
          success: result.imported || validTransactions.length,
          errors: previewData.filter(t => t.errors && t.errors.length > 0).length,
          warnings: previewData.filter(t => t.warnings && t.warnings.length > 0).length,
          total: previewData.length,
          transactions: previewData
        });
        setStep('result');
        toast.success(`${result.imported || validTransactions.length} transacciones importadas exitosamente`);
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al importar las transacciones');
      }
    } catch (error) {
      console.error('Error importing transactions:', error);
      toast.error('Error al importar las transacciones');
    } finally {
      setIsImporting(false);
    }
  };

  const resetImport = () => {
    setFile(null);
    setFileContent('');
    setPreviewData([]);
    setImportResult(null);
    setStep('upload');
    setFieldMapping({
      date: '',
      type: '',
      amount: '',
      description: '',
      category: '',
      account_name: ''
    });
    setAvailableColumns([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStepProgress = () => {
    switch (step) {
      case 'upload': return 33;
      case 'preview': return 66;
      case 'result': return 100;
      default: return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span>Progreso de Importación</span>
          <span>{getStepProgress()}%</span>
        </div>
        <Progress value={getStepProgress()} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span className={step === 'upload' ? 'text-primary font-medium' : ''}>1. Cargar Archivo</span>
          <span className={step === 'preview' ? 'text-primary font-medium' : ''}>2. Vista Previa</span>
          <span className={step === 'result' ? 'text-primary font-medium' : ''}>3. Resultado</span>
        </div>
      </div>

      {step === 'upload' && (
        <>
          {/* Configuración de Formato */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Configuración de Importación
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Formato del Archivo</Label>
                <Select value={importFormat} onValueChange={(value: 'csv' | 'json' | 'excel') => setImportFormat(value)}>
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
                    <SelectItem value="json">
                      <div className="flex items-center gap-2">
                        <Code className="h-4 w-4" />
                        JSON (Datos estructurados)
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {importFormat === 'csv' && (
                <>
                  <div className="grid grid-cols-2 gap-4">
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
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="headers" 
                      checked={hasHeaders} 
                      onCheckedChange={(checked) => setHasHeaders(checked === true)} 
                    />
                    <Label htmlFor="headers">El archivo tiene encabezados</Label>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Selección de Archivo */}
          <Card>
            <CardHeader>
              <CardTitle>Seleccionar Archivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <div className="space-y-2">
                    <p className="text-lg font-medium">Arrastra tu archivo aquí o haz clic para seleccionar</p>
                    <p className="text-sm text-muted-foreground">
                      Formatos soportados: CSV, JSON (máximo 10MB)
                    </p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv,.json,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Seleccionar Archivo
                  </Button>
                </div>
                
                {file && (
                  <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium">{file.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB • {importFormat.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => {
                        setFile(null);
                        setFileContent('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Mapeo de Campos (solo para CSV) */}
          {importFormat === 'csv' && availableColumns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Mapeo de Campos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(fieldMapping).map(([field, value]) => (
                    <div key={field} className="space-y-2">
                      <Label className="capitalize">
                        {field.replace('_', ' ')}
                        {['date', 'amount', 'description'].includes(field) && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </Label>
                      <Select 
                        value={value} 
                        onValueChange={(newValue) => 
                          setFieldMapping(prev => ({ ...prev, [field]: newValue }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar columna" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">No mapear</SelectItem>
                          {availableColumns.map(column => (
                            <SelectItem key={column} value={column}>{column}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-900 dark:text-blue-100">Campos requeridos:</p>
                      <p className="text-blue-700 dark:text-blue-200">Fecha, Monto y Descripción son obligatorios para importar las transacciones.</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={processFile} 
              disabled={!file || isProcessing || (importFormat === 'csv' && (!fieldMapping.date || !fieldMapping.amount || !fieldMapping.description))}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Procesando...
                </div>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Previa
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          {/* Resumen de Vista Previa */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Vista Previa de Importación
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{previewData.length}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
                <div className="text-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-2xl font-bold text-green-600">
                    {previewData.filter(t => !t.errors || t.errors.length === 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Válidas</p>
                </div>
                <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {previewData.filter(t => t.warnings && t.warnings.length > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {previewData.filter(t => t.errors && t.errors.length > 0).length}
                  </p>
                  <p className="text-sm text-muted-foreground">Errores</p>
                </div>
              </div>
              
              <div className="max-h-96 overflow-y-auto space-y-2">
                {previewData.slice(0, 10).map((transaction, index) => (
                  <div key={index} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={transaction.type === 'income' ? 'default' : 'secondary'}>
                          {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                        </Badge>
                        <span className="font-medium">${transaction.amount.toLocaleString()}</span>
                        <span className="text-muted-foreground">•</span>
                        <span>{transaction.description}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {transaction.errors && transaction.errors.length > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            {transaction.errors.length} errores
                          </Badge>
                        )}
                        {transaction.warnings && transaction.warnings.length > 0 && (
                          <Badge variant="outline" className="text-xs text-yellow-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {transaction.warnings.length} advertencias
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    {((transaction.errors && transaction.errors.length > 0) || (transaction.warnings && transaction.warnings.length > 0)) && (
                      <div className="space-y-1">
                        {transaction.errors?.map((error, errorIndex) => (
                          <p key={errorIndex} className="text-xs text-red-600 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {error}
                          </p>
                        ))}
                        {transaction.warnings?.map((warning, warningIndex) => (
                          <p key={warningIndex} className="text-xs text-yellow-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {warning}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                {previewData.length > 10 && (
                  <p className="text-center text-sm text-muted-foreground py-2">
                    ... y {previewData.length - 10} transacciones más
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep('upload')}>
              Volver
            </Button>
            <Button 
              onClick={importTransactions} 
              disabled={isImporting || previewData.filter(t => !t.errors || t.errors.length === 0).length === 0}
            >
              {isImporting ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Importando...
                </div>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Importar {previewData.filter(t => !t.errors || t.errors.length === 0).length} Transacciones
                </>
              )}
            </Button>
          </div>
        </>
      )}

      {step === 'result' && importResult && (
        <>
          {/* Resultado de Importación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Importación Completada
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                  <p className="text-3xl font-bold text-green-600">{importResult.success}</p>
                  <p className="text-sm text-muted-foreground">Importadas</p>
                </div>
                <div className="text-center p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                  <p className="text-3xl font-bold text-red-600">{importResult.errors}</p>
                  <p className="text-sm text-muted-foreground">Errores</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-950 rounded-lg">
                  <p className="text-3xl font-bold text-yellow-600">{importResult.warnings}</p>
                  <p className="text-sm text-muted-foreground">Advertencias</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <p className="text-3xl font-bold text-blue-600">{importResult.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Resumen de la importación</h4>
                  <Badge variant="outline">
                    {((importResult.success / importResult.total) * 100).toFixed(1)}% éxito
                  </Badge>
                </div>
                
                <Progress 
                  value={(importResult.success / importResult.total) * 100} 
                  className="h-3"
                />
                
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>• {importResult.success} transacciones se importaron correctamente</p>
                  {importResult.errors > 0 && (
                    <p>• {importResult.errors} transacciones tuvieron errores y no se importaron</p>
                  )}
                  {importResult.warnings > 0 && (
                    <p>• {importResult.warnings} transacciones tuvieron advertencias pero se importaron</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-between">
            <Button variant="outline" onClick={resetImport}>
              <Upload className="h-4 w-4 mr-2" />
              Nueva Importación
            </Button>
            <Button onClick={() => {
              onImportComplete();
              onClose();
            }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar
            </Button>
          </div>
        </>
      )}
    </div>
  );
}