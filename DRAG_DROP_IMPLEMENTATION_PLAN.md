# Dashboard Drag-and-Drop Implementation Plan

## Current Status
- ✅ Installed `dnd-kit` packages
- ✅ Added imports and sensors
- ✅ Added state for `widgetOrder` and `layoutPrefs`
- ✅ Implemented `handleDragEnd` and `saveLayout` functions
- ✅ Added `SortableWidget` wrapper component
- ✅ Updated header with Save Layout button
- ✅ Started DndContext and SortableContext wrapper
- ⏳ **NEXT**: Extract all widgets into the map and render in sorted order

## Widget IDs
1. `kpis-1` - First set of 4 KPI cards (Total/Active Trackers, Total Mentions, Recent Activity)
2. `kpis-2` - Second set of 4 KPI cards (Unique Sources, Competitors, Mention Rate, Coverage)
3. `searches` - Searches vs Brand Mentions interactive chart
4. `rate-trends` - Grid with Mention Rate Trend + Mention Trends
5. `query-perf` - Grid with Query Performance + New Domains
6. `sources` - Top Sources full-width table
7. `share-diag` - Grid with Share of Voice + Diagnostics
8. `competitors` - Competitor Analysis table

## Implementation Approach
Rather than fully extracting widgets (complex due to state/handlers), use a hybrid approach:
- Keep widgets in place but wrap in `<SortableWidget id="...">`
- Use `widgetOrder.map()` to render them in sorted order
- Each widget checks if it should render based on its position in the order

## Code Structure
```tsx
{widgetOrder.map((widgetId) => (
  <SortableWidget key={widgetId} id={widgetId}>
    {widgetId === 'kpis-1' && <div className="grid...">KPIs</div>}
    {widgetId === 'kpis-2' && <div className="grid...">KPIs 2</div>}
    {/* ... etc */}
  </SortableWidget>
))}
```

## Next Steps
1. Close current DndContext properly
2. Refactor widget rendering using widgetOrder.map()
3. Test drag-and-drop in UI
4. Verify persistence to Supabase

