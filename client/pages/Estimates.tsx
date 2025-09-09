export default function Estimates(){
  const items: any[] = JSON.parse(localStorage.getItem('paintbook:estimates')||'[]');
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Saved estimates</h1>
      <p className="text-sm text-muted-foreground">Reuse your calculations when posting jobs.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((e, i)=> (
          <div key={i} className="rounded border bg-card p-4 text-sm">
            <div className="text-xs text-muted-foreground">{new Date(e.createdAt).toLocaleString()}</div>
            <div className="mt-2 grid grid-cols-2 gap-1">
              <div>Wall area</div><div className="text-right font-medium">{e.wallArea?.toFixed?.(1) ?? e.wallArea} m²</div>
              <div>Coats</div><div className="text-right font-medium">{e.coats}</div>
              <div>Litres</div><div className="text-right font-medium">{e.litres?.toFixed?.(1) ?? e.litres} L</div>
              <div>Materials</div><div className="text-right font-medium">£{e.materialCost}</div>
            </div>
          </div>
        ))}
        {items.length===0 && <p className="text-sm text-muted-foreground">No saved estimates yet.</p>}
      </div>
    </div>
  );
}
