import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue, set, update, remove } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyCFjUGrFbhdt5N0_zZTHwSU_VqFqmUMvAA",
  authDomain: "yugrill-stock.firebaseapp.com",
  projectId: "yugrill-stock",
  storageBucket: "yugrill-stock.firebasestorage.app",
  messagingSenderId: "949440911718",
  appId: "1:949440911718:web:3e5ebed1cc026cafbf10a7",
  databaseURL: "https://yugrill-stock-default-rtdb.asia-southeast1.firebasedatabase.app",
};
const firebaseApp = initializeApp(firebaseConfig);
const db = getDatabase(firebaseApp);

const LOGO_SRC = "data:image/png;base64,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";

const DEFAULT_CATEGORIES = ["ผัก/ผลไม้","เนื้อสัตว์/อาหารทะเล","เครื่องปรุง","วัตถุดิบแห้ง","เครื่องดื่ม","บรรจุภัณฑ์","อื่นๆ"];
const DEFAULT_UNITS = ["กก.","กรัม","ลิตร","มล.","ขวด","กล่อง","ถุง","ชิ้น","โหล","แพ็ค"];
const DEFAULT_ZONES = ["ครัว","หน้าบ้าน","บาร์","คลังสินค้า","อื่นๆ"];
const ZONE_COLORS = {
  "ครัว":{"bg":"#fff3e0","accent":"#e65100","light":"#ffe0b2","icon":"👨‍🍳"},
  "หน้าบ้าน":{"bg":"#e3f2fd","accent":"#1565c0","light":"#bbdefb","icon":"🪑"},
  "บาร์":{"bg":"#f3e5f5","accent":"#6a1b9a","light":"#e1bee7","icon":"🍹"},
  "คลังสินค้า":{"bg":"#eceff1","accent":"#37474f","light":"#cfd8dc","icon":"🏭"},
  "อื่นๆ":{"bg":"#f9fbe7","accent":"#558b2f","light":"#dcedc8","icon":"📦"},
};
const CAT_COLORS = {
  "ผัก/ผลไม้":{"bg":"#e8f5e9","accent":"#2e7d32","light":"#c8e6c9"},
  "เนื้อสัตว์/อาหารทะเล":{"bg":"#fce4ec","accent":"#c62828","light":"#f8bbd9"},
  "เครื่องปรุง":{"bg":"#fff3e0","accent":"#e65100","light":"#ffe0b2"},
  "วัตถุดิบแห้ง":{"bg":"#fff8e1","accent":"#f57f17","light":"#ffecb3"},
  "เครื่องดื่ม":{"bg":"#e3f2fd","accent":"#1565c0","light":"#bbdefb"},
  "บรรจุภัณฑ์":{"bg":"#f3e5f5","accent":"#6a1b9a","light":"#e1bee7"},
  "อื่นๆ":{"bg":"#eceff1","accent":"#37474f","light":"#cfd8dc"},
};
const STOCK_STATUS = {
  low:   {label:"น้อยมาก",icon:"🔴",color:"#c62828",bg:"#ffebee",border:"#ef9a9a"},
  normal:{label:"ปกติ",   icon:"🟡",color:"#e65100",bg:"#fff8f0",border:"#ffcc80"},
  high:  {label:"มีมาก",  icon:"🟢",color:"#2e7d32",bg:"#e8f5e9",border:"#a5d6a7"},
};
const DEF_ZONE = {bg:"#f0f4ff",accent:"#3949ab",light:"#c5cae9",icon:"📍"};
const DEF_CAT  = {bg:"#f0f4ff",accent:"#3949ab",light:"#c5cae9"};
const getZC = z => ZONE_COLORS[z] || DEF_ZONE;
const getCC = c => CAT_COLORS[c] || DEF_CAT;
const getSt = s => STOCK_STATUS[s] || STOCK_STATUS.normal;
const today = () => new Date().toISOString().split("T")[0];
const NAV = [{id:"stock",icon:"📦",label:"สต๊อค"},{id:"log",icon:"📋",label:"ประวัติ"},{id:"summary",icon:"📊",label:"สรุป 🔒"},{id:"settings",icon:"⚙️",label:"ตั้งค่า"}];
const INIT_ITEMS = [
  {id:"item_1",name:"หมูสามชั้น",category:"เนื้อสัตว์/อาหารทะเล",qty:5,unit:"กก.",status:"normal",zone:"ครัว"},
  {id:"item_2",name:"ผักบุ้ง",category:"ผัก/ผลไม้",qty:2,unit:"กก.",status:"low",zone:"ครัว"},
  {id:"item_3",name:"น้ำมันพืช",category:"เครื่องปรุง",qty:4,unit:"ลิตร",status:"normal",zone:"ครัว"},
  {id:"item_4",name:"ข้าวสาร",category:"วัตถุดิบแห้ง",qty:20,unit:"กก.",status:"high",zone:"คลังสินค้า"},
  {id:"item_5",name:"น้ำดื่ม",category:"เครื่องดื่ม",qty:12,unit:"ขวด",status:"high",zone:"หน้าบ้าน"},
];

// ─── Theme definitions ────────────────────────────────────────────
const THEMES = {
  light:{
    bg:"#f5f0eb", card:"#fff", cardAlt:"#fafafa",
    border:"#e0e0e0", borderStrong:"#d0d0d0",
    text:"#1a1a1a", textSub:"#555", textMuted:"#888", textFaint:"#bbb",
    header:"#1c1c1c", headerText:"#fff",
    sidebar:"#fff", sidebarBorder:"#ede8e2", sidebarActive:"#fff8f0",
    navBg:"#fff", navBorder:"#ebebeb",
    input:"#fafafa", inputBorder:"#e0e0e0",
    tag:"#f0f0f0", tagText:"#aaa",
    lowBg:"#ffebee", lowBorder:"#ef9a9a", lowText:"#c62828", lowTextDark:"#b71c1c",
    overviewBg:"#f7f3ee",
    modalBg:"rgba(0,0,0,.55)", modalCard:"#fff",
    pinBtn:"#fafafa", pinBtnBorder:"#ebebeb", pinBtnText:"#1c1c1c",
    unchanged:"#f0f0f0", unchangedBorder:"#e0e0e0",
    logHeader:"#1c1c1c", logHeaderSub:"#2a2a2a",
    fbBg:"#e8f5e9", fbBorder:"#a5d6a7", fbText:"#2e7d32", fbTextSub:"#81c784",
    summaryCard:"#f5f5f5", summaryCardBorder:"#e0e0e0",
    overlay:"#2a2a2a",
  },
  dark:{
    bg:"#121212", card:"#1e1e1e", cardAlt:"#252525",
    border:"#333", borderStrong:"#444",
    text:"#f0f0f0", textSub:"#bbb", textMuted:"#888", textFaint:"#555",
    header:"#0d0d0d", headerText:"#f0f0f0",
    sidebar:"#1a1a1a", sidebarBorder:"#2a2a2a", sidebarActive:"#2a1f0a",
    navBg:"#1a1a1a", navBorder:"#2a2a2a",
    input:"#252525", inputBorder:"#3a3a3a",
    tag:"#2a2a2a", tagText:"#666",
    lowBg:"#2d1515", lowBorder:"#5a2020", lowText:"#ef5350", lowTextDark:"#e57373",
    overviewBg:"#1a1a1a",
    modalBg:"rgba(0,0,0,.75)", modalCard:"#1e1e1e",
    pinBtn:"#252525", pinBtnBorder:"#3a3a3a", pinBtnText:"#f0f0f0",
    unchanged:"#222", unchangedBorder:"#333",
    logHeader:"#0d0d0d", logHeaderSub:"#1a1a1a",
    fbBg:"#0d1f0f", fbBorder:"#1a4a1a", fbText:"#4caf50", fbTextSub:"#2e7d32",
    summaryCard:"#252525", summaryCardBorder:"#3a3a3a",
    overlay:"#333",
  }
};

// ─── Shared input style (no re-creation per render) ─────────────
const inputSt = {width:"100%",padding:"11px 14px",borderRadius:10,border:"1.5px solid #e0e0e0",fontFamily:"inherit",fontSize:15,boxSizing:"border-box",background:"#fafafa"};
const inputAttr = {autoComplete:"off",autoCorrect:"off",autoCapitalize:"off",spellCheck:false};

// ─── Stable components outside App ──────────────────────────────

function Chip({bg,accent,light,children,onDelete,T}){
  const realBg = T?.isDark ? "rgba(255,255,255,.07)" : bg;
  const realLight = T?.isDark ? "rgba(255,255,255,.15)" : light;
  return(
    <div style={{display:"flex",alignItems:"center",gap:5,background:realBg,borderRadius:50,padding:"6px 10px 6px 13px",border:"1.5px solid "+realLight}}>
      <span style={{fontSize:13,fontWeight:600,color:accent}}>{children}</span>
      {onDelete&&<button onClick={onDelete} style={{background:"rgba(255,255,255,.12)",border:"none",borderRadius:"50%",width:17,height:17,cursor:"pointer",color:"#ef5350",fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,flexShrink:0}}>×</button>}
    </div>
  );
}

function Modal({children,maxW=500,mob,onClose,T}){
  const bg = T ? T.modalCard : "#fff";
  const overlay = T ? T.modalBg : "rgba(0,0,0,.55)";
  return(
    <div onClick={e=>{if(e.target===e.currentTarget)onClose();}} style={{position:"fixed",inset:0,background:overlay,zIndex:1000,display:"flex",alignItems:mob?"flex-end":"center",justifyContent:"center",padding:mob?0:24}}>
      <div style={{background:bg,borderRadius:mob?"20px 20px 0 0":16,padding:mob?"18px 18px 40px":"26px",width:"100%",maxWidth:mob?9999:maxW,maxHeight:"92vh",overflowY:"auto"}}>
        {mob&&<div style={{width:36,height:4,background:"rgba(128,128,128,.3)",borderRadius:2,margin:"0 auto 16px"}}/>}
        {children}
      </div>
    </div>
  );
}

