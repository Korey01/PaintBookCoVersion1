import PainterCard from "@/components/site/PainterCard";
import { painters } from "@/data/painters";

export default function Favorites(){
  const favIds: string[] = JSON.parse(localStorage.getItem('paintbook:favs')||'[]');
  const items = painters.filter(p=>favIds.includes(p.id));
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold">Your favourites</h1>
      <p className="text-sm text-muted-foreground">Saved painters for quick access.</p>
      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {items.map(p => <PainterCard key={p.id} painter={p} />)}
        {items.length===0 && <p className="text-sm text-muted-foreground">No favourites yet. Tap the heart on any painter.</p>}
      </div>
    </div>
  );
}
