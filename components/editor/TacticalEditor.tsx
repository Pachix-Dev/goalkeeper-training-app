"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Tldraw, type Editor, type TLShape } from '@tldraw/tldraw';
import { useLocale } from 'next-intl';
import '@tldraw/tldraw/tldraw.css';
import { useTranslations } from 'next-intl';
import {
  GoalkeeperShapeUtil,
  ConeShapeUtil,
  BallShapeUtil,
  DummyShapeUtil,
  LadderShapeUtil,
  HoopShapeUtil,
  RebounderShapeUtil,
  GoalShapeUtil,
  HurdleShapeUtil,
  FieldBackgroundShapeUtil
} from './shapes';

// Elementos deportivos con shapes SVG personalizadas
interface PaletteItem {
  id: string;
  labelKey: string;
  type: 'custom' | 'geo' | 'text';
  customType?: string;
  props?: {
    w: number;
    h: number;
    color: string;
  };
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
  { id: 'goalkeeper', labelKey: 'Portero', type: 'custom', customType: 'goalkeeper', props: { w: 40, h: 40, color: '#FFA500' } },
  { id: 'coach', labelKey: 'Entrenador', type: 'geo', geo: { w: 42, h: 42, fill: '#3F51B5', geo: 'circle' } },
  { id: 'cone', labelKey: 'Cono', type: 'custom', customType: 'cone', props: { w: 24, h: 34, color: '#FF6B00' } },
  { id: 'ball', labelKey: 'Balon', type: 'custom', customType: 'ball', props: { w: 22, h: 22, color: '#FFFFFF' } },
  { id: 'ladder', labelKey: 'Escalera', type: 'custom', customType: 'ladder', props: { w: 120, h: 20, color: '#9C27B0' } },
  { id: 'hoop', labelKey: 'Aro', type: 'custom', customType: 'hoop', props: { w: 46, h: 46, color: '#2196F3' } },
  { id: 'dummy', labelKey: 'Muneco', type: 'custom', customType: 'dummy', props: { w: 26, h: 60, color: '#FF5722' } },
  { id: 'rebounder', labelKey: 'Reboteador', type: 'custom', customType: 'rebounder', props: { w: 80, h: 50, color: '#009688' } },
  { id: 'goal', labelKey: 'Porteria', type: 'custom', customType: 'goal', props: { w: 140, h: 60, color: '#FFFFFF' } },
  { id: 'hurdle', labelKey: 'Valla', type: 'custom', customType: 'hurdle', props: { w: 80, h: 24, color: '#FFD400' } },
  { id: 'textNote', labelKey: 'Nota', type: 'text', text: 'Nota' }
];

type FieldView = {
  id: string;
  label: string;
  type: 'color' | 'image';
  color?: string;
  image?: string;
};

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
  { id: 'medio-campo-frontal', label: 'Medio campo frontal', type: 'image', image: '/canchas/MedioCampoFrontal.jpg' },
  { id: 'trasera-area-grande-1', label: 'Trasera area grande 1', type: 'image', image: '/canchas/TraseraAreaGrande.jpg' },
  { id: 'trasera-area-grande-2', label: 'Trasera area grande 2', type: 'image', image: '/canchas/TraseraAreaGrande2.jpg' },
  { id: 'zona-neutra-1', label: 'Zona neutra 1', type: 'image', image: '/canchas/ZonaNeutra1.jpg' },
  { id: 'zona-neutra-2', label: 'Zona neutra 2', type: 'image', image: '/canchas/ZonaNeutra2.jpg' },
  { id: 'full-color', label: 'Neutral 1(color)', type: 'color', color: '#6ba04d' },
  { id: 'half-color', label: 'Neutral 2 (color)', type: 'color', color: '#7fb857' },
  { id: 'goal-area-color', label: 'Neutral 3 (color)', type: 'color', color: '#88c162' }
];

