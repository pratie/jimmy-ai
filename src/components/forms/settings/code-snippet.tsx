'use client'
import Section from '@/components/section-label'
import { useToast } from '@/components/ui/use-toast'
import { Copy } from 'lucide-react'
import React from 'react'

type Props = {
  id: string
}

const CodeSnippet = ({ id }: Props) => {
  const { toast } = useToast()
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '')

  // Hardened floating widget snippet (minimal change to current behavior)
  const snippet = `
(function(){
  if(typeof window==='undefined'||typeof document==='undefined')return;
  if(window.__bmlWidgetLoaded__)return; window.__bmlWidgetLoaded__=true;
  try{ if(window.top!==window.self) return; }catch(e){ return; }

  var APP_ORIGIN='${appUrl}';
  var DOMAIN_ID='${id}';

  function injectStyles(css){
    if(document.getElementById('bml-chat-styles'))return;
    var s=document.createElement('style'); s.id='bml-chat-styles'; s.textContent=css; document.head.appendChild(s);
  }
  injectStyles('.bml-chat-frame{position:fixed;bottom:24px;right:24px;border:none;z-index:2147483647;border-radius:12px;box-shadow:0 8px 24px rgba(0,0,0,.2);background:#fff}@media(max-width:640px){.bml-chat-frame{bottom:16px;right:16px}}');

  var iframe=document.createElement('iframe');
  iframe.className='bml-chat-frame';
  iframe.src=APP_ORIGIN+'/chatbot';
  iframe.title='BookmyLead Chatbot';
  iframe.width='80';
  iframe.height='80';

  var sent=false;
  function onMessage(e){
    if(e.origin!==APP_ORIGIN)return;
    var data=e.data; try{ if(typeof data==='string') data=JSON.parse(data); }catch(_){ return; }
    if(!data||typeof data.width!=='number'||typeof data.height!=='number') return;
    iframe.width=String(data.width); iframe.height=String(data.height);
    if(!sent){ sent=true; try{ iframe.contentWindow&&iframe.contentWindow.postMessage(DOMAIN_ID, APP_ORIGIN); }catch(_){} }
  }
  window.addEventListener('message', onMessage);

  function mount(){ if(!document.body){ document.addEventListener('DOMContentLoaded', mount, {once:true}); return; } document.body.appendChild(iframe); }
  mount();

  iframe.onload=function(){ setTimeout(function(){ if(!sent){ sent=true; try{ iframe.contentWindow&&iframe.contentWindow.postMessage(DOMAIN_ID, APP_ORIGIN); }catch(_){} } }, 1500); };
})();`

  return (
    <div className="mt-10 flex flex-col gap-5 items-start">
      <Section
        label="Code snippet"
        message="Paste this before </body> (or load with defer) on your site."
      />
      <div className="bg-cream px-6 py-4 rounded-lg relative w-full overflow-x-auto">
        <Copy
          className="absolute top-5 right-5 text-brand-primary/60 hover:text-brand-primary cursor-pointer"
          onClick={() => {
            navigator.clipboard.writeText(snippet)
            toast({
              title: 'Copied to clipboard',
              description: 'You can now paste the code inside your website',
            })
          }}
        />
        <pre className="whitespace-pre text-sm min-w-full">
          <code className="text-brand-primary/70">{snippet}</code>
        </pre>
      </div>
    </div>
  )
}

export default CodeSnippet

