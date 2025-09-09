import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Msg = { id: string; from: string; text: string; at: string };
type Thread = { id: string; title: string; counterpart: string; messages: Msg[] };

export default function Messages(){
  const { search } = useLocation();
  const params = new URLSearchParams(search);
  const starter = params.get('job') ? { id: `t${params.get('job')}`, title: `Job ${params.get('job')}`, counterpart: params.get('painter') || 'Painter', messages: [] } as Thread : null;

  const [threads, setThreads] = useState<Thread[]>(()=>{
    const existing: Thread[] = JSON.parse(localStorage.getItem('paintbook:threads')||'[]');
    if(starter && !existing.find(t=>t.id===starter.id)){ existing.unshift(starter); }
    localStorage.setItem('paintbook:threads', JSON.stringify(existing));
    return existing;
  });
  const [active, setActive] = useState(threads[0]?.id);
  const current = useMemo(()=> threads.find(t=>t.id===active) || null, [threads, active]);

  const [text, setText] = useState("");
  function send(){
    if(!current || !text.trim()) return;
    const msg: Msg = { id: `m${Date.now()}`, from: 'me', text: text.trim(), at: new Date().toISOString() };
    const next = threads.map(t=> t.id===current.id ? { ...t, messages: [...t.messages, msg] } : t);
    setThreads(next); localStorage.setItem('paintbook:threads', JSON.stringify(next)); setText("");
  }

  return (
    <div className="container mx-auto grid gap-6 px-4 py-10 md:grid-cols-[280px_1fr]">
      <aside className="space-y-2">
        {threads.map(t=> (
          <Button key={t.id} variant={t.id===active? 'default':'outline'} className="w-full justify-start" onClick={()=>setActive(t.id)}>{t.title} · {t.counterpart}</Button>
        ))}
        {threads.length===0 && <p className="text-sm text-muted-foreground">No conversations yet.</p>}
      </aside>
      <section>
        {current ? (
          <Card>
            <CardContent className="p-4">
              <div className="mb-4 text-sm text-muted-foreground">Chat with {current.counterpart}</div>
              <div className="h-80 overflow-y-auto rounded border bg-background p-3 space-y-2">
                {current.messages.map(m => (
                  <div key={m.id} className={`max-w-[75%] rounded px-3 py-2 text-sm ${m.from==='me'?'ml-auto bg-primary text-primary-foreground':'bg-secondary'}`}>{m.text}</div>
                ))}
              </div>
              <div className="mt-3 flex gap-2">
                <Input value={text} onChange={e=>setText(e.target.value)} placeholder="Type a message"/>
                <Button onClick={send}>Send</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-sm text-muted-foreground">Select a conversation.</p>
        )}
      </section>
    </div>
  );
}
