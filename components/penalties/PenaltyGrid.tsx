import { useTranslations } from 'next-intl';

interface PenaltyGridProps {
  direction: 'left' | 'center' | 'right';
  height: 'low' | 'mid' | 'high';
  onSelect?: (direction: 'left' | 'center' | 'right', height: 'low' | 'mid' | 'high') => void;
  showResult?: boolean;
  result?: 'saved' | 'goal' | 'missed' | 'post';
  readOnly?: boolean;
}

export default function PenaltyGrid({ 
  direction, 
  height, 
  onSelect, 
  showResult = false,
  result,
  readOnly = false 
}: PenaltyGridProps) {
  const t = useTranslations('penalties');

  const getZoneClass = (zoneDir: string, zoneHeight: string) => {
    const isSelected = direction === zoneDir && height === zoneHeight;
    
    if (isSelected) {
      if (showResult && result) {
        switch (result) {
          case 'saved':
            return 'bg-green-500 border-green-700';
          case 'goal':
            return 'bg-red-500 border-red-700';
          case 'missed':
            return 'bg-yellow-500 border-yellow-700';
          case 'post':
            return 'bg-orange-500 border-orange-700';
          default:
            return 'bg-blue-500 border-blue-700';
        }
      }
      return 'bg-blue-500 border-blue-700';
    }
    
    return readOnly 
      ? 'bg-gray-50 border-gray-200' 
      : 'bg-white border-gray-300 hover:bg-gray-100 cursor-pointer';
  };

  const handleZoneClick = (zoneDir: 'left' | 'center' | 'right', zoneHeight: 'low' | 'mid' | 'high') => {
    if (!readOnly && onSelect) {
      onSelect(zoneDir, zoneHeight);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="grid grid-cols-3 gap-2 aspect-3/2 border-4 border-gray-800 rounded-lg p-2 bg-linear-to-b from-gray-100 to-gray-200">
        {/* Fila superior (high) */}
        {(['left', 'center', 'right'] as const).map((dir) => (
          <button
            key={`high-${dir}`}
            type="button"
            onClick={() => handleZoneClick(dir, 'high')}
            disabled={readOnly}
            className={`
              border-2 rounded transition-all duration-200
              ${getZoneClass(dir, 'high')}
              ${!readOnly && 'hover:scale-105'}
            `}
            aria-label={`${t(`grid.top${dir.charAt(0).toUpperCase() + dir.slice(1)}`)}`}
          />
        ))}

        {/* Fila media (mid) */}
        {(['left', 'center', 'right'] as const).map((dir) => (
          <button
            key={`mid-${dir}`}
            type="button"
            onClick={() => handleZoneClick(dir, 'mid')}
            disabled={readOnly}
            className={`
              border-2 rounded transition-all duration-200
              ${getZoneClass(dir, 'mid')}
              ${!readOnly && 'hover:scale-105'}
            `}
            aria-label={`${t(`grid.middle${dir.charAt(0).toUpperCase() + dir.slice(1)}`)}`}
          />
        ))}

        {/* Fila inferior (low) */}
        {(['left', 'center', 'right'] as const).map((dir) => (
          <button
            key={`low-${dir}`}
            type="button"
            onClick={() => handleZoneClick(dir, 'low')}
            disabled={readOnly}
            className={`
              border-2 rounded transition-all duration-200
              ${getZoneClass(dir, 'low')}
              ${!readOnly && 'hover:scale-105'}
            `}
            aria-label={`${t(`grid.bottom${dir.charAt(0).toUpperCase() + dir.slice(1)}`)}`}
          />
        ))}
      </div>

      {!readOnly && (
        <p className="text-sm text-gray-600 text-center mt-2">
          {t('grid.selectZone')}
        </p>
      )}

      {showResult && result && (
        <div className="mt-4 text-center">
          <span className={`
            inline-block px-4 py-2 rounded-full text-sm font-medium
            ${result === 'saved' && 'bg-green-100 text-green-800'}
            ${result === 'goal' && 'bg-red-100 text-red-800'}
            ${result === 'missed' && 'bg-yellow-100 text-yellow-800'}
            ${result === 'post' && 'bg-orange-100 text-orange-800'}
          `}>
            {t(`results.${result}`)}
          </span>
        </div>
      )}
    </div>
  );
}
