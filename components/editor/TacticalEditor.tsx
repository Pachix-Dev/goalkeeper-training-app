"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tldraw, type Editor, type TLShape } from '@tldraw/tldraw';
import { useLocale } from 'next-intl';
import '@tldraw/tldraw/tldraw.css';
import { useTranslations } from 'next-intl';
import {
  GoalkeeperShapeUtil,
  BallShapeUtil,
  FieldBackgroundShapeUtil
} from './shapes';

// Elementos deportivos con shapes SVG personalizadas
interface PaletteItem {
  id: string;
  labelKey: string;
  type: 'custom' | 'geo' | 'text';
  customType?: string;
  props?: Record<string, string | number>;
  geo?: {
    w: number;
    h: number;
    fill?: string;
    dash?: 'draw' | 'solid';
    geo?: 'rectangle' | 'circle';
  };
  text?: string;
}

const PALETTE: PaletteItem[] = [
  { id: 'goalkeeper', labelKey: 'Portero', type: 'custom', customType: 'goalkeeper', props: { w: 40, h: 40, rotation: 0, color: 'default' } },
  { id: 'ball', labelKey: 'Balon', type: 'custom', customType: 'ball', props: { w: 30, h: 30 } },
  
];

type FieldView = {
  id: string;
  label: string;
  type: 'color' | 'image';
  color?: string;
  image?: string;
};

const FIELD_IMAGE_WIDTH = 1300;
const FIELD_IMAGE_HEIGHT = 659;

// Vistas de cancha con imagenes en /public/canchas
const FIELD_VIEWS: FieldView[] = [
  { id: 'corner-1', label: 'Corner 1', type: 'image', image: '/canchas/Corner1.jpg' },
  { id: 'corner-2', label: 'Corner 2', type: 'image', image: '/canchas/Corner2.jpg' },
  { id: 'frontal-1', label: 'Frontal 1', type: 'image', image: '/canchas/Frontal1.jpg' },
  { id: 'frontal-2', label: 'Frontal 2', type: 'image', image: '/canchas/Frontal2.jpg' },
  { id: 'lateral-area-grande-1', label: 'Lateral area grande 1', type: 'image', image: '/canchas/LateralAreaGrande1.jpg' },
  { id: 'lateral-area-grande-2', label: 'Lateral area grande 2', type: 'image', image: '/canchas/LateralAreaGrande2.jpg' },
  { id: 'lateral-area-grande-3', label: 'Lateral area grande 3', type: 'image', image: '/canchas/LateralAreaGrande3.jpg' },
  { id: 'lateral-area-grande-4', label: 'Lateral area grande 4', type: 'image', image: '/canchas/LateralAreaGrande4.jpg' },
  { id: 'lateral-area-grande-5', label: 'Lateral area grande 5', type: 'image', image: '/canchas/LateralAreaGrande5.jpg' },
  { id: 'lateral-medio-campo', label: 'Lateral medio campo', type: 'image', image: '/canchas/LateralMedioCampo.jpg' },
  { id: 'medio-campo-frontal', label    : 'Medio campo frontal', type: 'image', image: '/canchas/MedioCampoFrontal.jpg' },
  { id: 'trasera-area-grande-1', label: 'Trasera area grande 1', type: 'image', image: '/canchas/TraseraAreaGrande.jpg' },
  { id: 'trasera-area-grande-2', label: 'Trasera area grande 2', type: 'image', image: '/canchas/TraseraAreaGrande2.jpg' },
  { id: 'zona-neutra-1', label: 'Zona neutra 1', type: 'image', image: '/canchas/ZonaNeutra1.jpg' },
  { id: 'zona-neutra-2', label: 'Zona neutra 2', type: 'image', image: '/canchas/ZonaNeutra2.jpg' },  
];

interface TacticalEditorProps {
  mode?: string;
  designId?: number;
  onDesignSaved?: (designId: number) => void;
}

