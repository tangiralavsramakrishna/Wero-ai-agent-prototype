import OpenAI from "openai";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const doctors = [
  { id:"DOC101", name:"Dr. Ananya Rao", specialty:"Dermatology", clinic:"SkinCare Clinic, Madhapur", address:"Madhapur, Hyderabad", slots:["4:00 PM","5:00 PM","6:00 PM"] },
  { id:"DOC102", name:"Dr. Rahul Sharma", specialty:"Dentistry", clinic:"Smile Dental Care, Gachibowli", address:"Gachibowli, Hyderabad", slots:["10:00 AM","4:00 PM","5:00 PM"] },
  { id:"DOC103", name:"Dr. Meera Reddy", specialty:"Psychiatry", clinic:"MindWell Clinic, Kondapur", address:"Kondapur, Hyderabad", slots:["11:00 AM","3:00 PM","5:00 PM"] },
  { id:"DOC104", name:"Dr. Kiran Kumar", specialty:"Dentistry", clinic:"WERO Dental Centre, Kukatpally", address:"Kukatpally, Hyderabad", slots:["11:00 AM","3:00 PM","6:00 PM"] },
  { id:"DOC105", name:"Dr. Priya Nair", specialty:"Dermatology", clinic:"ClearSkin Clinic, Jubilee Hills", address:"Jubilee Hills, Hyderabad", slots:["12:00 PM","4:00 PM","5:00 PM"] },
  { id:"DOC106", name:"Dr. Arjun Rao", specialty:"Psychiatry", clinic:"MindCare, Banjara Hills", address:"Banjara Hills, Hyderabad", slots:["10:00 AM","4:00 PM","6:00 PM"] }
];

type Booking = { id:string; doctor:string; specialty:string; clinic:string; date:string; time:string; status:string };
const demoBookings: Booking[] = [];

const tools: any[] = [
  { type:"function", function:{ name:"search_doctors", description:"Search the demo doctor directory by name, specialty or area.", parameters:{ type:"object", properties:{ query:{type:"string"} }, required:["query"], additionalProperties:false } } },
  { type:"function", function:{ name:"check_availability", description:"Check demo availability for a doctor on a date and time.", parameters:{ type:"object", properties:{ doctor_name:{type:"string"}, date:{type:"string"}, time:{type:"string"} }, required:["doctor_name","date","time"], additionalProperties:false } } },
  { type:"function", function:{ name:"create_demo_booking", description:"Create a dummy appointment only after the user explicitly confirms the exact doctor, date and time.", parameters:{ type:"object", properties:{ doctor_name:{type:"string"}, date:{type:"string"}, time:{type:"string"} }, required:["doctor_name","date","time"], additionalProperties:false } } }
];

function runTool(name:string,args:any) {
  if(name==="search_doctors") {
    const q=String(args.query||"").toLowerCase();
    const matches=doctors.filter(d => `${d.name} ${d.specialty} ${d.clinic} ${d.address}`.toLowerCase().includes(q));
    return matches.length ? matches : doctors.filter(d=>d.specialty.toLowerCase().includes(q));
  }
  if(name==="check_availability") {
    const d=doctors.find(x=>x.name.toLowerCase()===String(args.doctor_name).toLowerCase());
    if(!d) return {available:false,message:"Doctor not found in demo directory."};
    const busy=demoBookings.some(b=>b.doctor===d.name && b.date.toLowerCase()===String(args.date).toLowerCase() && b.time.toLowerCase()===String(args.time).toLowerCase());
    return {doctor:d.name,clinic:d.clinic,date:args.date,time:args.time,available:d.slots.some(s=>s.toLowerCase()===String(args.time).toLowerCase())&&!busy,alternatives:d.slots};
  }
  if(name==="create_demo_booking") {
    const d=doctors.find(x=>x.name.toLowerCase()===String(args.doctor_name).toLowerCase());
    if(!d) return {success:false,message:"Doctor not found."};
    const busy=demoBookings.some(b=>b.doctor===d.name && b.date.toLowerCase()===String(args.date).toLowerCase() && b.time.toLowerCase()===String(args.time).toLowerCase());
    if(!d.slots.some(s=>s.toLowerCase()===String(args.time).toLowerCase())||busy) return {success:false,message:"That slot is unavailable. Please check availability again."};
    const booking={id:`WERO-DEMO-${demoBookings.length+1001}`,doctor:d.name,specialty:d.specialty,clinic:d.clinic,date:args.date,time:args.time,status:"CONFIRMED (DEMO)"};
    demoBookings.push(booking);
    return {success:true,booking};
  }
  return {error:"Unknown tool"};
}

export async function POST(req:NextRequest) {
  const key=process.env.GEMINI_API_KEY;
  if(!key) return NextResponse.json({error:"Gemini is not configured. Add GEMINI_API_KEY in Vercel environment variables."},{status:503});
  try {
    const {messages}=await req.json();
    const client=new OpenAI({apiKey:key,baseURL:"https://generativelanguage.googleapis.com/v1beta/openai/"});
    const system=`You are WERO AI, a friendly healthcare appointment booking assistant for a founder demonstration using fictional dummy data only. Never claim a real appointment has been made. Supported specialties: Dentistry, Dermatology and Psychiatry. Today is 17 November 2026. Ask a concise clarification if doctor, date or time is ambiguous. Search the directory when needed. Always check availability before offering a slot. Show doctor, specialty, clinic, date and time and ask the user to explicitly confirm before calling create_demo_booking. Only call create_demo_booking after explicit confirmation. If unavailable, suggest available times. Do not provide medical diagnosis or treatment advice. Be concise and natural for spoken conversation.`;
    let chat:any[]=[{role:"system",content:system},...(messages||[]).slice(-12)];
    for(let i=0;i<5;i++){
      const completion=await client.chat.completions.create({
        model:process.env.GEMINI_MODEL||"gemini-3.8-flash",
        messages:chat,tools,tool_choice:"auto",temperature:0.2
      });
      const msg=completion.choices[0].message;
      if(!msg.tool_calls?.length) return NextResponse.json({reply:msg.content||"Sorry, I couldn't complete that request.",bookings:demoBookings});
      chat.push(msg);
      for(const call of msg.tool_calls){
        const args=JSON.parse(call.function.arguments||"{}");
        chat.push({role:"tool",tool_call_id:call.id,content:JSON.stringify(runTool(call.function.name,args))});
      }
    }
    return NextResponse.json({reply:"I couldn't complete that step. Please try again.",bookings:demoBookings});
  } catch(e:any) {
    console.error("Gemini API error:",e);
    const detail=e?.status===429?"Gemini free-tier limit reached. Wait and try again later.":e?.status===403||e?.status===400?"Gemini rejected the request. Check that the API key and selected model are available to your AI Studio project.":"Gemini could not process this request. Check your API key and try again.";
    return NextResponse.json({error:detail},{status:500});
  }
}
