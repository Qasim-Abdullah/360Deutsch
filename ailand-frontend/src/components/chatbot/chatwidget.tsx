"use client";
import { X, Send, User as UserIcon, Mic, Camera, Paperclip, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image"; 
import { useChatWidget, Msg } from "@/hooks/useChatWidget";

export function ChatWidget() {
  const aiLogo = "/assets/logo.png";
  
  const {
    isWindowOpen, setisWindowOpen,
    input, setInput,
    messages,
    isTyping,
    isRecording,
    attachment, setAttachment,
    showCamera,
    size,
    messagesEndRef,
    userFileInputRef,
    videoRef,
    canvasRef,
    startResize,
    handleSend,
   
  } = useChatWidget();

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-display">   
      {showCamera && (
          <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
              <div className="bg-zinc-900 p-4 rounded-2xl flex flex-col items-center gap-4 relative shadow-2xl border border-zinc-800">
                  <h3 className="text-white font-bold">Take Photo</h3>
                  <button  className="absolute top-4 right-4 text-zinc-400 hover:text-white"><X /></button>
                  <video ref={videoRef} autoPlay playsInline className="w-[300px] h-[200px] bg-black rounded-lg object-cover" />
                  <canvas ref={canvasRef} width="300" height="200" className="hidden" />
                  <button  className="px-6 py-2 bg-white text-black rounded-full font-bold hover:scale-105 transition-transform flex items-center gap-2">
                      <Camera size={18} /> Capture
                  </button>
              </div>
          </div>
      )}
      <div style={{ width: isWindowOpen ? size.width : 0, height: isWindowOpen ? size.height : 0 }} className={cn("bg-card border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden transition-all duration-300 origin-bottom-right font-sans relative", isWindowOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none")}>
        <div onMouseDown={startResize} className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-50 hover:bg-[#5a47c7]/20 rounded-br-lg transition-colors">
            <div className="absolute top-1 left-1 w-2 h-2 border-t-2 border-l-2 border-slate-300 dark:border-slate-600 rounded-tl-sm" />
        </div>
        <div className="bg-card px-6 py-4 flex items-center justify-between border-b border-border relative">
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 relative flex items-center justify-center bg-[#5a47c7] rounded-full shadow-lg shadow-[#5a47c7]/20 border border-white/10">
                 <Image src={aiLogo} alt="AI Logo" width={24} height={24} className="object-contain" />
             </div>
             <div>
               <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                 Assistant <span className="text-[10px] bg-secondary rounded px-1 text-secondary-foreground font-normal">v1.0</span>
               </h3>
               <p className="text-[10px] text-green-500 font-medium tracking-wide flex items-center gap-1">
                 <span className="block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> 
                 ONLINE
               </p>
             </div>
          </div>
          <button onClick={() => setisWindowOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-md"><X size={20} /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-background">
          {messages.map((msg) => (
            <div key={msg.id} className={cn("flex w-full gap-3", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
              <div className={cn("h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden relative", msg.role === "user" ? "bg-secondary" : "bg-[#5a47c7]")}>
                {msg.role === "user" ? (
                    <UserIcon size={14} className="text-slate-600 dark:text-slate-400" />
                ) : (
                    <Image src={aiLogo} alt="AI" width={18} height={18} className="object-contain" />
                )}
              </div>
              <div className={cn("max-w-[85%] p-4 rounded-2xl text-sm shadow-sm flex flex-col gap-2", msg.role === "user" ? "bg-[#5a47c7] text-white rounded-br-none" : "bg-card border border-border text-foreground rounded-bl-none")}>
                 {msg.attachment && (
                     <img src={msg.attachment} alt="Attachment" className="rounded-lg max-h-40 object-cover border border-white/20" />
                 )}                 
                <div className="flex flex-col gap-3">
                  {(msg.content || "").split("###").map((section, idx) => {
                    if (!section.trim()) return null;
                    
                    if (section.trim().startsWith("VOCAB_CARD")) {
                        try {
                            const jsonStr = section.replace("VOCAB_CARD", "").trim();
                            const card = JSON.parse(jsonStr);
                            
                            return (
                                <div key={idx} className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-zinc-800 my-2 text-slate-800 dark:text-slate-200">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-zinc-800 pb-2">
                                        <div>
                                           <div className="text-[10px] font-bold text-[#5a47c7] tracking-wider mb-1">LANGUAGE LEARNING</div>
                                           <div className="flex items-baseline gap-2">
                                               <span className="text-xl text-slate-400 italic font-serif">{card.article}</span>
                                               <span className="text-3xl font-bold text-slate-800 dark:text-white font-serif">{card.word}</span>
                                           </div>
                                           <div className="text-sm text-[#5a47c7] font-medium">{card.translation}</div>
                                        </div>
                                        <div className="bg-[#5a47c7]/5 dark:bg-[#5a47c7]/20 text-[#5a47c7] dark:text-[#5a47c7] text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                                            {card.gender}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg">
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">PLURAL</div>
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{card.plural}</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-zinc-900 p-2 rounded-lg">
                                            <div className="text-[10px] text-slate-400 uppercase font-bold mb-1">ARTICLE</div>
                                            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">{card.article}</div>
                                        </div>
                                    </div>
                                    <div className="bg-gradient-to-r from-[#5a47c7] to-[#9160a8] p-3 rounded-lg text-white shadow-md">
                                        <div className="text-[10px] text-white/70 uppercase font-bold mb-1">USAGE EXAMPLE</div>
                                        <div className="text-sm font-medium italic">"{card.example}"</div>
                                    </div>
                                </div>
                            );
                        } catch (e) {
                            return <div key={idx} className="text-red-500 text-xs text-slate-800 dark:text-slate-200">Error loading card</div>;
                        }
                    }

                    if (section.trim().startsWith("CORRECTION_CARD")) {
                        try {
                            const jsonStr = section.replace("CORRECTION_CARD", "").trim();
                            const card = JSON.parse(jsonStr);
                            
                            return (
                                <div key={idx} className="bg-white dark:bg-zinc-950 rounded-xl p-4 shadow-sm border border-slate-200 dark:border-zinc-800 my-2 text-slate-800 dark:text-slate-200">
                                    <div className="text-[10px] font-bold text-[#5a47c7] tracking-wider mb-3">CORRECTION</div>
                                    
                                    <div className="space-y-3 mb-4">
                                        <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-lg border border-red-200 dark:border-red-900/50">
                                            <div className="text-[10px] text-red-500 uppercase font-bold mb-1 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-red-500"></span>
                                                YOUR TEXT
                                            </div>
                                            <div className="text-sm font-medium text-red-700 dark:text-red-400 line-through">{card.incorrect}</div>
                                        </div>
                                        
                                        <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-lg border border-green-200 dark:border-green-900/50">
                                            <div className="text-[10px] text-green-600 uppercase font-bold mb-1 flex items-center gap-1">
                                                <span className="w-2 h-2 rounded-full bg-green-500"></span>
                                                CORRECT VERSION
                                            </div>
                                            <div className="text-sm font-medium text-green-700 dark:text-green-400">{card.correct}</div>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-gradient-to-r from-[#5a47c7] to-[#9160a8] p-3 rounded-lg text-white shadow-md">
                                        <div className="text-[10px] text-white/70 uppercase font-bold mb-1">EXPLANATION</div>
                                        <div className="text-sm font-medium">{card.explanation}</div>
                                    </div>
                                </div>
                            );
                        } catch (e) {
                            return <div key={idx} className="text-red-500 text-xs">Error loading correction card</div>;
                        }
                    }

                    const [title, ...bodyParts] = section.split("\n");
                    const body = bodyParts.join("\n").trim();

                    if ([" Explanation", " Example", " Practice", " Progress Update", " Options", " Stats"].some(t => title.includes(t))) {
                       return (
                         <div key={idx} className="flex flex-col gap-2 bg-[#5a47c7]/5 dark:bg-zinc-800/50 p-3 rounded-lg border border-[#5a47c7]/10 dark:border-zinc-700/50 text-slate-800 dark:text-slate-200">
                           <span className="text-[10px] font-bold uppercase tracking-widest text-[#5a47c7] dark:text-[#5a47c7]">
                             {title.trim()}
                           </span>
                           <div className="text-sm leading-relaxed whitespace-pre-wrap">
                             {body}
                           </div>
                         </div>
                       );
                    }

                    if (title.includes("Suggestions")) {
                        const suggestions = body.split("\n").map(s => s.trim()).filter(s => s.startsWith("-")).map(s => s.replace("-", "").trim());
                        if (suggestions.length === 0) return null;
                        return (
                            <div key={idx} className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-slate-100 dark:border-zinc-800/50">
                                {suggestions.map((s, i) => (
                                    <button key={i} onClick={() => setInput(s)} className="text-xs px-3 py-1.5 bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-full text-[#5a47c7] dark:text-[#5a47c7] font-medium hover:bg-[#5a47c7]/5 dark:hover:bg-[#5a47c7]/10 hover:scale-105 active:scale-95 transition-all shadow-sm">
                                        ✨ {s}
                                    </button>
                                ))}
                            </div>
                        );
                    }
                    
                    return <div key={idx} className="leading-relaxed whitespace-pre-wrap text-slate-800 dark:text-slate-200">{section.trim()}</div>;
                  })}
                 </div>

                 {msg.role === "assistant" && (
                     <button  className="self-start mt-2 p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-full text-slate-400 hover:text-[#5a47c7] transition-colors">
                         <Volume2 size={12} />
                     </button>
                 )}
              </div>
            </div>
          ))}
          {isTyping && <div className="text-xs text-slate-400 animate-pulse pl-12 flex items-center gap-2">
            <div className="h-4 w-4 relative rounded-full overflow-hidden">
                <Image src={aiLogo} alt=".." fill className="object-cover" />
            </div>
            Nexus is thinking...
            </div>}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 bg-white dark:bg-zinc-900 border-t border-slate-100 dark:border-zinc-800 flex flex-col gap-2">
          {attachment && (
              <div className="relative inline-block w-fit">
                  <img src={attachment} alt="Preview" className="h-16 rounded-lg border border-slate-200" />
                  <button onClick={() => setAttachment(null)} className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"><X size={10}/></button>
              </div>
          )}
          
          <div className="bg-secondary/50 dark:bg-muted/50 rounded-xl p-1 flex items-center gap-1 border border-border">
             <button onClick={() => userFileInputRef.current?.click()} className="p-2 text-slate-400 hover:text-[#5a47c7] hover:bg-[#5a47c7]/5 rounded-lg transition-colors"><Paperclip size={18} /></button>
             <button  className="p-2 text-slate-400 hover:text-[#5a47c7] hover:bg-[#5a47c7]/5 rounded-lg transition-colors"><Camera size={18} /></button>
             <input type="file" ref={userFileInputRef} className="hidden" accept="image/*"   />
             <input
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === "Enter" && handleSend()}
               placeholder={isRecording ? "Listening..." : "Message..."}
               className={cn("flex-1 bg-transparent px-2 py-3 text-sm focus:outline-none text-slate-800 dark:text-slate-100", isRecording && "placeholder:text-red-500 animate-pulse")}
             />
             
             <button className={cn("p-2 rounded-lg transition-colors", isRecording ? "bg-red-100 text-red-600 animate-pulse" : "text-slate-400 hover:text-indigo-600 hover:bg-indigo-50")}>
                 <Mic size={18} />
             </button>
             
             <button onClick={handleSend} disabled={!input.trim() && !attachment} className="p-2.5 bg-[#5a47c7] text-white rounded-lg hover:bg-[#5a47c7]/90 disabled:opacity-50 transition-all shadow-md shadow-[#5a47c7]/20 dark:shadow-none"><Send size={16} /></button>
          </div>
        </div>
      </div>

      <button onClick={() => setisWindowOpen(!isWindowOpen)} className={cn("h-14 w-14 rounded-full bg-[#5a47c7] text-white shadow-xl shadow-[#5a47c7]/30 flex items-center justify-center hover:bg-[#5a47c7]/90 transition-all hover:scale-105 active:scale-95 group overflow-hidden relative", isWindowOpen ? "rotate-90" : "rotate-0")}>
        {isWindowOpen ? <X size={24} /> : <div className="w-10 h-10 relative"><Image src={aiLogo} alt="AI" fill className="object-cover" /></div>}
      </button>
    </div>
  );
}
