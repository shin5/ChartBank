import LayoutSelector from "@/components/LayoutSelector";
import { LayoutMode, ViewMode } from "@/types/market";

interface Props {
  layout: LayoutMode;
  onLayoutChange: (l: LayoutMode) => void;
  onAddPanel: () => void;
  panelCount: number;
  maxPanels: number;
  showWatchlist: boolean;
  onToggleWatchlist: () => void;
  viewMode: ViewMode;
  onViewModeChange: (m: ViewMode) => void;
}

export default function Header({
  layout,
  onLayoutChange,
  onAddPanel,
  panelCount,
  maxPanels,
  showWatchlist,
  onToggleWatchlist,
  viewMode,
  onViewModeChange,
}: Props) {
  return (
    <header className="flex items-center justify-between px-4 py-2 bg-cb-panel border-b border-cb-border">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-bold text-cb-text tracking-tight">
          <span className="text-cb-accent">Chart</span>Bank
        </h1>
      </div>
      <div className="flex items-center gap-3">
        {/* View mode toggle */}
        <div className="flex rounded border border-cb-border overflow-hidden">
          <button
            onClick={() => onViewModeChange("chart")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors ${
              viewMode === "chart"
                ? "bg-cb-accent text-white"
                : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
            title="チャート表示"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
            チャート
          </button>
          <button
            onClick={() => onViewModeChange("dashboard")}
            className={`flex items-center gap-1 px-2.5 py-1 text-xs transition-colors ${
              viewMode === "dashboard"
                ? "bg-cb-accent text-white"
                : "text-cb-muted hover:text-cb-text hover:bg-cb-border"
            }`}
            title="ダッシュボード表示"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
            ダッシュボード
          </button>
        </div>
        <div className="h-4 w-px bg-cb-border" />
        {/* Chart mode controls */}
        {viewMode === "chart" && (
          <>
            <LayoutSelector active={layout} onChange={onLayoutChange} />
            <button
              onClick={onAddPanel}
              disabled={panelCount >= maxPanels}
              className="flex items-center gap-1 px-2.5 py-1 text-xs rounded border border-cb-border text-cb-text hover:bg-cb-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              title="パネルを追加"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              追加
            </button>
            <span className="text-xs text-cb-muted">{panelCount}/{maxPanels}</span>
            <div className="h-4 w-px bg-cb-border" />
          </>
        )}
        <button
          onClick={onToggleWatchlist}
          className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded border transition-colors ${
            showWatchlist
              ? "border-cb-accent bg-cb-accent/20 text-cb-accent"
              : "border-cb-border text-cb-text hover:bg-cb-border"
          }`}
          title="ウォッチリスト"
        >
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          ウォッチリスト
        </button>
      </div>
    </header>
  );
}
