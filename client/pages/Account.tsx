import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Account(){
  function exportData(){
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('paintbook:'));
    const data: Record<string, any> = {};
    keys.forEach(k=>{ try{ data[k] = JSON.parse(localStorage.getItem(k) || 'null'); } catch { data[k] = localStorage.getItem(k);} });
    const blob = new Blob([JSON.stringify(data,null,2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'paintbookco-export.json'; a.click(); URL.revokeObjectURL(url);
  }
  function deleteData(){
    const keys = Object.keys(localStorage).filter(k=>k.startsWith('paintbook:'));
    keys.forEach(k=>localStorage.removeItem(k));
    alert('Your local data has been deleted.');
  }
  return (
    <div className="container mx-auto px-4 py-10 grid gap-6 md:max-w-2xl">
      <Card><CardContent className="p-6"><div className="text-lg font-semibold">Data export</div><p className="text-sm text-muted-foreground mt-1">Download a JSON file containing your local data (jobs, messages, disputes, estimates, etc.).</p><Button className="mt-3" onClick={exportData}>Export data</Button></CardContent></Card>
      <Card><CardContent className="p-6"><div className="text-lg font-semibold">Delete data</div><p className="text-sm text-muted-foreground mt-1">Remove all locally stored data from this device. This action cannot be undone.</p><Button variant="secondary" className="mt-3" onClick={deleteData}>Delete local data</Button></CardContent></Card>
    </div>
  );
}
