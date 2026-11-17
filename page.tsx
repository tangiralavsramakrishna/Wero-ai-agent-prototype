"use client";
import { useEffect, useRef, useState } from "react";

type Message={role:"user"|"assistant";content:string};
type Booking={id:string;doctor:string;specialty:string;clinic:string;date:string;time:string;status:string};
declare global { interface Window { SpeechRecognition?: any; webkitSpeechRecognition?: any; } }

export default function Home(){
  const [messages,setMessages]=useState<Message[]>([{role:"assistant",content:"Hello! I'm WERO AI. Tell me which doctor you'd like to consult and when. You can type or use the microphone."}]);
  const [input,setInput]=useState("");
  const [busy,setBusy]=useState(false);
  const [listening,setListening]=useState(false);
  const [bookings,setBookings]=useState<Booking[]>([]);
  const [error,setError]=useState("");
  const chatEnd=useRef<HTMLDivElement>(null);
  const recognition=useRef<any>(null);
  useEffect(()=>{chatEnd.current?.scrollIntoView({behavior:"smooth"});},[messages,busy]);
  useEffect(()=>()=>{recognition.current?.stop();},[]);
  async function send(text=input){
    const value=text.trim(); if(!value||busy)return;
    setInput("");setError("");
    const next=[...messages,{role:"user" as const,content:value}];
    setMessages(next);setBusy(true);
    try{
      const res=await fetch("/api/agent",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({messages:next})});
      const data=await res.json();
      if(!res.ok)throw new Error(data.error||"Request failed");
      setMessages(m=>[...m,{role:"assistant",content:data.reply}]);
      setBookings(data.bookings||[]);
    }catch(e:any){setError(e.message||"Something went wrong.");}
    finally{setBusy(false);}
  }
  function toggleMic(){
    const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
    if(!SR){setError("Voice input is not supported in this browser. Please use Chrome or Edge, or type your request.");return;}
    if(listening){recognition.current?.stop();setListening(false);return;}
    const r=new SR();recognition.current=r;r.lang="en-IN";r.interimResults=false;r.continuous=false;
    r.onresult=(event:any)=>{const spoken=event.results[0][0].transcript;setInput(spoken);setListening(false);send(spoken);};
    r.onerror=()=>{setListening(false);setError("Microphone access failed. Allow microphone permission and try again.");};
    r.onend=()=>setListening(false);
    r.start();setListening(true);setError("");
  }
  const doctors=[["AR","Dr. Ananya Rao","Dermatology","SkinCare Clinic · Madhapur"],["RS","Dr. Rahul Sharma","Dentistry","Smile Dental Care · Gachibowli"],["MR","Dr. Meera Reddy","Psychiatry","MindWell Clinic · Kondapur"],["KK","Dr. Kiran Kumar","Dentistry","WERO Dental Centre · Kukatpally"],["PN","Dr. Priya Nair","Dermatology","ClearSkin Clinic · Jubilee Hills"],["AR","Dr. Arjun Rao","Psychiatry","MindCare · Banjara Hills"]];
  return <div className="shell">
    <header className="topbar"><div className="brand"><div className="logo">✚</div>WERO <span style={{fontWeight:500,color:"#b8cce2"}}>AI</span></div><div className="topmeta">FOUNDER DEMONSTRATION · DUMMY DATA</div></header>
    <main className="main">
      <section className="intro"><div className="eyebrow">A smarter way to access healthcare</div><h1>Your healthcare.<br/>Just one conversation away.</h1><p className="lead">Meet WERO AI — a voice-first appointment assistant. Tell it which doctor you want, when you want to visit, and let it take care of the booking flow.</p><div className="pills"><span className="pill">✦ Natural conversation</span><span className="pill">◉ Voice-enabled</span><span className="pill">⌁ Instant slot checks</span></div><div style={{marginTop:34,color:"#7e8da1",fontSize:12,lineHeight:1.8}}>DEMO CAPABILITIES<br/><strong style={{color:"#304b6b"}}>Doctor discovery · Availability · Booking confirmation · Appointment history</strong></div></section>
      <section className="panel"><div className="panelhead"><div><div className="paneltitle">Talk to WERO AI</div><div style={{fontSize:11,color:"#b9cbe0",marginTop:4}}>Your personal booking assistant</div></div><div className="live"><span className="dot"/> READY</div></div>
        <div className="chat">{messages.map((m,i)=><div key={i} className={`msg ${m.role==="user"?"user":"bot"}`}>{m.content}</div>)}{busy&&<div className="msg bot">Checking doctors and appointment availability…</div>}<div ref={chatEnd}/></div>
        <div className="composer"><div className="composerrow"><button className={`mic ${listening?"active":""}`} onClick={toggleMic} title="Speak your booking request">{listening?"■":"🎙"}</button><input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Say or type: Book Dr. Ananya tomorrow at 5 PM"/><button className="send" onClick={()=>send()} disabled={busy||!input.trim()}>Send</button></div><div className="hint">{listening?"Listening… Speak clearly.":"Tap the microphone and speak. Your browser will ask for microphone permission."} The AI will check the dummy schedule and ask you to confirm before booking.</div><div className="suggestions"><button className="suggestion" onClick={()=>send("Book Dr. Ananya Rao, Dermatologist, on 25 November 2026 at 5 PM")}>Book a dermatologist</button><button className="suggestion" onClick={()=>send("Find a dentist in Gachibowli tomorrow afternoon")}>Find a dentist nearby</button><button className="suggestion" onClick={()=>send("Book Dr. Meera Reddy, Psychiatrist, on 26 November 2026 at 5 PM")}>Book a psychiatrist</button></div>{error&&<div style={{color:"#b53b48",fontSize:12,marginTop:10}}>{error}</div>}</div>
      </section>
      <aside className="side">
        <section className="panel info"><h3>Demo doctor network</h3>{doctors.map((d,i)=><div className="doctor" key={i}><div className="avatar">{d[0]}</div><div><div className="docname">{d[1]}</div><div className="docmeta">{d[2]} · {d[3]}</div></div><span className="status">Available</span></div>)}</section>
        <section className="panel booking"><h3>Appointment activity</h3>{bookings.length===0?<div className="empty">No demo bookings yet. Complete a booking conversation to see it here.</div>:bookings.slice().reverse().map(b=><div className="bookingcard" key={b.id}><strong>{b.doctor}</strong><p>{b.specialty} · {b.clinic}<br/>{b.date} at {b.time}<br/>Reference: {b.id}</p><span className="status">{b.status}</span></div>)}</section>
      </aside>
    </main>
    <footer className="footer">WERO AI Founder Demo · Independent prototype · All doctors and appointments are fictional. No real appointments are created.</footer>
  </div>;
}