function PinPad({pinInput,pinError,onPress,onBack,onCancel,title,subtitle,icon,T}){
  const btnBg = T ? T.pinBtn : "#fafafa";
  const btnBorder = T ? T.pinBtnBorder : "#ebebeb";
  const btnText = T ? T.pinBtnText : "#1c1c1c";
  const dotFilled = pinError ? "#ef5350" : (T?.isDark ? "#e8a020" : "#1c1c1c");
  const dotEmpty = T?.isDark ? "#333" : "#e0e0e0";
  return(
    <div style={{textAlign:"center"}}>
      <div style={{fontSize:40,marginBottom:8}}>{icon}</div>
      <div style={{fontWeight:800,fontSize:17,marginBottom:4,color:T?.text}}>{title}</div>
      <div style={{fontSize:13,color:T?.textMuted||"#aaa",marginBottom:22}}>{subtitle}</div>
      <div style={{display:"flex",justifyContent:"center",gap:10,marginBottom:22}}>
        {[0,1,2,3,4,5].map(i=><div key={i} style={{width:13,height:13,borderRadius:"50%",background:i<pinInput.length?dotFilled:dotEmpty,transition:"background .15s"}}/>)}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:9,marginBottom:9}}>
        {[1,2,3,4,5,6,7,8,9].map(n=><button key={n} onClick={()=>onPress(String(n))} style={{padding:"14px 0",borderRadius:12,border:"1.5px solid "+btnBorder,background:btnBg,fontFamily:"inherit",fontSize:20,fontWeight:700,cursor:"pointer",color:btnText}}>{n}</button>)}
        <div/><button onClick={()=>onPress("0")} style={{padding:"14px 0",borderRadius:12,border:"1.5px solid "+btnBorder,background:btnBg,fontFamily:"inherit",fontSize:20,fontWeight:700,cursor:"pointer",color:btnText}}>0</button>
        <button onClick={onBack} style={{padding:"14px 0",borderRadius:12,border:"1.5px solid "+btnBorder,background:btnBg,fontFamily:"inherit",fontSize:20,cursor:"pointer",color:T?.textMuted||"#888"}}>⌫</button>
      </div>
      {pinError&&<div style={{color:"#ef5350",fontWeight:700,fontSize:13,marginBottom:8}}>PIN ไม่ถูกต้อง</div>}
      {onCancel&&<button onClick={onCancel} style={{width:"100%",padding:12,borderRadius:11,border:"1.5px solid "+(T?.border||"#ddd"),background:T?.card||"#fff",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:14,marginTop:4,color:T?.text||"#1c1c1c"}}>ยกเลิก</button>}
    </div>
  );
}

