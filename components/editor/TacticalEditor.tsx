'use client';

import { useCallback, useEffect, useState, useRef } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import {
  Tldraw,
  Editor,
  createShapeId,
  track,
  TLCameraOptions,
  getSnapshot,
  loadSnapshot,
  TLEditorSnapshot,
  Box,
} from '@tldraw/tldraw';
import '@tldraw/tldraw/tldraw.css';
import Image from 'next/image';
import {
  GoalkeeperShapeUtil,
  BallShapeUtil,
  FieldBackgroundShapeUtil,
} from './shapes';
import { authenticatedFetch } from '@/lib/utils/api';
import './tactical-editor.css';

// Tipos
interface TacticalEditorProps {
  designId?: number;
  taskId?: number;
  onDesignSaved?: (designId: number) => void;
}

interface FieldView {
  id: string;
  label: string;
  type: 'color' | 'image';
  color?: string;
  image?: string;
}

// Vistas de cancha con imágenes en /public/canchas
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
];

// Colores de uniforme disponibles para el portero
const GOALKEEPER_COLORS = [
  { id: 'default', label: 'Verde', preview: '#22c55e' },
  { id: 'naranja', label: 'Naranja', preview: '#f97316' },
];

// Rotaciones disponibles (0-7 representan 8 direcciones)
const GOALKEEPER_ROTATIONS = [
  { id: 0, label: '↑', angle: 0 },
  { id: 1, label: '↗', angle: 45 },
  { id: 2, label: '→', angle: 90 },
  { id: 3, label: '↘', angle: 135 },
  { id: 4, label: '↓', angle: 180 },
  { id: 5, label: '↙', angle: 225 },
  { id: 6, label: '←', angle: 270 },
  { id: 7, label: '↖', angle: 315 },
];

// Constantes del canvas
const CANVAS_WIDTH = 1300;
const CANVAS_HEIGHT = 659;
const BACKGROUND_SHAPE_ID = createShapeId('field-background');

// Configuración de cámara para el editor
const CAMERA_OPTIONS: Partial<TLCameraOptions> = {
  isLocked: false,
  constraints: {
    initialZoom: 'fit-max',
    baseZoom: 'fit-max',
    bounds: {
      x: 0,
      y: 0,
      w: CANVAS_WIDTH,
      h: CANVAS_HEIGHT,
    },
    behavior: 'contain',
    padding: { x: 32, y: 32 },
    origin: { x: 0.5, y: 0.5 },
  },
};

// Shape utils personalizados
const customShapeUtils = [GoalkeeperShapeUtil, BallShapeUtil, FieldBackgroundShapeUtil];

// ============================================
// Componentes internos del editor
// ============================================