export default function TacticalEditor({ designId, onDesignSaved }: TacticalEditorProps = {}) {
  const t = useTranslations();
  const locale = useLocale();
  const [fieldView, setFieldView] = useState<FieldView>(FIELD_VIEWS[0]);
  interface SavedDesign { id: number; title: string; locale?: string; updated_at: string; }
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);
  const [preferredcolor, setPreferredcolor] = useState<string>('default');
  const [currentDesignId, setCurrentDesignId] = useState<number | undefined>(designId);

  // Sincronizar currentDesignId con prop designId cuando cambia
  useEffect(() => {
    setCurrentDesignId(designId);
  }, [designId]);

  const handleViewChange = (view: FieldView) => setFieldView(view);

  const fetchDesigns = useCallback(async () => {
    setLoadingDesigns(true);
    try {
      const res = await fetch('/api/editor/designs', { headers: authHeaders() });
      if (res.ok) {
        const json = await res.json();
        setDesigns(json.designs || []);
      }
    } finally { setLoadingDesigns(false); }
  }, []);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  // Cargar diseño si se pasa designId, o limpiar si no hay
  useEffect(() => {
    if (!editor) return;
    
    if (currentDesignId) {
      // Si hay designId, cargar el diseño
      loadDesign(currentDesignId);
    } else {
      // Si NO hay designId, limpiar el editor (nueva tarea)
      const shapes = editor.getCurrentPageShapes();
      const nonBackgroundShapes = shapes.filter((s) => s.type !== 'field-background');
      if (nonBackgroundShapes.length > 0) {
        editor.deleteShapes(nonBackgroundShapes.map(s => s.id));
      }
      // Resetear título
      setTitle('');
    }
  }, [editor, currentDesignId]);

  // Crear o reemplazar el fondo cuando cambia la vista
  useEffect(() => {
    if (!editor) return;
    
    const viewport = editor.getViewportPageBounds();
    
    // El fondo debe llenar completamente el viewport con la misma proporcion de las imagenes
    const w = viewport.width;
    const h = viewport.height;        
    
    // Buscar y eliminar cualquier fondo existente
    const shapes = editor.getCurrentPageShapes();
    const existingBackgrounds = shapes.filter((s) => s.type === 'field-background');
    
    if (existingBackgrounds.length > 0) {
      editor.deleteShapes(existingBackgrounds.map(s => s.id));
    }
    
    // Crear el nuevo fondo centrado en el viewport
    editor.createShape({
      type: 'field-background',
      x: 0,
      y: 0,
      isLocked: true,
      props: {
        w,
        h,
        backgroundType: fieldView.type,
        backgroundColor: fieldView.color || '',
        backgroundImage: fieldView.image || '',
      },
    });
    
    // Enviar el fondo al final (atrás de todo)
    // Esperar un momento para que el shape esté completamente creado
    setTimeout(() => {
      const allShapes = editor.getCurrentPageShapes();
      const newBackground = allShapes.find((s) => s.type === 'field-background');
      
      if (newBackground) {
        // Primero mover todos los otros shapes al frente
        const otherShapes = allShapes.filter((s) => s.type !== 'field-background');
        if (otherShapes.length > 0) {
          editor.bringToFront(otherShapes.map(s => s.id));
        }
      }
    }, 50);
    
    // Centrar la cámara en el fondo
    editor.setCamera({ x: 0, y: 0, z: 1 }, { animation: { duration: 300 } });
  }, [editor, fieldView]);

  const saveDesign = async () => {
    if (!title || !editor) return;
    setSaving(true);
    try {
      const snapshot = editor.getSnapshot();
      
      // Generar imagen PNG del canvas
      const ids = [...editor.getCurrentPageShapeIds()];
      const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
      
      // Exportar a PNG
      const { blob } = await editor.toImage(ids, {
        format: 'png',
        background: true,
        padding: 0,
        pixelRatio
      });
      
      // Convertir blob a base64
      const imageDataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      
      // Si existe currentDesignId, actualizar; si no, crear nuevo
      const isUpdate = !!currentDesignId;
      const url = isUpdate 
        ? `/api/editor/designs/${currentDesignId}` 
        : '/api/editor/designs';
      const method = isUpdate ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title, data: snapshot, locale, imageDataUrl })
      });
      
      if (res.ok) {
        const json = await res.json();
        const designId = json.design?.id || currentDesignId;
        
        if (!isUpdate) {
          setCurrentDesignId(designId);
        }
        
        setTitle('');
        fetchDesigns();
        
        // Si hay callback para regresar con el design_id
        if (onDesignSaved && designId) {
          onDesignSaved(designId);
        }
      }
    } finally { setSaving(false); }
  };

  const loadDesign = async (id: number) => {
    if (!editor) return;
    const res = await fetch(`/api/editor/designs/${id}`, { headers: authHeaders() });
    if (res.ok) {
      const json = await res.json();
      const snapshot = json.design.data;
      editor.loadSnapshot(snapshot);
    }
  };

  const deleteDesign = async (id: number) => {
    const res = await fetch(`/api/editor/designs/${id}`, { method: 'DELETE', headers: authHeaders() });
    if (res.ok) fetchDesigns();
  };

  // Configurar shapes personalizadas
  const customShapeUtils = useMemo(() => [
    FieldBackgroundShapeUtil,
    GoalkeeperShapeUtil,
    BallShapeUtil
  ], []);

  return (
    <div className="flex flex-col gap-4 h-[calc(100vh-120px)]">
      <div className="bg-white border rounded-xl shadow-sm p-4 flex  gap-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-[220px]">
              <p className="text-lg font-semibold text-gray-900">{t('editor.title')}</p>
              <p className="text-sm text-gray-500">{t('editor.subtitle')}</p>
            </div>
           </div>  
           <div className="flex flex-1 flex-row justify-center md:items-center gap-2">
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder={t('editor.titlePlaceholder')}
              className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full md:max-w-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              disabled={!title || saving}
              onClick={saveDesign}
              className="px-4 py-2 text-sm font-semibold rounded-lg bg-blue-600 text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:bg-blue-700 transition-colors"
            >
              {saving ? t('editor.saving') : currentDesignId ? t('editor.update') : t('editor.save')}
            </button>
          </div>   
          <ExportPanel editor={editor} variant="inline" />                    
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-4 flex-1 min-h-0">
        <div className="bg-white border rounded-xl shadow-sm flex flex-col min-h-0">
          
          <div className="flex-1 min-h-0">
            <div className="h-full w-full rounded-b-lg overflow-hidden ">
              <Tldraw
                autoFocus
                persistenceKey="tactical-editor-v4"
                shapeUtils={customShapeUtils}
                onMount={setEditor}                            
              />
            </div>
          </div>        
        </div>

        <div className="flex flex-col gap-4 min-h-0">
          <RightPanel 
            onChangeView={handleViewChange} 
            editor={editor} 
            currentView={fieldView}
            preferredcolor={preferredcolor}
            setPreferredcolor={setPreferredcolor}
          />
          <div className="bg-white border rounded-xl shadow-sm p-4 min-h-0 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-gray-800">{t('editor.myDesigns')}</p>
              <button
                onClick={fetchDesigns}
                className="text-xs px-3 py-1 rounded-full border border-gray-200 hover:border-blue-300 hover:text-blue-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
              </button>
            </div>
            <div className="space-y-2 overflow-y-auto min-h-0 max-h-[280px] pr-1">
              {loadingDesigns && <p className="text-xs text-gray-500">{t('common.loading')}</p>}
              {!loadingDesigns && designs.length === 0 && (
                <p className="text-xs text-gray-500">No hay disenos</p>
              )}
              {designs.map(d => (
                <div
                  key={d.id}
                  className="flex items-center justify-between text-xs border rounded-lg px-3 py-2 hover:border-blue-300 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-gray-800 truncate max-w-[180px]" title={d.title}>{d.title}</p>
                    <p className="text-[11px] text-gray-500">{new Date(d.updated_at).toLocaleDateString(locale)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => loadDesign(d.id)} className="px-2 py-1 bg-green-600 text-white rounded text-[11px] hover:bg-green-700">{t('editor.load')}</button>
                    {/*<button onClick={() => deleteDesign(d.id)} className="px-2 py-1 bg-red-600 text-white rounded text-[11px] hover:bg-red-700">{t('editor.delete')}</button>*/}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ExportPanel({ editor, variant = 'stacked' }: { editor: Editor | null; variant?: 'inline' | 'stacked' }) {
  const t = useTranslations();
  const isInline = variant === 'inline';

  const exportPNG = async () => {
    try {
      if (!editor) return;
      const ids = [...editor.getCurrentPageShapeIds()];
      const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

      const { blob } = await editor.toImage(ids, {
        format: 'png',
        background: true,
        padding: 0,
        pixelRatio
      });

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'entrenamiento.png';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error('PNG export failed:', e);
      alert('Error al exportar PNG');
    }
  };

  const exportJSON = () => {
    if (!editor) return;
    const store = editor.store.serialize();
    const json = JSON.stringify(store, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'entrenamiento.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const clear = () => {
    if (!editor) return;
    const shapes = editor.getCurrentPageShapes();
    const shapesToDelete = shapes.filter(s => s.type !== 'field-background');
    if (shapesToDelete.length > 0) {
      editor.deleteShapes(shapesToDelete.map(s => s.id));
    }
  };

  return (
    <div className={isInline ? "flex items-center gap-2" : "p-3 border-t space-y-2"}>
      {!isInline && <h3 className="text-xs font-semibold text-gray-600 uppercase">Export</h3>}
      <button
        onClick={exportPNG}
        className={`${isInline ? 'inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-colors' : 'w-full text-xs px-2 py-2 bg-blue-600 text-white rounded hover:bg-blue-500'}`}
      >
        {t('editor.exportPng')}
      </button>
      {/*<button
        onClick={exportJSON}
        className={`${isInline ? 'inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-emerald-600 text-white shadow-sm hover:bg-emerald-700 transition-colors' : 'w-full text-xs px-2 py-2 bg-green-600 text-white rounded hover:bg-green-500'}`}
      >
        {t('editor.exportJson')}
      </button>*/}
      <button
        onClick={clear}
        className={`${isInline ? 'inline-flex items-center gap-1 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600 text-white shadow-sm hover:bg-red-700 transition-colors' : 'w-full text-xs px-2 py-2 bg-red-600 text-white rounded hover:bg-red-500'}`}
      >
        {t('editor.clearCanvas')}
      </button>
    </div>
  );
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function RightPanel({ 
  onChangeView, 
  editor, 
  currentView,
  preferredcolor,
  setPreferredcolor
}: { 
  onChangeView: (view: FieldView) => void; 
  editor: Editor | null; 
  currentView: FieldView;
  preferredcolor: string;
  setPreferredcolor: (color: string) => void;
}) {
  const t = useTranslations();
  const [active, setActive] = useState<'elements' | 'views' | 'props'>('elements');

  const addItem = useCallback((item: PaletteItem) => {
    if (!editor) return;
    const baseX = Math.random() * 200 - (-100);
    const baseY = Math.random() * 200 - (-100);

    if (item.type === 'geo' && item.geo) {
      const shape = {
        type: 'geo',
        x: baseX,
        y: baseY,
        props: {
          w: item.geo.w,
          h: item.geo.h,
          fill: item.geo.fill || '#CCCCCC',
          dash: item.geo.dash || 'draw',
          geo: item.geo.geo || 'rectangle'
        }
      };
      (editor as unknown as { createShape: (s: typeof shape) => void }).createShape(shape);
    } else if (item.type === 'text') {
      const shape = {
        type: 'text',
        x: baseX,
        y: baseY,
        props: {
          text: item.text || 'Text',
          size: 'm'
        }
      };
      (editor as unknown as { createShape: (s: typeof shape) => void }).createShape(shape);
    } else if (item.type === 'custom' && item.customType && item.props) {
      const props = item.customType === 'goalkeeper' 
        ? { ...item.props, color: preferredcolor }
        : item.props;
      const shape = {
        type: item.customType,
        x: baseX,
        y: baseY,
        props
      };
      (editor as unknown as { createShape: (s: typeof shape) => void }).createShape(shape);
    }
  }, [editor, preferredcolor]);

  const tabs = [
    { id: 'elements' as const, label: t('editor.elements') },
    { id: 'props' as const, label: t('editor.properties') },
    { id: 'views' as const, label: t('editor.fieldView') },
    
  ];

  return (
    <div className="bg-white border rounded-xl shadow-sm flex flex-col min-h-0 text-black">
      <div className="flex text-xs border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={`flex-1 px-3 py-2 transition-colors ${
              active === tab.id
                ? 'bg-blue-50 text-blue-700 font-semibold border-b-2 border-blue-600'
                : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
        {active === 'elements' && (
          <div className="space-y-2">
            {PALETTE.map(item => (
              <button
                key={item.id}
                onClick={() => addItem(item)}
                className="w-full text-left text-black px-3 py-3 text-sm rounded-lg border hover:border-blue-300 hover:bg-blue-50 transition-colors flex justify-between items-center"
              >
                <span>{item.labelKey}</span>
                <span className="text-xs text-gray-400">+</span>
              </button>
            ))}
          </div>
        )}
        {active === 'views' && (
          <div className="space-y-2">
            {FIELD_VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => onChangeView(v)}
                className={`w-full text-left rounded-lg border text-sm overflow-hidden transition-colors ${v.id === currentView.id ? 'ring-2 ring-blue-500 border-blue-200' : 'hover:border-blue-200'}`}
              >
                <div
                  className="h-16 w-full"
                  style={
                    v.type === 'image'
                      ? { backgroundImage: `url(${v.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                      : { backgroundColor: v.color || '#6ba04d' }
                  }
                />
                <div className="px-3 py-2">{v.label}</div>
              </button>
            ))}
          </div>
        )}
        {active === 'props' && (
          <ShapeProperties 
            editor={editor}
            preferredcolor={preferredcolor}
            setPreferredcolor={setPreferredcolor}
          />
        )}
      </div>
      
    </div>
  );
}

function ShapeProperties({ 
  editor, 
  preferredcolor, 
  setPreferredcolor 
}: { 
  editor: Editor | null;
  preferredcolor: string;
  setPreferredcolor: (color: string) => void;
}) {
  const t = useTranslations();
  const [, forceUpdate] = useState({});
  useEffect(() => {
    if (!editor) return;
    const handleSelectionChange = () => {
      forceUpdate({});
    };
    editor.on('change', handleSelectionChange);
    return () => {
      editor.off('change', handleSelectionChange);
    };
  }, [editor]);

  const shapes = editor ? editor.getSelectedShapes() : [];
  const selectionCount = shapes.length;

  if (selectionCount === 0) {
    return <p className="text-xs text-gray-500">No hay seleccion</p>;
  }

  const first = shapes[0] as TLShape;

  const updateColor = (color: string) => {
    if (!editor) return;
    shapes.forEach(shape => {
      if (shape.type === 'geo') {
        editor.updateShape({ ...shape, props: { ...shape.props, fill: color } });
      } else if (shape.type === 'goalkeeper') {
        return;
      }
    });
  };

  const updateRotation = (deg: number) => {
    if (!editor) return;
    shapes.forEach(shape => {
      editor.updateShape({ ...shape, rotation: (deg * Math.PI) / 180 });
    });
  };

  const updateScale = (scale: number) => {
    if (!editor) return;
    shapes.forEach(shape => {
      if (shape.type === 'goalkeeper' || shape.type === 'geo') {
        const props = shape.props as unknown as { w?: number; h?: number };
        const w = props.w ?? 40;
        const h = props.h ?? 40;
        editor.updateShape({ ...shape, props: { ...shape.props, w: Math.max(10, w * scale), h: Math.max(10, h * scale) } });
      }
    });
  };

  const updatePropAll = (prop: string, value: string | number) => {
    if (!editor) return;
    shapes.forEach(shape => {
      editor.updateShape({ 
        id: shape.id,
        type: shape.type,
        props: { ...shape.props, [prop]: value }
      });
    });
    if (first.type === 'goalkeeper' && prop === 'color' && typeof value === 'string') {
      setPreferredcolor(value);
    }
  };

  return (
    <div className="space-y-3 text-xs">
      <div>
        <p className="font-semibold mb-1">{t('editor.properties')} ({selectionCount})</p>
        {first.type === 'goalkeeper' && (() => {
          const props = first.props as unknown as { rotation?: number; color?: string };
          const currentRotation = props.rotation ?? 0;
          const currentColor = props.color ?? 'default';
          return (
            <div className="space-y-2 mt-2">
              <p className="text-gray-600 font-semibold">Portero</p>
              <div>
                <p className="text-gray-500 text-[11px] mb-1">Rotacion</p>
                <div className="grid grid-cols-4 gap-1">
                  {[0, 1, 2, 3, 4, 5, 6, 7].map(rot => {
                    const isSelected = currentRotation === rot;
                    return (
                      <button
                        key={rot}
                        onClick={() => updatePropAll('rotation', rot)}
                        className={`px-2 py-1 rounded border text-xs transition-colors ${isSelected ? 'bg-blue-500 text-white border-blue-600' : 'bg-white hover:bg-gray-100 border-gray-300'}`}
                      >
                        {rot}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-[11px] mb-1">Color de uniforme</p>
                <div className="flex gap-1 flex-wrap">
                  <button
                    onClick={() => updatePropAll('color', 'default')}
                    className={`px-2 py-1 rounded border text-xs transition-colors ${
                      currentColor === 'default' 
                        ? 'bg-yellow-500 hover:bg-yellow-600 ring-2 ring-yellow-600' 
                        : 'bg-yellow-400 hover:bg-yellow-500'
                    }`}
                  >
                    Default
                  </button>
                  <button
                    onClick={() => updatePropAll('color', 'naranja')}
                    className={`px-2 py-1 rounded border text-xs text-white transition-colors ${
                      currentColor === 'naranja'
                        ? 'bg-orange-600 hover:bg-orange-700 ring-2 ring-orange-700'
                        : 'bg-orange-500 hover:bg-orange-600'
                    }`}
                  >
                    Naranja
                  </button>
                </div>
              </div>
            </div>
          );
        })()}

        {first.type !== 'goalkeeper' && (
          <div className="space-y-1">
            <p className="text-gray-600">Rotacion (deg)</p>
            <input type="range" min={0} max={360} defaultValue={0} onChange={e => updateRotation(Number(e.target.value))} />
          </div>
        )}
      </div>
    </div>
  );
}