export default function TacticalEditor() {
  const t = useTranslations();
  const locale = useLocale();
  const [fieldView, setFieldView] = useState<FieldView>(FIELD_VIEWS[0]);
  interface SavedDesign { id: number; title: string; locale?: string; updated_at: string; }
  const [designs, setDesigns] = useState<SavedDesign[]>([]);
  const [loadingDesigns, setLoadingDesigns] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [editor, setEditor] = useState<Editor | null>(null);

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

  // Crear o reemplazar el fondo cuando cambia la vista
  useEffect(() => {
    if (!editor) return;
    
    const viewport = editor.getViewportPageBounds();
    
    // El fondo debe llenar completamente el viewport con aspect ratio 16:10
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
      const store = editor.store.serialize();
      const res = await fetch('/api/editor/designs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
        body: JSON.stringify({ title, data: store, locale })
      });
      if (res.ok) {
        setTitle('');
        fetchDesigns();
      }
    } finally { setSaving(false); }
  };

  const loadDesign = async (id: number) => {
    if (!editor) return;
    const res = await fetch(`/api/editor/designs/${id}`, { headers: authHeaders() });
    if (res.ok) {
      const json = await res.json();
      const data = json.design.data;
      editor.store.clear();
      (editor.store as unknown as { loadSnapshot: (s: unknown) => void }).loadSnapshot(data);
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
    ConeShapeUtil,
    BallShapeUtil,
    DummyShapeUtil,
    LadderShapeUtil,
    HoopShapeUtil,
    RebounderShapeUtil,
    GoalShapeUtil,
    HurdleShapeUtil
  ], []);

  return (
    <div className="flex h-full">
      {/* Sidebar izquierda */}
      <Palette editor={editor} />
      {/* Canvas */}
      <div className="flex-1 relative flex items-center justify-center ">
        <div 
          className="relative w-full"
          style={{
            aspectRatio: '16 / 10',
            maxHeight: '659px',
            maxWidth: '1300px',
          }}
        >
          <Tldraw
            autoFocus
            persistenceKey="tactical-editor-v1"
            shapeUtils={customShapeUtils}
            onMount={setEditor}
          />
        </div>
      </div>
      {/* Sidebar derecha */}
      <RightPanel onChangeView={handleViewChange} editor={editor} currentView={fieldView} />
      {/* Panel inferior flotante guardar/cargar */}
      <div className="absolute left-60 right-60 bottom-0 flex gap-4 px-4 text-black">
        <div className="bg-white shadow rounded px-3 py-2 flex items-center gap-2">
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={t('editor.titlePlaceholder')}
            className="border rounded px-2 py-1 text-sm w-60"
          />
          <button
            disabled={!title || saving}
            onClick={saveDesign}
            className="px-3 py-1 text-sm rounded bg-blue-600 text-white disabled:opacity-50"
          >
            {saving ? t('editor.saving') : t('editor.save')}
          </button>
        </div>
        <div className="bg-white shadow rounded px-3 py-2 w-80 max-h-52 overflow-y-auto">
          <p className="text-xs font-semibold mb-2">{t('editor.myDesigns')}</p>
          {loadingDesigns && <p className="text-xs">{t('common.loading')}</p>}
          {!loadingDesigns && designs.length === 0 && (
            <p className="text-xs text-gray-500">No hay disenos</p>
          )}
          <ul className="space-y-1">
            {designs.map(d => (
              <li key={d.id} className="flex items-center justify-between text-xs border rounded px-2 py-1">
                <span className="truncate max-w-[130px]" title={d.title}>{d.title}</span>
                <div className="flex gap-1">
                  <button onClick={() => loadDesign(d.id)} className="px-2 py-0.5 bg-green-600 text-white rounded">{t('editor.load')}</button>
                  <button onClick={() => deleteDesign(d.id)} className="px-2 py-0.5 bg-red-600 text-white rounded">{t('editor.delete')}</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function Palette({ editor }: { editor: Editor | null }) {
  const t = useTranslations();

  const addItem = useCallback((item: PaletteItem) => {
    if (!editor) return;
    // Posicionar elementos en el centro del canvas (0,0) con variación aleatoria
    const baseX = Math.random() * 200 - (-100); // Entre -100 y 100
    const baseY = Math.random() * 200 - (-100); // Entre -100 y 100

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
      const shape = {
        type: item.customType,
        x: baseX,
        y: baseY,
        props: item.props
      };
      (editor as unknown as { createShape: (s: typeof shape) => void }).createShape(shape);
    }
  }, [editor]);

  return (
    <div className="w-56 border-r bg-white flex flex-col">
      <div className="p-3 border-b">
        <h2 className="text-sm font-semibold text-gray-700">{t('editor.elements')}</h2>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {PALETTE.map(item => (
          <button
            key={item.id}
            onClick={() => addItem(item)}
            className="w-full text-left text-black px-3 py-2 text-sm rounded border hover:bg-blue-50 flex justify-between items-center"
          >
            <span>{item.labelKey}</span>
            <span className="text-xs text-gray-400">+</span>
          </button>
        ))}
      </div>
      <ExportPanel editor={editor} />
    </div>
  );
}

function ExportPanel({ editor }: { editor: Editor | null }) {
  const t = useTranslations();

  const exportPNG = async () => {
    try {
      if (!editor) return;
      const ids = [...editor.getCurrentPageShapeIds()];
      const pixelRatio = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;

      // Exportar todo el canvas incluyendo el fondo (que ahora es un shape)
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
    editor.store.clear();
  };

  return (
    <div className="p-3 border-t space-y-2">
      <h3 className="text-xs font-semibold text-gray-600 uppercase">Export</h3>
      <button onClick={exportPNG} className="w-full text-xs px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-500">{t('editor.exportPng')}</button>
      <button onClick={exportJSON} className="w-full text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-500">{t('editor.exportJson')}</button>
      <button onClick={clear} className="w-full text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-500">{t('editor.clearCanvas')}</button>
    </div>
  );
}

function authHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem('token') || sessionStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function RightPanel({ onChangeView, editor, currentView }: { onChangeView: (view: FieldView) => void; editor: Editor | null; currentView: FieldView }) {
  const t = useTranslations();
  const [active, setActive] = useState('views');
  return (
    <div className="w-60 bg-white flex flex-col text-black">
      <div className="flex text-xs">
        <button onClick={() => setActive('views')} className={`flex-1 px-2 py-2 border-b ${active==='views' ? 'bg-gray-100 font-semibold' : ''}`}>{t('editor.fieldView')}</button>
        <button onClick={() => setActive('props')} className={`flex-1 px-2 py-2 border-b ${active==='props' ? 'bg-gray-100 font-semibold' : ''}`}>{t('editor.properties')}</button>
      </div>
      <div className="p-3 h-96 overflow-scroll">
        {active === 'views' && (
          <div className="space-y-2">
            {FIELD_VIEWS.map(v => (
              <button
                key={v.id}
                onClick={() => onChangeView(v)}
                className={`w-full text-left rounded border text-sm overflow-hidden ${v.id === currentView.id ? 'ring-2 ring-blue-500' : ''}`}
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
          <ShapeProperties editor={editor} />
        )}
      </div>
    </div>
  );
}

function ShapeProperties({ editor }: { editor: Editor | null }) {
  const t = useTranslations();
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
      } else {
        editor.updateShape({ ...shape, props: { ...shape.props, color } });
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
      const props = shape.props as unknown as { w?: number; h?: number };
      const w = props.w ?? 40;
      const h = props.h ?? 40;
      editor.updateShape({ ...shape, props: { ...shape.props, w: Math.max(10, w * scale), h: Math.max(10, h * scale) } });
    });
  };

  const updatePropAll = (prop: string, value: string | number) => {
    if (!editor) return;
    shapes.forEach(shape => {
      editor.updateShape({ ...shape, props: { ...shape.props, [prop]: value } });
    });
  };

  return (
    <div className="space-y-3 text-xs">
      <div>
        <p className="font-semibold mb-1">{t('editor.properties')} ({selectionCount})</p>
        {first.type === 'geo' && (
          <div className="space-y-1">
            <p className="text-gray-600">Color</p>
            <div className="flex gap-1 flex-wrap">
              {['#FF6B00','#FFA500','#3F51B5','#2196F3','#FF5722','#009688','#9C27B0','#FFFFFF','#000000'].map(c => (
                <button key={c} onClick={() => updateColor(c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
              ))}
            </div>
          </div>
        )}
        {first.type !== 'geo' && (
          <div className="space-y-1">
            <p className="text-gray-600">Color</p>
            <div className="flex gap-1 flex-wrap">
              {['#FF6B00','#FFA500','#3F51B5','#2196F3','#FF5722','#009688','#9C27B0','#FFFFFF','#000000'].map(c => (
                <button key={c} onClick={() => updateColor(c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
              ))}
            </div>
          </div>
        )}
        <div className="space-y-1">
          <p className="text-gray-600">Rotacion (deg)</p>
          <input type="range" min={0} max={360} defaultValue={0} onChange={e => updateRotation(Number(e.target.value))} />
        </div>
        <div className="space-y-1">
          <p className="text-gray-600">Escala</p>
          <input type="range" min={50} max={200} defaultValue={100} onChange={e => updateScale(Number(e.target.value) / 100)} />
        </div>
        {/* Controles especificos por tipo */}
        {first.type === 'goal' && (
          <div className="space-y-2 mt-2">
            <p className="text-gray-600 font-semibold">Porteria</p>
            <div>
              <p className="text-gray-500 text-[11px]">Color postes</p>
              <div className="flex gap-1 flex-wrap">
                {['#FFFFFF','#FFD400','#FF6B00','#3F51B5','#2196F3','#FF5722','#009688','#9C27B0','#000000'].map(c => (
                  <button key={c} onClick={() => updatePropAll('postColor', c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-[11px]">Color red</p>
              <div className="flex gap-1 flex-wrap">
                {['#D9D9D9','#FFFFFF','#B0B0B0','#FF6B00','#3F51B5','#2196F3','#009688','#9C27B0','#000000'].map(c => (
                  <button key={c} onClick={() => updatePropAll('netColor', c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
          </div>
        )}
        {first.type === 'hoop' && (
          <div className="space-y-2 mt-2">
            <p className="text-gray-600 font-semibold">Aro</p>
            <div>
              <p className="text-gray-500 text-[11px]">Grosor del aro</p>
              <input
                type="range"
                min={2}
                max={14}
                defaultValue={(() => {
                  const p = first.props as unknown as { ringWidth?: number };
                  return p.ringWidth ?? 6;
                })()}
                onChange={e => updatePropAll('ringWidth', Number(e.target.value))}
              />
            </div>
            <div>
              <p className="text-gray-500 text-[11px]">Color aro</p>
              <div className="flex gap-1 flex-wrap">
                {['#2196F3','#FF6B00','#FFA500','#3F51B5','#FF5722','#009688','#9C27B0','#FFFFFF','#000000'].map(c => (
                  <button key={c} onClick={() => updateColor(c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
          </div>
        )}
        {first.type === 'rebounder' && (
          <div className="space-y-2 mt-2">
            <p className="text-gray-600 font-semibold">Reboteador</p>
            <div>
              <p className="text-gray-500 text-[11px]">Color marco</p>
              <div className="flex gap-1 flex-wrap">
                {['#009688','#FF6B00','#FFA500','#3F51B5','#2196F3','#FF5722','#9C27B0','#FFFFFF','#000000'].map(c => (
                  <button key={c} onClick={() => updateColor(c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
            <div>
              <p className="text-gray-500 text-[11px]">Color red</p>
              <div className="flex gap-1 flex-wrap">
                {['#CCCCCC','#FFFFFF','#B0B0B0','#FF6B00','#2196F3','#009688','#9C27B0','#000000'].map(c => (
                  <button key={c} onClick={() => updatePropAll('netColor', c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
          </div>
        )}
        {first.type === 'hurdle' && (
          <div className="space-y-2 mt-2">
            <p className="text-gray-600 font-semibold">Valla</p>
            <div>
              <p className="text-gray-500 text-[11px]">Color</p>
              <div className="flex gap-1 flex-wrap">
                {['#FFD400','#FF6B00','#FFA500','#3F51B5','#2196F3','#FF5722','#009688','#9C27B0','#FFFFFF','#000000'].map(c => (
                  <button key={c} onClick={() => updateColor(c)} style={{ backgroundColor: c }} className="w-6 h-6 rounded border" />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