// ─── ItemCard (stable, outside App) ─────────────────────────────
function ItemCard({item,delta,mob,onMinus,onPlus,onDeltaChange,onEdit,onDelete,onStatus,T}){
  const display=item.qty+delta, changed=delta!==0;
  const st=getSt(item.status), col=getCC(item.category), zc=getZC(item.zone);
  const isDark = T?.isDark;
  const cardBg = T ? T.card : "#fff";
  const colBg = isDark ? "rgba(255,255,255,.06)" : col.bg;
  const zcBg = isDark ? "rgba(255,255,255,.04)" : zc.bg;
  const zcLight = isDark ? "rgba(255,255,255,.15)" : zc.light;
  const stBg = isDark ? "rgba(255,255,255,.06)" : st.bg;
  const editBtnBg = isDark ? "#2a2a2a" : "#f5f5f5";
  const delBtnBg = isDark ? "#2d1515" : "#fff0f0";
  const textColor = T ? T.text : "#1a1a1a";
  const inputBg = isDark ? "#1a1a1a" : "#fff";
  const handleDelta = useCallback(e=>{
    const v=parseInt(e.target.value)||0;
    if(item.qty+v<0)return;
    onDeltaChange(item.id,v);
  },[item.id,item.qty,onDeltaChange]);
  return(
    <div style={{background:cardBg,borderRadius:14,overflow:"hidden",boxShadow:changed?"0 0 0 2px "+zc.accent+",0 4px 16px rgba(0,0,0,.15)":"0 1px 8px rgba(0,0,0,.12)",borderLeft:"4px solid "+st.border}}>
      <div style={{padding:"12px 13px 9px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:8}}>
          <div style={{flex:1,minWidth:0}}>
            <div style={{fontWeight:800,fontSize:15,marginBottom:4,color:textColor}}>{item.name}</div>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              <span style={{background:colBg,color:col.accent,borderRadius:5,padding:"1px 7px",fontSize:11,fontWeight:600}}>{item.category}</span>
              <span style={{background:stBg,color:st.color,borderRadius:5,padding:"1px 7px",fontSize:11,fontWeight:700}}>{st.icon} {st.label}</span>
            </div>
          </div>
          <div style={{display:"flex",gap:5,marginLeft:8,flexShrink:0}}>
            <button onClick={()=>onEdit(item)} style={{background:editBtnBg,border:"none",borderRadius:7,width:34,height:34,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
            <button onClick={()=>onDelete(item.id)} style={{background:delBtnBg,border:"none",borderRadius:7,width:34,height:34,cursor:"pointer",fontSize:14,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
          </div>
        </div>
        <div style={{display:"flex",gap:5}}>
          {Object.entries(STOCK_STATUS).map(([k,v])=>{
            const isActive = item.status===k;
            const activeBg = isDark ? "rgba(255,255,255,.1)" : v.bg;
            return(
            <button key={k} onClick={()=>onStatus(item.id,k)} style={{flex:1,padding:"6px 3px",borderRadius:8,border:isActive?"2px solid "+v.color:"1.5px solid "+(isDark?"#333":"#e8e8e8"),background:isActive?activeBg:(isDark?"#252525":"#fafafa"),cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:isActive?800:400,color:isActive?v.color:(isDark?"#666":"#bbb")}}>
              {v.icon} {v.label}
            </button>
          );})}
        </div>
      </div>
      <div style={{background:zcBg,padding:"10px 13px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <span style={{fontSize:28,fontWeight:800,color:zc.accent,lineHeight:1}}>{display}</span>
          <span style={{fontSize:13,color:T?.textMuted||"#777",marginLeft:5}}>{item.unit}</span>
          {changed&&<div style={{fontSize:11,color:delta>0?"#4caf50":"#ef5350",fontWeight:700,marginTop:1}}>{delta>0?"+"+delta:delta} จากเดิม</div>}
        </div>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <button onClick={()=>onMinus(item.id)} style={{width:mob?42:36,height:mob?42:36,borderRadius:9,background:inputBg,border:"2px solid "+zcLight,cursor:"pointer",fontSize:18,fontWeight:800,color:zc.accent,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
          <input
            type="number"
            value={delta===0?"":delta}
            onChange={handleDelta}
            placeholder="0"
            {...inputAttr}
            style={{width:54,textAlign:"center",border:"2px solid "+zcLight,borderRadius:8,padding:"6px 4px",fontFamily:"inherit",fontSize:14,fontWeight:800,background:inputBg,color:zc.accent}}
          />
          <button onClick={()=>onPlus(item.id)} style={{width:mob?42:36,height:mob?42:36,borderRadius:9,background:zc.accent,border:"none",cursor:"pointer",fontSize:18,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
        </div>
      </div>
    </div>
  );
}

// ─── ItemGridCell (compact 9×9 grid view) ────────────────────────
function ItemGridCell({item,delta,onMinus,onPlus,onEdit,T}){
  const display=item.qty+delta, changed=delta!==0;
  const st=getSt(item.status), col=getCC(item.category), zc=getZC(item.zone);
  const isDark=T?.isDark;
  const cardBg=T?T.card:"#fff";
  const stBorder=st.border;
  const accentColor=zc.accent;
  return(
    <div onClick={()=>onEdit(item)} style={{background:cardBg,borderRadius:12,overflow:"hidden",boxShadow:changed?"0 0 0 2px "+accentColor+",0 2px 10px rgba(0,0,0,.18)":"0 1px 6px rgba(0,0,0,.13)",borderTop:"3px solid "+stBorder,cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",padding:"10px 6px 8px",gap:4,position:"relative",minHeight:100}}>
      {changed&&<div style={{position:"absolute",top:4,right:5,fontSize:10,fontWeight:800,color:delta>0?"#4caf50":"#ef5350",background:isDark?"rgba(0,0,0,.5)":"rgba(255,255,255,.9)",borderRadius:4,padding:"1px 4px"}}>{delta>0?"+"+delta:delta}</div>}
      <div style={{fontSize:10,fontWeight:700,color:st.color,lineHeight:1}}>{st.icon}</div>
      <div style={{fontWeight:800,fontSize:12,color:T?.text||"#1a1a1a",textAlign:"center",lineHeight:1.3,maxWidth:"100%",overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>{item.name}</div>
      <div style={{fontWeight:800,fontSize:18,color:accentColor,lineHeight:1}}>{display}</div>
      <div style={{fontSize:9,color:T?.textMuted||"#888"}}>{item.unit}</div>
      <div style={{display:"flex",gap:4,marginTop:2}} onClick={e=>e.stopPropagation()}>
        <button onClick={()=>onMinus(item.id)} style={{width:26,height:26,borderRadius:7,background:isDark?"#2a2a2a":"#f0f0f0",border:"1.5px solid "+(isDark?"#444":"#ddd"),cursor:"pointer",fontSize:14,fontWeight:800,color:accentColor,display:"flex",alignItems:"center",justifyContent:"center"}}>−</button>
        <button onClick={()=>onPlus(item.id)} style={{width:26,height:26,borderRadius:7,background:accentColor,border:"none",cursor:"pointer",fontSize:14,fontWeight:800,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>+</button>
      </div>
    </div>
  );
}

// ─── App ─────────────────────────────────────────────────────────
export default function App(){
  // ── State ──
  const [items,setItems]               = useState([]);
  const [categories,setCategories]     = useState(DEFAULT_CATEGORIES);
  const [units,setUnits]               = useState(DEFAULT_UNITS);
  const [zones,setZones]               = useState(DEFAULT_ZONES);
  const [logs,setLogs]                 = useState([]);
  const [pendingChanges,setPendingChanges] = useState({});
  const [dbReady,setDbReady]           = useState(false);
  const [syncing,setSyncing]           = useState(false);
  const [page,setPage]                 = useState("stock");
  const [showModal,setShowModal]       = useState(null);
  const [editItem,setEditItem]         = useState(null);
  const [toast,setToast]               = useState(null);
  const [filterZone,setFilterZone]     = useState("ทั้งหมด");
  const [filterStatus,setFilterStatus] = useState("ทั้งหมด");
  const [search,setSearch]             = useState("");
  const [staffName,setStaffName]       = useState("");
  const [logDate,setLogDate]           = useState(today());
  const [summaryDate,setSummaryDate]   = useState(today());
  const [formData,setFormData]         = useState({name:"",category:DEFAULT_CATEGORIES[0],qty:"",unit:DEFAULT_UNITS[0],status:"normal",zone:DEFAULT_ZONES[0]});
  const [newCatInput,setNewCatInput]   = useState("");
  const [newUnitInput,setNewUnitInput] = useState("");
  const [newZoneInput,setNewZoneInput] = useState("");
  const [ownerPin,setOwnerPin]         = useState("123456");
  const [pinUnlocked,setPinUnlocked]   = useState(false);
  const [pinInput,setPinInput]         = useState("");
  const [pinError,setPinError]         = useState(false);
  const [changePinStep,setChangePinStep] = useState(null);
  const [changePinVal,setChangePinVal] = useState("");
  const [changePinErr,setChangePinErr] = useState(false);
  const [logPinInput,setLogPinInput]   = useState("");
  const [logPinError,setLogPinError]   = useState(false);
  const [logPinUnlocked,setLogPinUnlocked] = useState(false);
  const [logAction,setLogAction]       = useState(null);
  const [editLogData,setEditLogData]   = useState(null);
  const [filterCategory,setFilterCategory] = useState("ทั้งหมด");
  const [viewMode,setViewMode]         = useState("list"); // "list" | "grid"
  const [sortCol,setSortCol]           = useState("status");
  const [sortDir,setSortDir]           = useState("asc");
  const [mob,setMob] = useState(()=>typeof window!=="undefined"?window.innerWidth<768:false);
  const [darkMode,setDarkMode] = useState(()=>{
    try{return localStorage.getItem("yugrill-dark")==="1";}catch{return false;}
  });
  const T = {...THEMES[darkMode?"dark":"light"], isDark:darkMode};

  // ── Resize ──
  useEffect(()=>{
    const fn=()=>setMob(window.innerWidth<768);
    window.addEventListener("resize",fn);
    return()=>window.removeEventListener("resize",fn);
  },[]);

  // ── Firebase ──
  useEffect(()=>{
    const unsubItems=onValue(ref(db,"items"),snap=>{
      const data=snap.val();
      if(data){setItems(Object.entries(data).map(([id,v])=>({...v,id})));}
      else{const seed={};INIT_ITEMS.forEach(it=>{seed[it.id]=it;});set(ref(db,"items"),seed);}
      setDbReady(true);
    });
    const unsubLogs=onValue(ref(db,"logs"),snap=>{
      const data=snap.val();
      if(data){setLogs(Object.entries(data).map(([id,v])=>({...v,id})).sort((a,b)=>b.timestamp_ms-a.timestamp_ms));}
      else{setLogs([]);}
    });
    const unsubSettings=onValue(ref(db,"settings"),snap=>{
      const data=snap.val();
      if(data){
        if(data.categories)setCategories(data.categories);
        if(data.units)setUnits(data.units);
        if(data.zones)setZones(data.zones);
        if(data.ownerPin)setOwnerPin(data.ownerPin);
      }else{
        set(ref(db,"settings"),{categories:DEFAULT_CATEGORIES,units:DEFAULT_UNITS,zones:DEFAULT_ZONES,ownerPin:"123456"});
      }
    });
    return()=>{unsubItems();unsubLogs();unsubSettings();};
  },[]);

  // ── Helpers ──
  const toast$=useCallback((msg,type="success")=>{setToast({msg,type});setTimeout(()=>setToast(null),2500);},[]);
  const sync=useCallback(async fn=>{setSyncing(true);try{await fn();}catch(e){toast;}finally{setSyncing(false);};},[toast$]);
  const navTo=useCallback(p=>{setPage(p);if(p!=="summary")setPinUnlocked(false);},[]);
  const closeModal=useCallback(()=>setShowModal(null),[]);
  const toggleDark=useCallback(()=>{
    setDarkMode(d=>{
      const next=!d;
      try{localStorage.setItem("yugrill-dark",next?"1":"0");}catch{}
      return next;
    });
  },[]);

  const pad=mob?"14px 16px":"22px 28px";
  const inputStT={...inputSt,background:T.input,borderColor:T.inputBorder,color:T.text};

  // ── Stock actions ──
  const onMinus=useCallback(id=>{
    const it=items.find(i=>i.id===id),cur=pendingChanges[id]??0;
    if(it.qty+cur-1<0)return;
    setPendingChanges(p=>({...p,[id]:cur-1}));
  },[items,pendingChanges]);
  const onPlus=useCallback(id=>{
    const it=items.find(i=>i.id===id),cur=pendingChanges[id]??0;
    setPendingChanges(p=>({...p,[id]:cur+1}));
  },[items,pendingChanges]);
  const onDeltaChange=useCallback((id,val)=>{
    const it=items.find(i=>i.id===id);
    if(it.qty+val<0)return;
    setPendingChanges(p=>({...p,[id]:val}));
  },[items]);
  const onStatus=useCallback((id,status)=>sync(async()=>{await update(ref(db,"items/"+id),{status});}),[sync]);
  const onEdit=useCallback(it=>{
    setFormData({name:it.name,category:it.category,qty:it.qty,unit:it.unit,status:it.status||"normal",zone:it.zone||DEFAULT_ZONES[0]});
    setEditItem(it);setShowModal("item");
  },[]);
  const onDelete=useCallback(id=>sync(async()=>{await remove(ref(db,"items/"+id));toast;}),[sync,toast$]);
  const openAdd=useCallback(()=>{
    setFormData({name:"",category:categories[0],qty:"",unit:units[0],status:"normal",zone:zones[0]});
    setEditItem(null);setShowModal("item");
  },[categories,units,zones]);
  const saveItem=useCallback(()=>{
    if(!formData.name.trim()||!formData.qty||!formData.unit||!formData.category){toast;return;}
    sync(async()=>{
      if(editItem){await update(ref(db,"items/"+editItem.id),{...formData,qty:parseFloat(formData.qty)});toast;}
      else{const k="item_"+Date.now();await set(ref(db,"items/"+k),{...formData,qty:parseFloat(formData.qty),id:k});toast;}
      setShowModal(null);
    });
  },[formData,editItem,sync,toast$]);

  // ── Confirm log ──
  const confirmLog=useCallback(()=>{
    if(!staffName.trim()){toast;return;}
    sync(async()=>{
      const changes=items.map(it=>{const d=pendingChanges[it.id]??0;return{itemId:it.id,itemName:it.name,category:it.category,unit:it.unit,before:it.qty,delta:d,after:it.qty+d};});
      const k="log_"+Date.now();
      const logData={id:k,date:logDate,staff:staffName.trim(),changes,timestamp:new Date().toLocaleTimeString("th-TH"),timestamp_ms:Date.now()};
      const updates={};
      items.forEach(it=>{const d=pendingChanges[it.id]??0;if(d!==0)updates["items/"+it.id+"/qty"]=it.qty+d;});
      updates["logs/"+k]=logData;
      await update(ref(db),updates);
      setPendingChanges({});setStaffName("");setShowModal(null);
      toast;
    });
  },[items,pendingChanges,staffName,logDate,sync,toast$]);

  // ── Settings ──
  const saveSettings=useCallback(patch=>sync(async()=>{await update(ref(db,"settings"),patch);}),[sync]);
  const addCat=useCallback(()=>{const v=newCatInput.trim();if(!v)return;if(categories.includes(v)){toast;return;}saveSettings({categories:[...categories,v]});setNewCatInput("");toast;},[newCatInput,categories,saveSettings,toast$]);
  const delCat=useCallback(c=>{if(items.some(i=>i.category===c)){toast;return;}saveSettings({categories:categories.filter(x=>x!==c)});toast;},[items,categories,saveSettings,toast$]);
  const addUnit=useCallback(()=>{const v=newUnitInput.trim();if(!v)return;if(units.includes(v)){toast;return;}saveSettings({units:[...units,v]});setNewUnitInput("");toast;},[newUnitInput,units,saveSettings,toast$]);
  const delUnit=useCallback(u=>{if(items.some(i=>i.unit===u)){toast;return;}saveSettings({units:units.filter(x=>x!==u)});toast;},[items,units,saveSettings,toast$]);
  const addZone=useCallback(()=>{const v=newZoneInput.trim();if(!v)return;if(zones.includes(v)){toast;return;}saveSettings({zones:[...zones,v]});setNewZoneInput("");toast;},[newZoneInput,zones,saveSettings,toast$]);
  const delZone=useCallback(z=>{if(items.some(i=>i.zone===z)){toast;return;}saveSettings({zones:zones.filter(x=>x!==z)});toast;},[items,zones,saveSettings,toast$]);

  // ── PIN ──
  const pressSummaryPin=useCallback(d=>{
    if(pinInput.length>=6)return;
    const n=pinInput+d;setPinInput(n);
    if(n.length===6)setTimeout(()=>{
      if(n===ownerPin){setPinUnlocked(true);setPinInput("");setPinError(false);}
      else{setPinError(true);setPinInput("");setTimeout(()=>setPinError(false),900);}
    },120);
  },[pinInput,ownerPin]);

  const openLogEdit=useCallback(log=>{
    setLogPinUnlocked(false);setLogPinInput("");setLogPinError(false);
    setLogAction({type:"edit",log});setShowModal("logPin");
  },[]);
  const openLogDelete=useCallback(log=>{
    setLogPinUnlocked(false);setLogPinInput("");setLogPinError(false);
    setLogAction({type:"delete",log});setShowModal("logPin");
  },[]);
  const doDeleteLog=useCallback(id=>sync(async()=>{
    await remove(ref(db,"logs/"+id));toast;
    setShowModal(null);setLogAction(null);setLogPinUnlocked(false);
  }),[sync,toast$]);
  const saveLogEdit=useCallback(()=>{
    if(!editLogData?.staff?.trim()){toast;return;}
    sync(async()=>{
      await update(ref(db,"logs/"+logAction.log.id),{staff:editLogData.staff.trim(),date:editLogData.date});
      toast;
      setShowModal(null);setLogAction(null);setLogPinUnlocked(false);setEditLogData(null);
    });
  },[editLogData,logAction,sync,toast$]);
  const pressLogPin=useCallback(d=>{
    if(logPinInput.length>=6)return;
    const n=logPinInput+d;setLogPinInput(n);
    if(n.length===6)setTimeout(()=>{
      if(n===ownerPin){
        setLogPinUnlocked(true);setLogPinInput("");setLogPinError(false);
        if(logAction?.type==="edit")setEditLogData({staff:logAction.log.staff,date:logAction.log.date});
        if(logAction?.type==="delete")doDeleteLog(logAction.log.id);
      }else{setLogPinError(true);setLogPinInput("");setTimeout(()=>setLogPinError(false),900);}
    },120);
  },[logPinInput,ownerPin,logAction,doDeleteLog]);

  // ── Derived ──
  const filteredItems=useMemo(()=>items.filter(it=>
    (filterZone==="ทั้งหมด"||it.zone===filterZone)&&
    (filterStatus==="ทั้งหมด"||it.status===filterStatus)&&
    (filterCategory==="ทั้งหมด"||it.category===filterCategory)&&
    it.name.toLowerCase().includes(search.toLowerCase())
  ),[items,filterZone,filterStatus,filterCategory,search]);

  const pendingCount=useMemo(()=>Object.values(pendingChanges).filter(v=>v!==0).length,[pendingChanges]);
  const lowItems=useMemo(()=>items.filter(i=>i.status==="low"),[items]);
  const summaryLogs=useMemo(()=>logs.filter(l=>l.date===summaryDate),[logs,summaryDate]);

  const sortedSummaryItems=useMemo(()=>{
    const statusOrder={low:0,normal:1,high:2};
    return[...items].sort((a,b)=>{
      let va,vb;
      if(sortCol==="name"){va=a.name;vb=b.name;}
      else if(sortCol==="qty"){va=a.qty;vb=b.qty;}
      else if(sortCol==="status"){va=statusOrder[a.status]??1;vb=statusOrder[b.status]??1;}
      else if(sortCol==="zone"){va=a.zone;vb=b.zone;}
      else if(sortCol==="category"){va=a.category;vb=b.category;}
      else{va=a.name;vb=b.name;}
      if(typeof va==="string")return sortDir==="asc"?va.localeCompare(vb,"th"):vb.localeCompare(va,"th");
      return sortDir==="asc"?va-vb:vb-va;
    });
  },[items,sortCol,sortDir]);

  const handleSort=useCallback(col=>{
    if(sortCol===col)setSortDir(d=>d==="asc"?"desc":"asc");
    else{setSortCol(col);setSortDir("asc");}
  },[sortCol]);

  // ── Loading ──
  if(!dbReady)return(
    <div style={{fontFamily:"'Sarabun','Noto Sans Thai',sans-serif",minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",background:T.bg,gap:16}}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>
      <img src={LOGO_SRC} alt="YuGrill" style={{width:90,height:90,borderRadius:"50%",objectFit:"cover"}}/>
      <div style={{fontWeight:800,fontSize:20,color:T.text}}>YuGrill Stock</div>
      <div style={{display:"flex",gap:6}}>
        {[0,1,2].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:"#e8a020",animation:"bounce 1s "+i*0.2+"s infinite"}}/>)}
      </div>
      <div style={{color:T.textMuted,fontSize:13}}>กำลังเชื่อมต่อ Firebase...</div>
      <style>{"@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}"}</style>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // STOCK PAGE
  // ──────────────────────────────────────────────────────────────
  const renderStock=()=>(
    <div style={{padding:pad}}>
      <div style={{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}}>
        <input
          key="search-input"
          placeholder="🔍 ค้นหา..."
          defaultValue={search}
          onChange={e=>setSearch(e.target.value)}
          {...inputAttr}
          style={{...inputStT,flex:1,minWidth:120,maxWidth:mob?9999:260}}
        />
        {!mob&&<>
          <button onClick={openAdd} style={{background:"#e8a020",color:"#fff",border:"none",borderRadius:9,padding:"11px 18px",fontFamily:"inherit",fontWeight:700,fontSize:14,cursor:"pointer"}}>＋ เพิ่มสินค้า</button>
          <button onClick={()=>setShowModal("confirm")} style={{background:pendingCount>0?"#e8a020":"#555",color:"#fff",border:"none",borderRadius:9,padding:"11px 18px",fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer",animation:pendingCount>0?"pulse 1.5s infinite":"none"}}>
            💾 บันทึก{pendingCount>0?" ("+pendingCount+")":""}
          </button>
        </>}
      </div>
      <div style={{overflowX:"auto",scrollbarWidth:"none",marginBottom:9}}>
        <div style={{display:"flex",gap:7,width:"max-content"}}>
          {["ทั้งหมด",...zones].map(z=>{
            const zc=z==="ทั้งหมด"?{accent:"#e8a020"}:getZC(z),on=filterZone===z;
            return<button key={z} onClick={()=>setFilterZone(z)} style={{padding:"7px 15px",borderRadius:50,border:"none",background:on?zc.accent:(T.isDark?"#252525":"#fff"),color:on?"#fff":(T.isDark?"#888":"#666"),fontFamily:"inherit",fontWeight:on?700:500,fontSize:13,cursor:"pointer",whiteSpace:"nowrap",boxShadow:on?"0 2px 10px rgba(0,0,0,.3)":"0 1px 3px rgba(0,0,0,.15)"}}>
              {z==="ทั้งหมด"?"📍 ทั้งหมด":getZC(z).icon+" "+z}
            </button>;
          })}
        </div>
      </div>
      <div style={{overflowX:"auto",scrollbarWidth:"none",marginBottom:9}}>
        <div style={{display:"flex",gap:6,width:"max-content"}}>
          {["ทั้งหมด",...categories].map(c=>{
            const cc=c==="ทั้งหมด"?{accent:"#3949ab"}:getCC(c),on=filterCategory===c;
            return<button key={c} onClick={()=>setFilterCategory(c)} style={{padding:"6px 13px",borderRadius:50,border:"1.5px solid "+(on?cc.accent:(T.isDark?"#333":"#ddd")),background:on?cc.accent:(T.isDark?"#252525":"#fff"),color:on?"#fff":(T.isDark?"#888":"#666"),fontFamily:"inherit",fontWeight:on?700:500,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
              🏷️ {c}
            </button>;
          })}
        </div>
      </div>
      <div style={{overflowX:"auto",scrollbarWidth:"none",marginBottom:18}}>
        <div style={{display:"flex",gap:6,width:"max-content"}}>
          {[{v:"ทั้งหมด",l:"ทั้งหมด",i:"📦"},...Object.entries(STOCK_STATUS).map(([k,v])=>({v:k,l:v.label,i:v.icon}))].map(s=>{
            const on=filterStatus===s.v;
            return<button key={s.v} onClick={()=>setFilterStatus(s.v)} style={{padding:"6px 13px",borderRadius:50,border:"1.5px solid "+(on?"#e8a020":(T.isDark?"#333":"#ddd")),background:on?"#e8a020":(T.isDark?"#252525":"#fff"),color:on?"#fff":(T.isDark?"#888":"#666"),fontFamily:"inherit",fontWeight:on?700:500,fontSize:12,cursor:"pointer",whiteSpace:"nowrap"}}>
              {s.i} {s.l}
            </button>;
          })}
        </div>
      </div>
      <div style={{display:"grid",gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(4,auto)",gap:mob?8:12,marginBottom:mob?12:16,justifyContent:mob?"stretch":"start"}}>
        {[{l:"ทั้งหมด",v:items.length,c:T.text},{l:"น้อยมาก",v:lowItems.length,c:"#ef5350"},{l:"ปกติ",v:items.filter(i=>i.status==="normal").length,c:"#ff9800"},{l:"มีมาก",v:items.filter(i=>i.status==="high").length,c:"#4caf50"}].map(s=>(
          <div key={s.l} style={{background:T.card,borderRadius:10,padding:mob?"8px 6px":"10px 18px",textAlign:mob?"center":"left",boxShadow:"0 1px 4px rgba(0,0,0,.15)",display:mob?"block":"flex",alignItems:"center",gap:mob?0:10}}>
            <div style={{fontSize:mob?18:22,fontWeight:800,color:s.c}}>{s.v}</div>
            <div style={{fontSize:mob?10:13,color:T.textMuted,marginTop:mob?1:0}}>{s.l}</div>
          </div>
        ))}
      </div>
      <div style={{display:"flex",justifyContent:"flex-end",marginBottom:12}}>
        <div style={{display:"flex",background:T.card,borderRadius:9,overflow:"hidden",boxShadow:"0 1px 4px rgba(0,0,0,.12)",border:"1.5px solid "+T.border}}>
          <button onClick={()=>setViewMode("list")} style={{padding:"7px 14px",border:"none",background:viewMode==="list"?"#e8a020":T.card,color:viewMode==="list"?"#fff":T.textMuted,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            ≡ รายการ
          </button>
          <button onClick={()=>setViewMode("grid")} style={{padding:"7px 14px",border:"none",background:viewMode==="grid"?"#e8a020":T.card,color:viewMode==="grid"?"#fff":T.textMuted,fontFamily:"inherit",fontWeight:700,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
            ⊞ ตาราง
          </button>
        </div>
      </div>
      {zones.filter(z=>filterZone==="ทั้งหมด"||filterZone===z).map(zone=>{
        const zoneItems=filteredItems.filter(it=>it.zone===zone);
        if(!zoneItems.length)return null;
        const zc=getZC(zone);
        return(
          <div key={zone} style={{marginBottom:26}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:11}}>
              <div style={{background:zc.accent,color:"#fff",borderRadius:8,padding:"4px 14px",fontSize:13,fontWeight:800}}>{zc.icon} {zone}</div>
              <span style={{fontSize:12,color:T.textMuted}}>{zoneItems.length} รายการ</span>
            </div>
            {viewMode==="grid"
              ?<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(90px,1fr))",gap:8}}>
                {zoneItems.map(item=>(
                  <ItemGridCell key={item.id} item={item} delta={pendingChanges[item.id]??0} T={T}
                    onMinus={onMinus} onPlus={onPlus} onEdit={onEdit}/>
                ))}
              </div>
              :<div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(300px,1fr))",gap:11}}>
                {zoneItems.map(item=>(
                  <ItemCard key={item.id} item={item} delta={pendingChanges[item.id]??0} mob={mob} T={T}
                    onMinus={onMinus} onPlus={onPlus} onDeltaChange={onDeltaChange}
                    onEdit={onEdit} onDelete={onDelete} onStatus={onStatus}/>
                ))}
              </div>
            }
          </div>
        );
      })}
      {!filteredItems.length&&<div style={{textAlign:"center",padding:"60px 0",color:T.textFaint}}><div style={{fontSize:48}}>📭</div><div style={{fontSize:16,marginTop:10}}>ไม่พบสินค้า</div></div>}
      {mob&&<button onClick={openAdd} style={{position:"fixed",bottom:86,right:18,width:54,height:54,borderRadius:"50%",background:"#e8a020",border:"none",cursor:"pointer",fontSize:26,color:"#fff",boxShadow:"0 4px 20px rgba(0,0,0,.4)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:90}}>＋</button>}
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // LOG PAGE
  // ──────────────────────────────────────────────────────────────
  const renderLog=()=>(
    <div style={{padding:pad}}>
      <h2 style={{fontWeight:800,fontSize:mob?20:22,marginBottom:16,color:T.text}}>📋 ประวัติการบันทึก</h2>
      {!logs.length
        ?<div style={{textAlign:"center",padding:"60px 0",color:T.textFaint}}><div style={{fontSize:48}}>📭</div><div style={{fontSize:16,marginTop:10}}>ยังไม่มีประวัติ</div></div>
        :<div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(460px,1fr))",gap:13}}>
          {logs.map(log=>{
            const changed=log.changes.filter(c=>c.delta!==0),unchanged=log.changes.filter(c=>c.delta===0);
            return(
              <div key={log.id} style={{background:T.card,borderRadius:14,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.15)"}}>
                <div style={{background:T.logHeader,padding:"11px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div style={{flex:1,minWidth:0}}>
                    <span style={{color:"#e8a020",fontWeight:800,fontSize:14}}>👤 {log.staff}</span>
                    <div style={{color:T.textMuted,fontSize:11,marginTop:2}}>📅 {log.date} &nbsp;🕐 {log.timestamp}</div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
                    <span style={{color:T.textMuted,fontSize:11,background:T.logHeaderSub,borderRadius:7,padding:"3px 9px"}}>{changed.length} เปลี่ยน</span>
                    <button onClick={()=>openLogEdit(log)} title="แก้ไข" style={{background:T.logHeaderSub,border:"none",borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>✏️</button>
                    <button onClick={()=>openLogDelete(log)} title="ลบ" style={{background:T.isDark?"#2d1515":"#3a1a1a",border:"none",borderRadius:7,width:30,height:30,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"}}>🗑️</button>
                  </div>
                </div>
                <div style={{padding:"12px 16px"}}>
                  {changed.length>0&&<div style={{marginBottom:10}}>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
                      <div style={{width:3,height:12,background:"#4caf50",borderRadius:2}}/>
                      <span style={{fontSize:11,fontWeight:800,color:"#4caf50",textTransform:"uppercase",letterSpacing:.5}}>เปลี่ยนแปลง</span>
                    </div>
                    {changed.map((c,i)=>{const col=getCC(c.category);const itemBg=T.isDark?"rgba(255,255,255,.05)":col.bg;return(
                      <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 11px",background:itemBg,borderRadius:9,marginBottom:5}}>
                        <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>{c.itemName}</div><div style={{fontSize:11,color:T.textMuted}}>{c.before} → {c.after} {c.unit}</div></div>
                        <span style={{fontWeight:800,fontSize:16,color:c.delta>0?"#4caf50":"#ef5350"}}>{c.delta>0?"+"+c.delta:c.delta}</span>
                      </div>
                    );})}
                  </div>}
                  {unchanged.length>0&&<div>
                    <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:8}}>
                      <div style={{width:3,height:12,background:T.textFaint,borderRadius:2}}/>
                      <span style={{fontSize:11,fontWeight:800,color:T.textFaint,textTransform:"uppercase",letterSpacing:.5}}>คงที่</span>
                    </div>
                    <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                      {unchanged.map((c,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",gap:5,background:T.unchanged,border:"1px solid "+T.unchangedBorder,borderRadius:8,padding:"5px 10px"}}>
                          <span style={{fontSize:12,color:T.textMuted}}>🔒</span>
                          <span style={{fontSize:12,color:T.textMuted,fontWeight:600}}>{c.itemName}</span>
                          <span style={{fontSize:11,color:T.textFaint}}>{c.before} {c.unit}</span>
                        </div>
                      ))}
                    </div>
                  </div>}
                </div>
              </div>
            );
          })}
        </div>}
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // SUMMARY PAGE
  // ──────────────────────────────────────────────────────────────
  const SortBtn=({col,label})=>{
    const active=sortCol===col;
    return<button onClick={()=>handleSort(col)} style={{background:"none",border:"none",cursor:"pointer",fontFamily:"inherit",fontWeight:active?800:600,fontSize:12,color:active?"#e8a020":(T.isDark?"#666":"#aaa"),display:"inline-flex",alignItems:"center",gap:3,padding:0,whiteSpace:"nowrap"}}>
      {label}<span style={{fontSize:10,opacity:active?1:0.3}}>{active?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>
    </button>;
  };

  const renderSummary=()=>{
    if(!pinUnlocked)return(
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"70vh",padding:16}}>
        <div style={{background:T.card,borderRadius:22,padding:"36px 28px",width:"100%",maxWidth:340,textAlign:"center",boxShadow:"0 8px 40px rgba(0,0,0,.25)"}}>
          <div style={{fontSize:50,marginBottom:10}}>🔒</div>
          <div style={{fontWeight:800,fontSize:19,marginBottom:4,color:T.text}}>หน้าสรุปเจ้าของ</div>
          <div style={{fontSize:13,color:T.textMuted,marginBottom:26}}>ใส่ PIN 6 หลัก</div>
          <PinPad T={T} pinInput={pinInput} pinError={pinError}
            onPress={pressSummaryPin} onBack={()=>setPinInput(p=>p.slice(0,-1))}
            title="" subtitle="" icon="" />
        </div>
      </div>
    );
    return(
      <div style={{padding:pad}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20,flexWrap:"wrap",gap:10}}>
          <div>
            <h2 style={{fontWeight:800,fontSize:mob?20:22,margin:0,color:T.text}}>📊 สรุปสต๊อค</h2>
            <div style={{fontSize:12,color:T.textMuted,marginTop:3}}>อัปเดต: {new Date().toLocaleString("th-TH")}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:8,flexWrap:"wrap"}}>
            <div style={{background:T.card,borderRadius:9,padding:"7px 13px",display:"flex",gap:7,alignItems:"center",boxShadow:"0 1px 4px rgba(0,0,0,.15)"}}>
              <span style={{fontSize:13,color:T.textMuted}}>📅</span>
              <input type="date" value={summaryDate} onChange={e=>setSummaryDate(e.target.value)} style={{border:"none",fontFamily:"inherit",fontSize:14,fontWeight:700,cursor:"pointer",outline:"none",background:"transparent",color:T.text}}/>
            </div>
            <button onClick={()=>{setPinUnlocked(false);navTo("stock");}} style={{background:T.cardAlt,border:"1px solid "+T.border,borderRadius:9,padding:"7px 13px",fontFamily:"inherit",fontWeight:600,fontSize:13,cursor:"pointer",color:T.textMuted}}>🔒 ล็อค</button>
          </div>
        </div>
        <div style={{marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:4,height:18,background:"#e8a020",borderRadius:2}}/>
            <span style={{fontWeight:800,fontSize:15,color:T.text}}>ภาพรวมสต๊อค</span>
          </div>
          <div style={{display:"grid",gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)",gap:11,marginBottom:24}}>
            {[{l:"สินค้าทั้งหมด",v:items.length,c:T.text,bg:T.summaryCard,border:T.summaryCardBorder},{l:"น้อยมาก",v:lowItems.length,c:"#ef5350",bg:T.isDark?"#2d1515":"#ffebee",border:T.isDark?"#5a2020":"#ef9a9a"},{l:"ปกติ",v:items.filter(i=>i.status==="normal").length,c:"#ff9800",bg:T.isDark?"#2a1800":"#fff8f0",border:T.isDark?"#5a3300":"#ffcc80"},{l:"มีมาก",v:items.filter(i=>i.status==="high").length,c:"#4caf50",bg:T.isDark?"#0d1f0f":"#e8f5e9",border:T.isDark?"#1a4a1a":"#a5d6a7"}].map(s=>(
              <div key={s.l} style={{background:s.bg,borderRadius:13,padding:"14px 16px",boxShadow:"0 2px 8px rgba(0,0,0,.12)",border:"1.5px solid "+s.border}}>
                <div style={{fontSize:26,fontWeight:800,color:s.c}}>{s.v}</div>
                <div style={{fontSize:12,color:s.c,opacity:.7,marginTop:2,fontWeight:600}}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{marginBottom:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:4,height:18,background:"#3949ab",borderRadius:2}}/>
            <span style={{fontWeight:800,fontSize:15,color:T.text}}>รายการสต๊อคทั้งหมด</span>
            <span style={{fontSize:12,color:T.textMuted}}>({items.length} รายการ)</span>
          </div>
          <div style={{background:T.card,borderRadius:13,overflow:"hidden",boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
            <div style={{background:T.cardAlt,borderBottom:"2px solid "+T.border,padding:"10px 16px",display:"grid",gridTemplateColumns:mob?"2fr 1fr 1fr":"3fr 1fr 1fr 1fr 1fr",gap:8,alignItems:"center"}}>
              <SortBtn col="name" label="ชื่อสินค้า"/>
              {!mob&&<SortBtn col="category" label="ประเภท"/>}
              {!mob&&<SortBtn col="zone" label="โซน"/>}
              <SortBtn col="qty" label="จำนวน"/>
              <SortBtn col="status" label="สถานะ"/>
            </div>
            {sortedSummaryItems.map((item,idx)=>{
              const col=getCC(item.category),st=getSt(item.status),zc=getZC(item.zone),isLow=item.status==="low";
              const rowBg = isLow?(T.isDark?"#2d1010":T.card):idx%2===0?T.card:T.cardAlt;
              const colBadgeBg = T.isDark?"rgba(255,255,255,.08)":col.bg;
              const zcBadgeBg = T.isDark?"rgba(255,255,255,.08)":zc.bg;
              const stBadgeBg = T.isDark?"rgba(255,255,255,.08)":st.bg;
              return(
                <div key={item.id} style={{padding:"11px 16px",borderBottom:"1px solid "+T.border,display:"grid",gridTemplateColumns:mob?"2fr 1fr 1fr":"3fr 1fr 1fr 1fr 1fr",gap:8,alignItems:"center",background:rowBg}}>
                  <div style={{minWidth:0}}>
                    <div style={{fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6,color:T.text}}>
                      {isLow&&<span style={{fontSize:10,background:"#ef5350",color:"#fff",borderRadius:4,padding:"1px 5px",fontWeight:700,flexShrink:0}}>!</span>}
                      {item.name}
                    </div>
                    {mob&&<div style={{display:"flex",gap:4,marginTop:3,flexWrap:"wrap"}}>
                      <span style={{background:colBadgeBg,color:col.accent,borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:600}}>{item.category}</span>
                      <span style={{background:zcBadgeBg,color:zc.accent,borderRadius:4,padding:"1px 5px",fontSize:10,fontWeight:600}}>{zc.icon} {item.zone}</span>
                    </div>}
                  </div>
                  {!mob&&<span style={{background:colBadgeBg,color:col.accent,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap",textAlign:"center"}}>{item.category}</span>}
                  {!mob&&<span style={{background:zcBadgeBg,color:zc.accent,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:600,whiteSpace:"nowrap",textAlign:"center"}}>{zc.icon} {item.zone}</span>}
                  <div style={{fontWeight:800,fontSize:15,color:T.text}}>{item.qty} <span style={{fontSize:11,color:T.textFaint,fontWeight:500}}>{item.unit}</span></div>
                  <span style={{background:stBadgeBg,color:st.color,borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",textAlign:"center"}}>{st.icon} {st.label}</span>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
            <div style={{width:4,height:18,background:"#4caf50",borderRadius:2}}/>
            <span style={{fontWeight:800,fontSize:15,color:T.text}}>บันทึกวันที่ {summaryDate}</span>
            <span style={{fontSize:12,color:T.textMuted}}>({summaryLogs.length} รายการ)</span>
          </div>
          {summaryLogs.length===0
            ?<div style={{background:T.card,borderRadius:13,padding:"28px 16px",textAlign:"center",color:T.textFaint,boxShadow:"0 2px 8px rgba(0,0,0,.1)"}}><div style={{fontSize:36,marginBottom:8}}>📭</div><div style={{fontSize:14}}>ไม่มีบันทึกในวันนี้</div></div>
            :summaryLogs.map(log=>{
              const logChanged=log.changes.filter(c=>c.delta!==0);
              return(
                <div key={log.id} style={{background:T.card,borderRadius:13,overflow:"hidden",marginBottom:10,boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
                  <div style={{background:T.logHeader,padding:"10px 16px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <div><span style={{color:"#e8a020",fontWeight:800,fontSize:14}}>👤 {log.staff}</span><span style={{color:T.textMuted,fontSize:11,marginLeft:10}}>🕐 {log.timestamp}</span></div>
                    <span style={{background:T.overlay,color:T.textMuted,fontSize:11,borderRadius:7,padding:"3px 9px"}}>{logChanged.length} รายการ</span>
                  </div>
                  <div style={{padding:"12px 16px"}}>
                    {logChanged.length===0?<div style={{fontSize:13,color:T.textFaint}}>ไม่มีการเปลี่ยนแปลง</div>
                      :logChanged.map((c,i)=>{const cc=getCC(c.category);const itemBg=T.isDark?"rgba(255,255,255,.05)":cc.bg;return(
                        <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 11px",background:itemBg,borderRadius:9,marginBottom:5}}>
                          <div><div style={{fontWeight:700,fontSize:13,color:T.text}}>{c.itemName}</div><div style={{fontSize:11,color:T.textMuted}}>{c.before} → {c.after} {c.unit}</div></div>
                          <span style={{fontWeight:800,fontSize:16,color:c.delta>0?"#4caf50":"#ef5350"}}>{c.delta>0?"+"+c.delta:c.delta}</span>
                        </div>
                      );})}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  // ──────────────────────────────────────────────────────────────
  // SETTINGS PAGE
  // ──────────────────────────────────────────────────────────────
  const renderSettings=()=>(
    <div style={{padding:pad}}>
      <h2 style={{fontWeight:800,fontSize:mob?20:22,marginBottom:18,color:T.text}}>⚙️ ตั้งค่า</h2>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(2,1fr)",gap:13,alignItems:"start"}}>
        {[
          {title:"📍 โซนทำงาน",val:newZoneInput,setVal:setNewZoneInput,onAdd:addZone,ph:"ชื่อโซนใหม่...",chips:zones.map(z=>{const zc=getZC(z),inUse=items.some(i=>i.zone===z);return<Chip key={z} T={T} bg={zc.bg} accent={zc.accent} light={zc.light} onDelete={!inUse?()=>delZone(z):null}>{zc.icon} {z}</Chip>;})},
          {title:"🗂️ ประเภทสินค้า",val:newCatInput,setVal:setNewCatInput,onAdd:addCat,ph:"ชื่อประเภทใหม่...",chips:categories.map(c=>{const col=getCC(c),inUse=items.some(i=>i.category===c);return<Chip key={c} T={T} bg={col.bg} accent={col.accent} light={col.light} onDelete={!inUse?()=>delCat(c):null}>{c}</Chip>;})},
          {title:"📐 หน่วยนับ",val:newUnitInput,setVal:setNewUnitInput,onAdd:addUnit,ph:"หน่วยใหม่...",chips:units.map(u=>{const inUse=items.some(i=>i.unit===u);return<Chip key={u} T={T} bg="#f0f4ff" accent="#3949ab" light="#c5cae9" onDelete={!inUse?()=>delUnit(u):null}>{u}</Chip>;})},
        ].map(sec=>(
          <div key={sec.title} style={{background:T.card,borderRadius:13,padding:17,boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
            <div style={{fontWeight:700,fontSize:14,marginBottom:11,color:T.text}}>{sec.title}</div>
            <div style={{display:"flex",gap:8,marginBottom:11}}>
              <input placeholder={sec.ph} value={sec.val} onChange={e=>sec.setVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sec.onAdd()} {...inputAttr} style={{...inputStT,flex:1,fontSize:14}}/>
              <button onClick={sec.onAdd} style={{background:"#e8a020",color:"#fff",border:"none",borderRadius:9,padding:"0 15px",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:14,flexShrink:0}}>+ เพิ่ม</button>
            </div>
            <div style={{display:"flex",flexWrap:"wrap",gap:7}}>{sec.chips}</div>
          </div>
        ))}
        <div style={{background:T.card,borderRadius:13,padding:17,boxShadow:"0 2px 8px rgba(0,0,0,.12)"}}>
          <div style={{fontWeight:700,fontSize:14,marginBottom:11,color:T.text}}>🔒 PIN เจ้าของ</div>
          {changePinStep===null&&<button onClick={()=>{setChangePinStep("verify");setChangePinVal("");setChangePinErr(false);}} style={{background:"#e8a020",color:"#fff",border:"none",borderRadius:9,padding:"12px 18px",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:14,width:"100%"}}>🔑 เปลี่ยน PIN</button>}
          {changePinStep==="verify"&&<div>
            <div style={{fontSize:12,color:T.textSub,marginBottom:7}}>ใส่ PIN ปัจจุบัน</div>
            <div style={{display:"flex",gap:7}}>
              <input type="password" maxLength={6} value={changePinVal} onChange={e=>setChangePinVal(e.target.value.replace(/\D/g,""))} placeholder="• • • • • •" style={{...inputStT,flex:1,fontSize:18,letterSpacing:8}}/>
              <button onClick={()=>{if(changePinVal===ownerPin){setChangePinStep("new");setChangePinVal("");setChangePinErr(false);}else{setChangePinErr(true);setChangePinVal("");}}} style={{background:"#e8a020",color:"#fff",border:"none",borderRadius:9,padding:"0 14px",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:14}}>ยืนยัน</button>
              <button onClick={()=>{setChangePinStep(null);setChangePinVal("");setChangePinErr(false);}} style={{background:T.cardAlt,border:"1px solid "+T.border,borderRadius:9,padding:"0 11px",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:T.textMuted}}>ยกเลิก</button>
            </div>
            {changePinErr&&<div style={{color:"#ef5350",fontSize:12,marginTop:5}}>PIN ไม่ถูกต้อง</div>}
          </div>}
          {changePinStep==="new"&&<div>
            <div style={{fontSize:12,color:T.textSub,marginBottom:7}}>ใส่ PIN ใหม่ 6 หลัก</div>
            <div style={{display:"flex",gap:7}}>
              <input type="password" maxLength={6} value={changePinVal} onChange={e=>setChangePinVal(e.target.value.replace(/\D/g,""))} placeholder="• • • • • •" style={{...inputStT,flex:1,fontSize:18,letterSpacing:8}}/>
              <button onClick={()=>{if(changePinVal.length===6){saveSettings({ownerPin:changePinVal});setChangePinStep(null);setChangePinVal("");toast;}}} style={{background:"#4caf50",color:"#fff",border:"none",borderRadius:9,padding:"0 14px",fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:14}}>บันทึก</button>
              <button onClick={()=>{setChangePinStep(null);setChangePinVal("");}} style={{background:T.cardAlt,border:"1px solid "+T.border,borderRadius:9,padding:"0 11px",cursor:"pointer",fontFamily:"inherit",fontSize:13,color:T.textMuted}}>ยกเลิก</button>
            </div>
            {changePinVal.length>0&&changePinVal.length<6&&<div style={{color:T.textMuted,fontSize:11,marginTop:5}}>ต้องการ 6 หลัก ({changePinVal.length}/6)</div>}
          </div>}
        </div>
      </div>
    </div>
  );

  // ──────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────
  return(
    <div style={{fontFamily:"'Sarabun','Noto Sans Thai',sans-serif",background:T.bg,minHeight:"100vh",color:T.text,display:"flex",flexDirection:"column",transition:"background .2s,color .2s"}}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet"/>

      {toast&&<div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:toast.type==="error"?"#c62828":"#1c1c1c",color:"#fff",padding:"11px 22px",borderRadius:50,fontWeight:700,fontSize:14,boxShadow:"0 4px 24px rgba(0,0,0,.35)",animation:"slideDown .25s ease",whiteSpace:"nowrap"}}>
        {toast.type==="error"?"⚠️":"✅"} {toast.msg}
      </div>}

      {syncing&&<div style={{position:"fixed",top:0,left:0,right:0,height:3,background:"linear-gradient(90deg,#e8a020,#f5c842,#e8a020)",backgroundSize:"200% 100%",animation:"shimmer 1s infinite",zIndex:10000}}/>}

      <header style={{background:T.header,height:mob?52:58,display:"flex",alignItems:"center",justifyContent:"space-between",padding:mob?"0 16px":"0 28px",flexShrink:0,position:"sticky",top:0,zIndex:100,boxShadow:"0 2px 12px rgba(0,0,0,.3)"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <img src={LOGO_SRC} alt="YuGrill" style={{width:mob?36:42,height:mob?36:42,borderRadius:"50%",objectFit:"cover",flexShrink:0}}/>
          <div>
            <div style={{color:T.headerText,fontWeight:800,fontSize:mob?14:16,lineHeight:1.1}}>จัดการสต๊อคร้าน YuGrill</div>
            {!mob&&<div style={{color:"#e8a020",fontSize:10,fontWeight:600}}>🔥 Firebase Realtime Sync</div>}
          </div>
        </div>
        {!mob&&(
          <nav style={{display:"flex",alignItems:"center",gap:3}}>
            {NAV.map(n=>(
              <button key={n.id} onClick={()=>navTo(n.id)} style={{background:page===n.id?"#e8a020":"transparent",color:page===n.id?"#fff":"#999",border:"none",borderRadius:8,padding:"7px 15px",fontFamily:"inherit",fontWeight:page===n.id?700:500,fontSize:14,cursor:"pointer"}}>
                {n.icon} {n.label}
              </button>
            ))}
            {page==="stock"&&<button onClick={()=>setShowModal("confirm")} style={{background:pendingCount>0?"#e8a020":"#555",color:"#fff",border:"none",borderRadius:8,padding:"7px 15px",fontFamily:"inherit",fontWeight:800,fontSize:14,cursor:"pointer",marginLeft:6,animation:pendingCount>0?"pulse 1.5s infinite":"none"}}>
              💾 บันทึก{pendingCount>0?" ("+pendingCount+")":""}
            </button>}
            <button onClick={toggleDark} title={darkMode?"โหมดสว่าง":"โหมดมืด"} style={{background:"transparent",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:8,padding:"6px 10px",cursor:"pointer",fontSize:16,marginLeft:4,lineHeight:1}}>
              {darkMode?"☀️":"🌙"}
            </button>
          </nav>
        )}
        {mob&&<div style={{display:"flex",alignItems:"center",gap:6}}>
          {page==="stock"&&<button onClick={()=>setShowModal("confirm")} style={{background:pendingCount>0?"#e8a020":"#555",border:"none",borderRadius:9,padding:"7px 12px",cursor:"pointer",fontFamily:"inherit",fontWeight:800,fontSize:13,color:"#fff",display:"flex",alignItems:"center",gap:5,animation:pendingCount>0?"pulse 1.5s infinite":"none"}}>
            💾{pendingCount>0&&<span style={{background:"rgba(0,0,0,.25)",borderRadius:50,width:18,height:18,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:10}}>{pendingCount}</span>}
          </button>}
          <button onClick={toggleDark} style={{background:"transparent",border:"1.5px solid rgba(255,255,255,.2)",borderRadius:8,padding:"6px 8px",cursor:"pointer",fontSize:15,lineHeight:1}}>
            {darkMode?"☀️":"🌙"}
          </button>
        </div>}
      </header>

      {lowItems.length>0&&page==="stock"&&<div style={{background:T.lowBg,borderBottom:"2px solid "+T.lowBorder,padding:"8px 16px",display:"flex",alignItems:"center",gap:8}}>
        <span>🔴</span><span style={{fontWeight:700,color:T.lowText,fontSize:13}}>น้อยมาก: </span>
        <span style={{color:T.lowTextDark,fontSize:13,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{lowItems.map(i=>i.name).join(" • ")}</span>
      </div>}

      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        {!mob&&<aside style={{width:196,background:T.sidebar,borderRight:"1px solid "+T.sidebarBorder,flexShrink:0,display:"flex",flexDirection:"column",overflowY:"auto"}}>
          <div style={{padding:"16px 14px 5px",fontSize:10,fontWeight:700,color:T.textFaint,textTransform:"uppercase",letterSpacing:1}}>เมนู</div>
          {NAV.map(n=>(
            <button key={n.id} onClick={()=>navTo(n.id)} style={{background:page===n.id?T.sidebarActive:"transparent",color:page===n.id?"#e8a020":T.textMuted,border:"none",borderLeft:page===n.id?"3px solid #e8a020":"3px solid transparent",padding:"11px 17px",fontFamily:"inherit",fontWeight:page===n.id?700:500,fontSize:14,cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:10}}>
              <span style={{fontSize:16}}>{n.icon}</span>{n.label}
            </button>
          ))}
          <div style={{margin:"14px 11px 0",padding:"13px",background:T.overviewBg,borderRadius:11}}>
            <div style={{fontSize:10,fontWeight:700,color:T.textFaint,marginBottom:9,textTransform:"uppercase",letterSpacing:1}}>ภาพรวม</div>
            {[{l:"ทั้งหมด",v:items.length,c:T.text},{l:"น้อยมาก",v:lowItems.length,c:"#ef5350"},{l:"ปกติ",v:items.filter(i=>i.status==="normal").length,c:"#ff9800"},{l:"มีมาก",v:items.filter(i=>i.status==="high").length,c:"#4caf50"}].map(s=>(
              <div key={s.l} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
                <span style={{fontSize:12,color:T.textMuted}}>{s.l}</span>
                <span style={{fontSize:14,fontWeight:800,color:s.c}}>{s.v}</span>
              </div>
            ))}
          </div>
          {lowItems.length>0&&<div style={{margin:"9px 11px 0",padding:"9px",background:T.lowBg,borderRadius:9,border:"1px solid "+T.lowBorder}}>
            <div style={{fontSize:10,fontWeight:700,color:T.lowText,marginBottom:4}}>🔴 สต๊อคน้อยมาก</div>
            {lowItems.map(i=><div key={i.id} style={{fontSize:11,color:T.lowTextDark}}>• {i.name}</div>)}
          </div>}
          <div style={{margin:"9px 11px 14px",padding:"8px 10px",background:T.fbBg,borderRadius:9,border:"1px solid "+T.fbBorder,display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:14}}>🔥</span>
            <div><div style={{fontSize:10,fontWeight:700,color:T.fbText}}>Firebase Connected</div><div style={{fontSize:9,color:T.fbTextSub}}>Real-time sync</div></div>
          </div>
        </aside>}

        <main style={{flex:1,overflowY:"auto",paddingBottom:mob?80:0}}>
          {page==="stock"    && renderStock()}
          {page==="log"      && renderLog()}
          {page==="summary"  && renderSummary()}
          {page==="settings" && renderSettings()}
        </main>
      </div>

      {mob&&<nav style={{position:"fixed",bottom:0,left:0,right:0,background:T.navBg,borderTop:"1px solid "+T.navBorder,display:"grid",gridTemplateColumns:"repeat(4,1fr)",zIndex:200,boxShadow:"0 -2px 14px rgba(0,0,0,.12)"}}>
        {NAV.map(n=>(
          <button key={n.id} onClick={()=>navTo(n.id)} style={{background:"none",border:"none",padding:"9px 4px 10px",cursor:"pointer",fontFamily:"inherit",display:"flex",flexDirection:"column",alignItems:"center",gap:2,position:"relative"}}>
            {page===n.id&&<div style={{position:"absolute",top:0,left:"50%",transform:"translateX(-50%)",width:26,height:3,background:"#e8a020",borderRadius:"0 0 3px 3px"}}/>}
            <span style={{fontSize:22}}>{n.icon}</span>
            <span style={{fontSize:10,fontWeight:page===n.id?800:500,color:page===n.id?"#e8a020":T.textFaint}}>{n.label}</span>
          </button>
        ))}
      </nav>}

      {/* ── Item Modal ── */}
      {(showModal==="item")&&<Modal T={T} mob={mob} onClose={closeModal} maxW={500}>
        <h3 style={{fontWeight:800,fontSize:18,marginBottom:16,color:T.text}}>{editItem?"✏️ แก้ไขสินค้า":"➕ เพิ่มสินค้าใหม่"}</h3>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:5}}>ชื่อสินค้า *</label>
            <input value={formData.name} onChange={e=>setFormData(p=>({...p,name:e.target.value}))} {...inputAttr} style={inputStT}/></div>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:5}}>จำนวน *</label>
            <input type="number" value={formData.qty} onChange={e=>setFormData(p=>({...p,qty:e.target.value}))} style={inputStT}/></div>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:5}}>โซนทำงาน *</label>
            <select value={formData.zone} onChange={e=>setFormData(p=>({...p,zone:e.target.value}))} style={inputStT}>{zones.map(z=><option key={z} value={z}>{getZC(z).icon} {z}</option>)}</select></div>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:5}}>ประเภท *</label>
            <select value={formData.category} onChange={e=>setFormData(p=>({...p,category:e.target.value}))} style={inputStT}>{categories.map(c=><option key={c}>{c}</option>)}</select></div>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:5}}>หน่วย *</label>
            <select value={formData.unit} onChange={e=>setFormData(p=>({...p,unit:e.target.value}))} style={inputStT}>{units.map(u=><option key={u}>{u}</option>)}</select></div>
          <div><label style={{fontSize:12,color:T.textSub,fontWeight:600,display:"block",marginBottom:7}}>สถานะ *</label>
            <div style={{display:"flex",gap:6}}>
              {Object.entries(STOCK_STATUS).map(([k,v])=>{
                const isAct=formData.status===k;
                const actBg = T.isDark?"rgba(255,255,255,.1)":v.bg;
                return(
                <button key={k} type="button" onClick={()=>setFormData(p=>({...p,status:k}))} style={{flex:1,padding:"10px 3px",borderRadius:9,border:isAct?"2px solid "+v.color:"1.5px solid "+(T.isDark?"#333":"#e8e8e8"),background:isAct?actBg:(T.isDark?"#252525":"#fafafa"),cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:isAct?800:400,color:isAct?v.color:(T.isDark?"#666":"#bbb")}}>
                  {v.icon}<br/>{v.label}
                </button>
              );})}
            </div>
          </div>
        </div>
        <div style={{display:"flex",gap:10,marginTop:20}}>
          <button onClick={closeModal} style={{flex:1,padding:13,borderRadius:11,border:"1.5px solid "+T.border,background:T.card,color:T.text,fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:15}}>ยกเลิก</button>
          <button onClick={saveItem} style={{flex:2,padding:13,borderRadius:11,border:"none",background:"#e8a020",color:"#fff",fontFamily:"inherit",fontWeight:800,cursor:"pointer",fontSize:15}}>บันทึก</button>
        </div>
      </Modal>}

      {/* ── Confirm Log Modal ── */}
      {showModal==="confirm"&&(()=>{
        const changedItems=items.filter(it=>(pendingChanges[it.id]??0)!==0);
        const unchangedItems=items.filter(it=>(pendingChanges[it.id]??0)===0);
        return<Modal T={T} mob={mob} onClose={closeModal} maxW={500}>
          <h3 style={{fontWeight:800,fontSize:18,marginBottom:4,color:T.text}}>💾 บันทึกรายการ</h3>
          <p style={{color:T.textMuted,fontSize:13,marginBottom:16}}>ตรวจสอบและยืนยันการบันทึกสต๊อค</p>
          <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:16}}>
            <div><label style={{fontSize:12,fontWeight:600,color:T.textSub,display:"block",marginBottom:5}}>ชื่อพนักงาน *</label>
              <input placeholder="กรอกชื่อ..." value={staffName} onChange={e=>setStaffName(e.target.value)} {...inputAttr} style={inputStT}/></div>
            <div><label style={{fontSize:12,fontWeight:600,color:T.textSub,display:"block",marginBottom:5}}>วันที่บันทึก</label>
              <input type="date" value={logDate} onChange={e=>setLogDate(e.target.value)} style={inputStT}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:14}}>
            <div style={{background:T.isDark?"#0d1f0f":"#e8f5e9",border:"1.5px solid "+(T.isDark?"#1a4a1a":"#a5d6a7"),borderRadius:9,padding:"7px 14px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>✏️</span>
              <div><div style={{fontSize:18,fontWeight:800,color:"#4caf50",lineHeight:1}}>{changedItems.length}</div><div style={{fontSize:10,color:"#4caf50"}}>เปลี่ยนแปลง</div></div>
            </div>
            <div style={{background:T.unchanged,border:"1.5px solid "+T.unchangedBorder,borderRadius:9,padding:"7px 14px",display:"flex",alignItems:"center",gap:6}}>
              <span style={{fontSize:16}}>🔒</span>
              <div><div style={{fontSize:18,fontWeight:800,color:T.textMuted,lineHeight:1}}>{unchangedItems.length}</div><div style={{fontSize:10,color:T.textFaint}}>คงที่</div></div>
            </div>
          </div>
          {changedItems.length>0&&<div style={{marginBottom:12}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
              <div style={{width:3,height:14,background:"#4caf50",borderRadius:2}}/><span style={{fontSize:12,fontWeight:800,color:"#4caf50",textTransform:"uppercase",letterSpacing:.5}}>เปลี่ยนแปลง</span>
            </div>
            <div style={{background:T.isDark?"#0d1f0f":"#f1faf3",border:"1.5px solid "+(T.isDark?"#1a4a1a":"#c8e6c9"),borderRadius:11,overflow:"hidden"}}>
              {changedItems.map((it,i)=>{const d=pendingChanges[it.id],isAdd=d>0;return(
                <div key={it.id} style={{display:"flex",alignItems:"center",padding:"10px 13px",borderBottom:i<changedItems.length-1?"1px solid "+(T.isDark?"#1a4a1a":"#c8e6c9"):"none",gap:10}}>
                  <div style={{width:28,height:28,borderRadius:8,background:isAdd?(T.isDark?"#0d1f0f":"#e8f5e9"):(T.isDark?"#2d1515":"#ffebee"),display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,flexShrink:0}}>{isAdd?"➕":"➖"}</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:700,fontSize:14,color:T.text}}>{it.name}</div><div style={{fontSize:11,color:T.textMuted}}>{it.qty} → {it.qty+d} {it.unit}</div></div>
                  <div style={{background:isAdd?"#4caf50":"#ef5350",color:"#fff",borderRadius:7,padding:"4px 10px",fontWeight:800,fontSize:14,flexShrink:0}}>{isAdd?"+"+d:d}</div>
                </div>
              );})}
            </div>
          </div>}
          {unchangedItems.length>0&&<div style={{marginBottom:16}}>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}>
              <div style={{width:3,height:14,background:T.textFaint,borderRadius:2}}/><span style={{fontSize:12,fontWeight:800,color:T.textFaint,textTransform:"uppercase",letterSpacing:.5}}>คงที่</span>
            </div>
            <div style={{background:T.unchanged,border:"1.5px solid "+T.unchangedBorder,borderRadius:11,overflow:"hidden"}}>
              {unchangedItems.map((it,i)=>(
                <div key={it.id} style={{display:"flex",alignItems:"center",padding:"9px 13px",borderBottom:i<unchangedItems.length-1?"1px solid "+T.border:"none",gap:10,background:i%2===0?T.unchanged:T.card}}>
                  <div style={{width:28,height:28,borderRadius:8,background:T.cardAlt,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,flexShrink:0}}>🔒</div>
                  <div style={{flex:1,minWidth:0}}><div style={{fontWeight:600,fontSize:13,color:T.textMuted}}>{it.name}</div><div style={{fontSize:11,color:T.textFaint}}>{it.qty} {it.unit}</div></div>
                  <div style={{background:T.cardAlt,color:T.textMuted,borderRadius:7,padding:"4px 10px",fontWeight:700,fontSize:12,flexShrink:0,border:"1px solid "+T.border}}>คงที่</div>
                </div>
              ))}
            </div>
          </div>}
          <div style={{display:"flex",gap:10}}>
            <button onClick={closeModal} style={{flex:1,padding:13,borderRadius:11,border:"1.5px solid "+T.border,background:T.card,color:T.text,fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:15}}>ยกเลิก</button>
            <button onClick={confirmLog} style={{flex:2,padding:13,borderRadius:11,border:"none",background:"#e8a020",color:"#fff",fontFamily:"inherit",fontWeight:800,cursor:"pointer",fontSize:15}}>✅ ยืนยันบันทึก</button>
          </div>
        </Modal>;
      })()}

      {/* ── Log PIN Modal ── */}
      {showModal==="logPin"&&!logPinUnlocked&&<Modal T={T} mob={mob} onClose={()=>{setShowModal(null);setLogAction(null);setLogPinInput("");}} maxW={340}>
        <PinPad T={T} pinInput={logPinInput} pinError={logPinError}
          icon={logAction?.type==="delete"?"🗑️":"✏️"}
          title={logAction?.type==="delete"?"ลบประวัติ":"แก้ไขประวัติ"}
          subtitle="ใส่ PIN เจ้าของเพื่อดำเนินการ"
          onPress={pressLogPin}
          onBack={()=>setLogPinInput(p=>p.slice(0,-1))}
          onCancel={()=>{setShowModal(null);setLogAction(null);setLogPinInput("");}}/>
      </Modal>}

      {/* ── Log Edit Modal ── */}
      {showModal==="logPin"&&logPinUnlocked&&logAction?.type==="edit"&&editLogData&&<Modal T={T} mob={mob} onClose={()=>{setShowModal(null);setLogAction(null);setLogPinUnlocked(false);setEditLogData(null);}} maxW={400}>
        <h3 style={{fontWeight:800,fontSize:17,marginBottom:4,color:T.text}}>✏️ แก้ไขประวัติ</h3>
        <p style={{color:T.textMuted,fontSize:12,marginBottom:18}}>แก้ไขได้เฉพาะชื่อพนักงาน และวันที่บันทึก</p>
        <div style={{background:T.cardAlt,borderRadius:10,padding:"10px 13px",marginBottom:16}}>
          <div style={{fontSize:11,fontWeight:700,color:T.textFaint,marginBottom:8,textTransform:"uppercase",letterSpacing:.5}}>รายการที่เปลี่ยนแปลง (ดูอย่างเดียว)</div>
          {logAction.log.changes.filter(c=>c.delta!==0).length===0
            ?<div style={{fontSize:12,color:T.textFaint}}>ไม่มีการเปลี่ยนแปลง</div>
            :logAction.log.changes.filter(c=>c.delta!==0).map((c,i)=>(
              <div key={i} style={{display:"flex",justifyContent:"space-between",fontSize:13,color:T.textSub,padding:"4px 0",borderBottom:"1px solid "+T.border}}>
                <span>{c.itemName}</span>
                <span style={{fontWeight:700,color:c.delta>0?"#4caf50":"#ef5350"}}>{c.delta>0?"+"+c.delta:c.delta} {c.unit}</span>
              </div>
            ))}
        </div>
        <div style={{display:"grid",gap:12,marginBottom:20}}>
          <div><label style={{fontSize:12,fontWeight:600,color:T.textSub,display:"block",marginBottom:5}}>ชื่อพนักงาน *</label>
            <input value={editLogData.staff} onChange={e=>setEditLogData(p=>({...p,staff:e.target.value}))} {...inputAttr} placeholder="ชื่อพนักงาน..." style={inputStT}/></div>
          <div><label style={{fontSize:12,fontWeight:600,color:T.textSub,display:"block",marginBottom:5}}>วันที่บันทึก</label>
            <input type="date" value={editLogData.date} onChange={e=>setEditLogData(p=>({...p,date:e.target.value}))} style={inputStT}/></div>
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>{setShowModal(null);setLogAction(null);setLogPinUnlocked(false);setEditLogData(null);}} style={{flex:1,padding:13,borderRadius:11,border:"1.5px solid "+T.border,background:T.card,color:T.text,fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:15}}>ยกเลิก</button>
          <button onClick={saveLogEdit} style={{flex:2,padding:13,borderRadius:11,border:"none",background:"#e8a020",color:"#fff",fontFamily:"inherit",fontWeight:800,cursor:"pointer",fontSize:15}}>✅ บันทึกการแก้ไข</button>
        </div>
      </Modal>}

      {/* ── Log Delete Modal ── */}
      {showModal==="logPin"&&logPinUnlocked&&logAction?.type==="delete"&&<Modal T={T} mob={mob} onClose={()=>{setShowModal(null);setLogAction(null);setLogPinUnlocked(false);}} maxW={360}>
        <div style={{textAlign:"center",padding:"8px 0"}}>
          <div style={{fontSize:44,marginBottom:10}}>🗑️</div>
          <div style={{fontWeight:800,fontSize:17,marginBottom:8,color:T.text}}>ยืนยันการลบประวัติ</div>
          <div style={{background:T.isDark?"#2a1800":"#fff3e0",border:"1.5px solid "+(T.isDark?"#5a3300":"#ffcc80"),borderRadius:10,padding:"10px 14px",marginBottom:18,textAlign:"left"}}>
            <div style={{fontWeight:700,color:"#ff9800",fontSize:13}}>👤 {logAction.log.staff}</div>
            <div style={{color:T.textMuted,fontSize:12,marginTop:3}}>📅 {logAction.log.date} &nbsp;🕐 {logAction.log.timestamp}</div>
            <div style={{color:T.textFaint,fontSize:12,marginTop:3}}>{logAction.log.changes.filter(c=>c.delta!==0).length} รายการเปลี่ยนแปลง</div>
          </div>
          <div style={{color:"#ef5350",fontSize:13,marginBottom:18,fontWeight:600}}>⚠️ ข้อมูลนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้</div>
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>{setShowModal(null);setLogAction(null);setLogPinUnlocked(false);}} style={{flex:1,padding:13,borderRadius:11,border:"1.5px solid "+T.border,background:T.card,color:T.text,fontFamily:"inherit",fontWeight:700,cursor:"pointer",fontSize:15}}>ยกเลิก</button>
            <button onClick={()=>doDeleteLog(logAction.log.id)} style={{flex:1,padding:13,borderRadius:11,border:"none",background:"#ef5350",color:"#fff",fontFamily:"inherit",fontWeight:800,cursor:"pointer",fontSize:15}}>🗑️ ลบเลย</button>
          </div>
        </div>
      </Modal>}

      <style>{`
        @keyframes slideDown{from{opacity:0;transform:translate(-50%,-12px)}to{opacity:1;transform:translate(-50%,0)}}
        @keyframes pulse{0%,100%{box-shadow:0 0 0 0 rgba(232,160,32,.4)}50%{box-shadow:0 0 0 8px rgba(232,160,32,0)}}
        @keyframes shake{0%,100%{transform:translateX(0)}25%{transform:translateX(-6px)}75%{transform:translateX(6px)}}
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
        input:focus,select:focus{outline:2px solid #e8a020;}
        button:active{opacity:.75;transform:scale(.97);}
        ::-webkit-scrollbar{display:none;}
      `}</style>
    </div>
  );
}
