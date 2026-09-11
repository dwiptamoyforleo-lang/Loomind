import React, { useState } from 'react';
import { ThoughtNode, CanvasViewport } from '../types';
import { MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface MinimapProps {
  nodes: Record<string, ThoughtNode>;
  viewport: CanvasViewport;
  onPanTo: (worldX: number, worldY: number) => void;
}

export const Minimap: React.FC<MinimapProps> = ({ nodes, viewport, onPanTo }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const nodeList = Object.values(nodes);
  if (nodeList.length === 0) return null;

  // Compute bounding box of all nodes
  let minX = -800;
  let maxX = 800;
  let minY = -500;
  let maxY = 500;

  for (const n of nodeList) {
    if (n.x < minX) minX = n.x;
    if (n.x > maxX) maxX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.y > maxY) maxY = n.y;
  }

  // Padding
  const pad = 200;
  const boundWidth = maxX - minX + pad * 2;
  const boundHeight = maxY - minY + pad * 2;

  const mapWidth = 160;
  const mapHeight = 110;

  const scaleX = mapWidth / boundWidth;
  const scaleY = mapHeight / boundHeight;
  const scale = Math.min(scaleX, scaleY);

  const toMapX = (worldX: number) => (worldX - minX + pad) * scale;
  const toMapY = (worldY: number) => (worldY - minY + pad) * scale;

  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const worldX = clickX / scale + minX - pad;
    const worldY = clickY / scale + minY - pad;

    onPanTo(worldX, worldY);
  };

  return (
    <div
      id="loomind-minimap"
      className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md rounded-xl border border-slate-200 shadow-lg overflow-hidden select-none"
    >
      <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          <MapPin className="w-3 h-3 text-indigo-600" />
          <span>Radar</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-slate-400 hover:text-slate-700"
        >
          {isExpanded ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />}
        </button>
      </div>

      {isExpanded && (
        <div className="p-2">
          <svg
            width={mapWidth}
            height={mapHeight}
            className="bg-slate-100/70 rounded border border-slate-200/60 cursor-pointer"
            onClick={handleMapClick}
          >
            {/* Render Node dots */}
            {nodeList.map((n) => {
              const cx = toMapX(n.x);
              const cy = toMapY(n.y);
              const isRoot = !n.parentId;
              return (
                <circle
                  key={n.id}
                  cx={cx}
                  cy={cy}
                  r={isRoot ? 4 : 2.5}
                  fill={isRoot ? '#4f46e5' : '#64748b'}
                  className="transition-transform"
                />
              );
            })}

            {/* Viewport Indicator */}
            {(() => {
              // Current center in world coordinates
              const centerWorldX = -viewport.x / viewport.zoom;
              const centerWorldY = -viewport.y / viewport.zoom;
              const cx = toMapX(centerWorldX);
              const cy = toMapY(centerWorldY);

              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={6}
                  fill="none"
                  stroke="#4f46e5"
                  strokeWidth={1.5}
                  strokeDasharray="2,2"
                />
              );
            })()}
          </svg>
        </div>
      )}
    </div>
  );
};