// Panel de selección de campo
const FieldSelector = track(function FieldSelector({
  currentFieldId,
  onSelectField,
}: {
  currentFieldId: string;
  onSelectField: (fieldView: FieldView) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const t = useTranslations('editor');

  return (
    <div className="tactical-editor-field-selector">
      <button
        className="tactical-editor-btn tactical-editor-btn-field"
        onClick={() => setIsOpen(!isOpen)}
      >
        🏟️ {t('selectField')}
      </button>
      {isOpen && (
        <div className="tactical-editor-field-dropdown">
          {FIELD_VIEWS.map((field) => (
            <button
              key={field.id}
              className={`tactical-editor-field-option ${currentFieldId === field.id ? 'active' : ''}`}
              onClick={() => {
                onSelectField(field);
                setIsOpen(false);
              }}
            >
              {field.image && (
                <Image
                  src={field.image}
                  alt={field.label}
                  className="tactical-editor-field-thumb"
                  width={120}
                  height={60}
                  style={{ objectFit: 'cover' }}
                />
              )}
              <span>{field.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

// Panel de shapes personalizados
const ShapePalette = function ShapePalette({ editor }: { editor: Editor | null }) {
  const t = useTranslations('editor');  

  const addGoalkeeper = useCallback(() => {
    if (!editor) return;
    const shapeId = createShapeId();
    const center = editor.getViewportScreenCenter();
    const pagePoint = editor.screenToPage(center);

    editor.createShape({
      id: shapeId,
      type: 'goalkeeper',
      x: pagePoint.x + 200,
      y: pagePoint.y + 200,
      props: {
        w: 40,
        h: 40,
       
      },
    });
    editor.select(shapeId);
  }, [editor]);

  const addBall = useCallback(() => {
    if (!editor) return;
    const shapeId = createShapeId();
    const center = editor.getViewportScreenCenter();
    const pagePoint = editor.screenToPage(center);

    editor.createShape({
      id: shapeId,
      type: 'ball',
      x: pagePoint.x + 200,
      y: pagePoint.y + 200,
      props: {
        w: 30,
        h: 30,
      },
    });
    editor.select(shapeId);
  }, [editor]);

  return (
    <div className="tactical-editor-palette">
      <div className="tactical-editor-palette-section">
        <h4>{t('elements')}</h4>
        
        {/* Portero */}
        <div className="tactical-editor-element-group">
          <button
            className="tactical-editor-btn tactical-editor-btn-element"
            onClick={addGoalkeeper}
            title={t('addGoalkeeper')}
          >
            🧤 {t('goalkeeper')}
          </button>                   
        </div>

        {/* Balón */}
        <div className="tactical-editor-element-group">
          <button
            className="tactical-editor-btn tactical-editor-btn-element"
            onClick={addBall}
            title={t('addBall')}
          >
            ⚽ {t('ball')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Panel de propiedades del shape seleccionado
const ShapePropertiesPanel = function ShapePropertiesPanel({ editor }: { editor: Editor | null }) {
  const t = useTranslations('editor');
  const [, forceUpdate] = useState({});
  
  // Escuchar cambios de selección
  useEffect(() => {
    if (!editor) return;
    const handleChange = () => forceUpdate({});
    editor.on('change', handleChange);
    return () => {
      editor.off('change', handleChange);
    };
  }, [editor]);

  if (!editor) return null;
  const selectedShapes = editor.getSelectedShapes();

  if (selectedShapes.length !== 1) return null;

  const shape = selectedShapes[0];

  // Solo mostrar propiedades para shapes de portero
  if (shape.type !== 'goalkeeper') return null;

  const props = shape.props as { rotation: number; color: string; w: number; h: number };

  const updateRotation = (rotation: number) => {
    editor.updateShape({
      id: shape.id,
      type: 'goalkeeper',
      props: { ...props, rotation },
    });
  };

  const updateColor = (color: string) => {
    editor.updateShape({
      id: shape.id,
      type: 'goalkeeper',
      props: { ...props, color },
    });
  };

  return (
    <div className="tactical-editor-properties-panel">
      <h4>{t('properties')}</h4>
      
      {/* Color del uniforme */}
      <div className="tactical-editor-property-group">
        <span className="tactical-editor-label">{t('uniformColor')}:</span>
        <div className="tactical-editor-color-options">
          {GOALKEEPER_COLORS.map((color) => (
            <button
              key={color.id}
              className={`tactical-editor-color-btn ${props.color === color.id ? 'active' : ''}`}
              style={{ backgroundColor: color.preview }}
              onClick={() => updateColor(color.id)}
              title={color.label}
            />
          ))}
        </div>
      </div>

      {/* Dirección */}
      <div className="tactical-editor-property-group">
        <span className="tactical-editor-label">{t('direction')}:</span>
        <div className="tactical-editor-rotation-options">
          {GOALKEEPER_ROTATIONS.map((rot) => (
            <button
              key={rot.id}
              className={`tactical-editor-rotation-btn ${props.rotation === rot.id ? 'active' : ''}`}
              onClick={() => updateRotation(rot.id)}
              title={`${rot.angle}°`}
            >
              {rot.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Toolbar principal
const EditorToolbar = function EditorToolbar({
  onSave,
  onExport,
  isSaving,
}: {
  onSave: () => void;
  onExport: () => void;
  isSaving: boolean;
}) {
  const t = useTranslations('editor');

  return (
    <div className="tactical-editor-toolbar-actions">
      <button
        className="tactical-editor-btn tactical-editor-btn-export"
        onClick={onExport}
      >
        📥 {t('exportPng')}
      </button>

      <button
        className="tactical-editor-btn tactical-editor-btn-save"
        onClick={onSave}
        disabled={isSaving}
      >
        {isSaving ? '...' : '💾'} {t('save')}
      </button>
      
    </div>
  );
};

// Modal para guardar diseño
const SaveDesignModal = ({
  isOpen,
  onClose,
  onSave,
  isSaving,
  initialTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string) => void;
  isSaving: boolean;
  initialTitle: string;
}) => {
  const t = useTranslations('editor');
  const [title, setTitle] = useState(initialTitle);

  useEffect(() => {
    setTitle(initialTitle);
  }, [initialTitle]);

  if (!isOpen) return null;

  return (
    <div className="tactical-editor-modal-overlay" onClick={onClose}>
      <div className="tactical-editor-modal" onClick={(e) => e.stopPropagation()}>
        <div className="tactical-editor-modal-header">
          <h3>{t('saveDesign')}</h3>
          <button className="tactical-editor-modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="tactical-editor-modal-content">
          <label className="tactical-editor-label">{t('designTitle')}</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('enterDesignTitle')}
            className="tactical-editor-input"
          />
          <div className="tactical-editor-modal-actions">
            <button
              className="tactical-editor-btn tactical-editor-btn-cancel"
              onClick={onClose}
            >
              {t('cancel')}
            </button>
            <button
              className="tactical-editor-btn tactical-editor-btn-save"
              onClick={() => onSave(title)}
              disabled={isSaving || !title.trim()}
            >
              {isSaving ? t('saving') : t('save')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// Componente principal del editor
// ============================================

export default function TacticalEditor({
  designId,
  taskId,
  onDesignSaved,
}: TacticalEditorProps) {
  const locale = useLocale();
  
  const [editor, setEditor] = useState<Editor | null>(null);
  const [currentFieldId, setCurrentFieldId] = useState<string>('frontal-1');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);
  const [designTitle, setDesignTitle] = useState('');
  const [currentDesignId, setCurrentDesignId] = useState<number | undefined>(designId);
  
  const isInitializedRef = useRef(false);

  // Cargar diseño existente
  const loadExistingDesign = useCallback(async (id: number) => {
    try {
      const response = await authenticatedFetch(`/api/editor/designs/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.design && editor) {
          setDesignTitle(data.design.title || '');
          
          // Cargar snapshot en el editor
          if (data.design.data) {
            const snapshot = data.design.data as TLEditorSnapshot;
            loadSnapshot(editor.store, snapshot);
          }
          
          isInitializedRef.current = true;
        }
      }
    } catch (error) {
      console.error('Error loading design:', error);
    }
  }, [editor]);

  // Cargar diseño existente si se proporciona designId
  useEffect(() => {
    if (designId && editor && !isInitializedRef.current) {
      loadExistingDesign(designId);
    }
  }, [designId, editor, loadExistingDesign]);

  // Asegurar que el fondo siempre esté al fondo
  const ensureBackgroundAtBottom = useCallback((editorInstance: Editor) => {
    const backgroundShape = editorInstance.getShape(BACKGROUND_SHAPE_ID);
    if (backgroundShape) {
      // Siempre enviar al fondo sin condiciones
      editorInstance.sendToBack([BACKGROUND_SHAPE_ID]);
    }
  }, []);

  // Handler cuando el editor se monta
  const handleMount = useCallback((editorInstance: Editor) => {
    setEditor(editorInstance);

    // Crear el shape de fondo inicial
    const existingBackground = editorInstance.getShape(BACKGROUND_SHAPE_ID);
    if (!existingBackground) {
      const defaultField = FIELD_VIEWS.find((f) => f.id === 'frontal-1') || FIELD_VIEWS[0];
      
      editorInstance.createShape({
        id: BACKGROUND_SHAPE_ID,
        type: 'field-background',
        x: 0,
        y: 0,
        isLocked: true,
        props: {
          w: CANVAS_WIDTH,
          h: CANVAS_HEIGHT,
          backgroundType: 'image',
          backgroundColor: '#6ba04d',
          backgroundImage: defaultField.image || '',
        },
      });

      // Asegurar que el fondo esté al final de la lista (al fondo visualmente)
      ensureBackgroundAtBottom(editorInstance);
    }

    // Configurar opciones de cámara
    editorInstance.setCameraOptions(CAMERA_OPTIONS as TLCameraOptions);
    editorInstance.setCamera(editorInstance.getCamera(), { reset: true });
  }, [ensureBackgroundAtBottom]);

  // Cambiar el fondo de la cancha
  const handleSelectField = useCallback(
    (fieldView: FieldView) => {
      if (!editor) return;

      setCurrentFieldId(fieldView.id);
      
      // Obtener todos los shapes que no son el fondo antes de eliminar
      const pageId = editor.getCurrentPageId();
      const allShapeIds = editor.getSortedChildIdsForParent(pageId);
      const otherShapeIds = allShapeIds.filter(id => id !== BACKGROUND_SHAPE_ID);
      
      // Eliminar el shape de fondo existente
      const backgroundShape = editor.getShape(BACKGROUND_SHAPE_ID);
      if (backgroundShape) {
        editor.deleteShape(BACKGROUND_SHAPE_ID);
      }

      // Crear nuevo shape de fondo
      editor.createShape({
        id: BACKGROUND_SHAPE_ID,
        type: 'field-background',
        x: 0,
        y: 0,
        isLocked: true,
        props: {
          w: CANVAS_WIDTH,
          h: CANVAS_HEIGHT,
          backgroundType: fieldView.type,
          backgroundColor: fieldView.color || '#6ba04d',
          backgroundImage: fieldView.image || '',
        },
      });
      
      // Traer todos los otros shapes al frente después de crear el fondo
      if (otherShapeIds.length > 0) {
        editor.bringToFront(otherShapeIds);
      }
    },
    [editor]
  );

  // Registrar side effect para mantener nuevos shapes sobre el fondo
  useEffect(() => {
    if (!editor) return;

    const removeOnCreate = editor.sideEffects.registerAfterCreateHandler('shape', (shape) => {
      // Si el shape creado no es el fondo, traerlo al frente
      if (shape.id !== BACKGROUND_SHAPE_ID) {
        editor.bringToFront([shape.id]);
      }
    });

    return () => {
      removeOnCreate();
    };
  }, [editor]);

  // Exportar a PNG
  const handleExport = useCallback(async () => {
    if (!editor) return;

    try {
      const { blob } = await editor.toImage([...editor.getCurrentPageShapeIds()], {
        format: 'png',
        background: true,
        bounds: new Box(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
        padding: 0,
        scale: 1,
      });

      // Descargar directamente
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tactical-design-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting to PNG:', error);
    }
  }, [editor]);

  // Guardar diseño
  const handleSave = useCallback(
    async (title: string) => {
      if (!editor || !title.trim()) return;

      setIsSaving(true);

      try {
        // Obtener snapshot del editor
        const snapshot = getSnapshot(editor.store);

        // Generar imagen para preview
        const { blob } = await editor.toImage([...editor.getCurrentPageShapeIds()], {
          format: 'png',
          background: true,
          bounds: new Box(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT),
          padding: 0,
          scale: 1,
        });

        // Convertir blob a base64
        const reader = new FileReader();
        const imageDataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        // Preparar datos para enviar
        const designData = {
          title: title.trim(),
          data: snapshot,
          locale,
          training_session_id: taskId || null,
          imageDataUrl,
        };

        let response;
        if (currentDesignId) {
          // Actualizar diseño existente
          response = await authenticatedFetch(`/api/editor/designs/${currentDesignId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(designData),
          });
        } else {
          // Crear nuevo diseño
          response = await authenticatedFetch('/api/editor/designs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(designData),
          });
        }

        if (response.ok) {
          const data = await response.json();
          const savedDesignId = data.design?.id || currentDesignId;
          setCurrentDesignId(savedDesignId);
          setDesignTitle(title);
          setIsSaveModalOpen(false);

          // Actualizar task si está enlazada
          if (taskId && savedDesignId) {
            await authenticatedFetch(`/api/tasks/${taskId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ design_id: savedDesignId }),
            });
          }

          if (onDesignSaved && savedDesignId) {
            onDesignSaved(savedDesignId);
          }
        } else {
          const errorData = await response.json();
          console.error('Error saving design:', errorData);
        }
      } catch (error) {
        console.error('Error saving design:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [editor, locale, taskId, currentDesignId, onDesignSaved]
  );

  return (
    <div className="tactical-editor-container">     
      {/* Contenedor del editor */}
      <div className="tactical-editor-main">
        {/* Panel lateral izquierdo */}
        <div className="tactical-editor-sidebar">
          <FieldSelector
            currentFieldId={currentFieldId}
            onSelectField={handleSelectField}
          />
          <ShapePalette editor={editor} />
          <ShapePropertiesPanel editor={editor} />

          <EditorToolbar
            onSave={() => setIsSaveModalOpen(true)}
            onExport={handleExport}
            isSaving={isSaving}
          />
        </div>

        {/* Canvas del editor */}
        <div className="tactical-editor-canvas">
          <Tldraw
            onMount={handleMount}
            shapeUtils={customShapeUtils}
            cameraOptions={CAMERA_OPTIONS}
            components={{
              PageMenu: null,
            }}
          />
        </div>
      </div>

      {/* Modal para guardar diseño */}
      <SaveDesignModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSave}
        isSaving={isSaving}
        initialTitle={designTitle}
      />
    </div>
  );
}