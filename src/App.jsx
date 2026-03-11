import { useState, useMemo, useEffect } from "react";
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

const DEFAULT_CATEGORIES = ["ผัก/ผลไม้","เนื้อสัตว์/อาหารทะเล","เครื่องปรุง","วัตถุดิบแห้ง","เครื่องดื่ม","บรรจุภัณฑ์","อื่นๆ"];
const DEFAULT_UNITS = ["กก.","กรัม","ลิตร","มล.","ขวด","กล่อง","ถุง","ชิ้น","โหล","แพ็ค"];
const DEFAULT_ZONES = ["ครัว","หน้าบ้าน","บาร์","คลังสินค้า","อื่นๆ"];

const ZONE_COLORS = {
  "ครัว":       { bg:"#fff3e0", accent:"#e65100", light:"#ffe0b2", icon:"👨‍🍳" },
  "หน้าบ้าน":   { bg:"#e3f2fd", accent:"#1565c0", light:"#bbdefb", icon:"🪑"  },
  "บาร์":       { bg:"#f3e5f5", accent:"#6a1b9a", light:"#e1bee7", icon:"🍹"  },
  "คลังสินค้า": { bg:"#eceff1", accent:"#37474f", light:"#cfd8dc", icon:"🏭"  },
  "อื่นๆ":      { bg:"#f9fbe7", accent:"#558b2f", light:"#dcedc8", icon:"📦"  },
};
const DEF_ZONE = { bg:"#f0f4ff", accent:"#3949ab", light:"#c5cae9", icon:"📍" };
const getZC = z => ZONE_COLORS[z] || DEF_ZONE;

const STOCK_STATUS = {
  low:    { label:"น้อยมาก", icon:"🔴", color:"#c62828", bg:"#ffebee", border:"#ef9a9a" },
  normal: { label:"ปกติ",    icon:"🟡", color:"#e65100", bg:"#fff8f0", border:"#ffcc80" },
  high:   { label:"มีมาก",   icon:"🟢", color:"#2e7d32", bg:"#e8f5e9", border:"#a5d6a7" },
};
const CAT_COLORS = {
  "ผัก/ผลไม้":            { bg:"#e8f5e9", accent:"#2e7d32", light:"#c8e6c9" },
  "เนื้อสัตว์/อาหารทะเล": { bg:"#fce4ec", accent:"#c62828", light:"#f8bbd9" },
  "เครื่องปรุง":           { bg:"#fff3e0", accent:"#e65100", light:"#ffe0b2" },
  "วัตถุดิบแห้ง":          { bg:"#fff8e1", accent:"#f57f17", light:"#ffecb3" },
  "เครื่องดื่ม":           { bg:"#e3f2fd", accent:"#1565c0", light:"#bbdefb" },
  "บรรจุภัณฑ์":            { bg:"#f3e5f5", accent:"#6a1b9a", light:"#e1bee7" },
  "อื่นๆ":                { bg:"#eceff1", accent:"#37474f", light:"#cfd8dc" },
};
const DEF_CAT = { bg:"#f0f4ff", accent:"#3949ab", light:"#c5cae9" };
const getCC = c => CAT_COLORS[c] || DEF_CAT;
const getSt = s => STOCK_STATUS[s] || STOCK_STATUS.normal;
const today = () => new Date().toISOString().split("T")[0];

const INIT_ITEMS = [
  { id:"item_1", name:"หมูสามชั้น", category:"เนื้อสัตว์/อาหารทะเล", qty:5,  unit:"กก.",  status:"normal", zone:"ครัว" },
  { id:"item_2", name:"ผักบุ้ง",    category:"ผัก/ผลไม้",            qty:2,  unit:"กก.",  status:"low",    zone:"ครัว" },
  { id:"item_3", name:"น้ำมันพืช",  category:"เครื่องปรุง",           qty:4,  unit:"ลิตร", status:"normal", zone:"ครัว" },
  { id:"item_4", name:"ข้าวสาร",    category:"วัตถุดิบแห้ง",          qty:20, unit:"กก.",  status:"high",   zone:"คลังสินค้า" },
  { id:"item_5", name:"น้ำดื่ม",    category:"เครื่องดื่ม",           qty:12, unit:"ขวด",  status:"high",   zone:"หน้าบ้าน" },
];

const NAV = [
  { id:"stock",    icon:"📦", label:"สต๊อค" },
  { id:"log",      icon:"📋", label:"ประวัติ" },
  { id:"summary",  icon:"📊", label:"สรุป 🔒" },
  { id:"settings", icon:"⚙️", label:"ตั้งค่า" },
];

function Chip({ bg, accent, light, children, onDelete }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5, background:bg, borderRadius:50, padding:"6px 10px 6px 13px", border:"1.5px solid "+light }}>
      <span style={{ fontSize:13, fontWeight:600, color:accent }}>{children}</span>
      {onDelete && (
        <button onClick={onDelete} style={{ background:"rgba(0,0,0,.1)", border:"none", borderRadius:"50%", width:17, height:17, cursor:"pointer", color:"#c62828", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center", fontWeight:700, flexShrink:0 }}>×</button>
      )}
    </div>
  );
}

export default function App() {
  const [items,          setItems]          = useState([]);
  const [categories,     setCategories]     = useState(DEFAULT_CATEGORIES);
  const [units,          setUnits]          = useState(DEFAULT_UNITS);
  const [zones,          setZones]          = useState(DEFAULT_ZONES);
  const [logs,           setLogs]           = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const [dbReady,        setDbReady]        = useState(false);
  const [syncing,        setSyncing]        = useState(false);
  const [page,           setPage]           = useState("stock");
  const [showModal,      setShowModal]      = useState(null);
  const [editItem,       setEditItem]       = useState(null);
  const [toast,          setToast]          = useState(null);
  const [filterZone,     setFilterZone]     = useState("ทั้งหมด");
  const [filterStatus,   setFilterStatus]   = useState("ทั้งหมด");
  const [search,         setSearch]         = useState("");
  const [staffName,      setStaffName]      = useState("");
  const [logDate,        setLogDate]        = useState(today());
  const [summaryDate,    setSummaryDate]    = useState(today());
  const [formData,       setFormData]       = useState({ name:"", category:DEFAULT_CATEGORIES[0], qty:"", unit:DEFAULT_UNITS[0], status:"normal", zone:DEFAULT_ZONES[0] });
  const [newCatInput,    setNewCatInput]    = useState("");
  const [newUnitInput,   setNewUnitInput]   = useState("");
  const [newZoneInput,   setNewZoneInput]   = useState("");
  const [ownerPin,       setOwnerPin]       = useState("123456");
  const [pinUnlocked,    setPinUnlocked]    = useState(false);
  const [pinInput,       setPinInput]       = useState("");
  const [pinError,       setPinError]       = useState(false);
  const [changePinStep,  setChangePinStep]  = useState(null);
  const [changePinVal,   setChangePinVal]   = useState("");
  const [changePinErr,   setChangePinErr]   = useState(false);
  // Log edit/delete state
  const [logPinInput,    setLogPinInput]    = useState("");
  const [logPinError,    setLogPinError]    = useState(false);
  const [logPinUnlocked, setLogPinUnlocked] = useState(false);
  const [logAction,      setLogAction]      = useState(null);
  const [editLogData,    setEditLogData]    = useState(null);
  const [mob, setMob] = useState(() => typeof window !== "undefined" ? window.innerWidth < 768 : false);

  useEffect(() => {
    const fn = () => setMob(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);

  // Firebase listeners
  useEffect(() => {
    const unsubItems = onValue(ref(db, "items"), snap => {
      const data = snap.val();
      if (data) {
        setItems(Object.entries(data).map(([id, v]) => ({ ...v, id })));
      } else {
        const seed = {};
        INIT_ITEMS.forEach(it => { seed[it.id] = it; });
        set(ref(db, "items"), seed);
      }
      setDbReady(true);
    });
    const unsubLogs = onValue(ref(db, "logs"), snap => {
      const data = snap.val();
      if (data) {
        setLogs(Object.entries(data).map(([id, v]) => ({ ...v, id })).sort((a, b) => b.timestamp_ms - a.timestamp_ms));
      } else {
        setLogs([]);
      }
    });
    const unsubSettings = onValue(ref(db, "settings"), snap => {
      const data = snap.val();
      if (data) {
        if (data.categories) setCategories(data.categories);
        if (data.units)      setUnits(data.units);
        if (data.zones)      setZones(data.zones);
        if (data.ownerPin)   setOwnerPin(data.ownerPin);
      } else {
        set(ref(db, "settings"), { categories: DEFAULT_CATEGORIES, units: DEFAULT_UNITS, zones: DEFAULT_ZONES, ownerPin: "123456" });
      }
    });
    return () => { unsubItems(); unsubLogs(); unsubSettings(); };
  }, []);

  const toast$ = (msg, type="success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2500); };
  const navTo  = p => { setPage(p); if (p !== "summary") setPinUnlocked(false); };
  const sync   = async fn => { setSyncing(true); try { await fn(); } catch(e) { toast$("เชื่อมต่อล้มเหลว", "error"); } finally { setSyncing(false); } };

  const pressDigit = d => {
    if (pinInput.length >= 6) return;
    const n = pinInput + d; setPinInput(n);
    if (n.length === 6) setTimeout(() => {
      if (n === ownerPin) { setPinUnlocked(true); setPinInput(""); setPinError(false); }
      else { setPinError(true); setPinInput(""); setTimeout(() => setPinError(false), 900); }
    }, 120);
  };

  const filteredItems = useMemo(() => items.filter(it =>
    (filterZone === "ทั้งหมด" || it.zone === filterZone) &&
    (filterStatus === "ทั้งหมด" || it.status === filterStatus) &&
    it.name.toLowerCase().includes(search.toLowerCase())
  ), [items, filterZone, filterStatus, search]);

  const sortedItems = useMemo(() => [...items].sort((a, b) => {
    const so = { low:0, normal:1, high:2 };
    return (so[a.status] ?? 1) - (so[b.status] ?? 1) || a.name.localeCompare(b.name, "th");
  }), [items]);

  const summaryLogs  = useMemo(() => logs.filter(l => l.date === summaryDate), [logs, summaryDate]);
  const lowItems     = items.filter(i => i.status === "low");
  const pendingCount = Object.values(pendingChanges).filter(v => v !== 0).length;

  const applyDelta = (id, d) => {
    const it = items.find(i => i.id === id), cur = pendingChanges[id] ?? 0;
    if (it.qty + cur + d < 0) return;
    setPendingChanges(p => ({ ...p, [id]: cur + d }));
  };
  const setDeltaDirect = (id, val) => {
    const it = items.find(i => i.id === id), p = parseInt(val) || 0;
    if (it.qty + p < 0) return;
    setPendingChanges(prev => ({ ...prev, [id]: p }));
  };
  const setItemStatus = (id, status) => sync(async () => { await update(ref(db, "items/"+id), { status }); });

  const confirmLog = () => {
    if (!staffName.trim()) { toast$("กรุณาใส่ชื่อพนักงาน", "error"); return; }
    sync(async () => {
      const changes = items.map(it => {
        const d = pendingChanges[it.id] ?? 0;
        return { itemId:it.id, itemName:it.name, category:it.category, unit:it.unit, before:it.qty, delta:d, after:it.qty+d };
      });
      const logKey = "log_" + Date.now();
      const logData = { id:logKey, date:logDate, staff:staffName.trim(), changes, timestamp:new Date().toLocaleTimeString("th-TH"), timestamp_ms:Date.now() };
      const updates = {};
      items.forEach(it => { const d = pendingChanges[it.id] ?? 0; if (d !== 0) updates["items/"+it.id+"/qty"] = it.qty + d; });
      updates["logs/"+logKey] = logData;
      await update(ref(db), updates);
      setPendingChanges({}); setStaffName(""); setShowModal(null);
      toast$("บันทึกสำเร็จ โดย " + logData.staff);
    });
  };

  const openAdd  = () => { setFormData({ name:"", category:categories[0], qty:"", unit:units[0], status:"normal", zone:zones[0] }); setEditItem(null); setShowModal("add"); };
  const openEdit = it => { setFormData({ name:it.name, category:it.category, qty:it.qty, unit:it.unit, status:it.status||"normal", zone:it.zone||zones[0] }); setEditItem(it); setShowModal("edit"); };
  const saveItem = () => {
    if (!formData.name.trim() || !formData.qty || !formData.unit || !formData.category) { toast$("กรุณากรอกข้อมูลให้ครบ", "error"); return; }
    sync(async () => {
      if (editItem) {
        await update(ref(db, "items/"+editItem.id), { ...formData, qty:parseFloat(formData.qty) });
        toast$("แก้ไขสำเร็จ");
      } else {
        const newKey = "item_" + Date.now();
        await set(ref(db, "items/"+newKey), { ...formData, qty:parseFloat(formData.qty), id:newKey });
        toast$("เพิ่มสินค้าสำเร็จ");
      }
      setShowModal(null);
    });
  };
  const delItem = id => sync(async () => { await remove(ref(db, "items/"+id)); toast$("ลบสินค้าสำเร็จ"); });

  const saveSettings = patch => sync(async () => { await update(ref(db, "settings"), patch); });
  const addCat  = () => { const v=newCatInput.trim(); if(!v)return; if(categories.includes(v)){toast$("มีอยู่แล้ว","error");return;} saveSettings({categories:[...categories,v]}); setNewCatInput(""); toast$("เพิ่ม \""+v+"\" แล้ว"); };
  const delCat  = c => { if(items.some(i=>i.category===c)){toast$("มีสินค้าอยู่","error");return;} saveSettings({categories:categories.filter(x=>x!==c)}); toast$("ลบ \""+c+"\" แล้ว"); };
  const addUnit = () => { const v=newUnitInput.trim(); if(!v)return; if(units.includes(v)){toast$("มีอยู่แล้ว","error");return;} saveSettings({units:[...units,v]}); setNewUnitInput(""); toast$("เพิ่ม \""+v+"\" แล้ว"); };
  const delUnit = u => { if(items.some(i=>i.unit===u)){toast$("มีสินค้าใช้อยู่","error");return;} saveSettings({units:units.filter(x=>x!==u)}); toast$("ลบ \""+u+"\" แล้ว"); };
  const addZone = () => { const v=newZoneInput.trim(); if(!v)return; if(zones.includes(v)){toast$("มีอยู่แล้ว","error");return;} saveSettings({zones:[...zones,v]}); setNewZoneInput(""); toast$("เพิ่มโซน \""+v+"\" แล้ว"); };
  const delZone = z => { if(items.some(i=>i.zone===z)){toast$("มีสินค้าอยู่","error");return;} saveSettings({zones:zones.filter(x=>x!==z)}); toast$("ลบโซน \""+z+"\" แล้ว"); };

  // Log PIN
  const pressLogPin = d => {
    if (logPinInput.length >= 6) return;
    const n = logPinInput + d; setLogPinInput(n);
    if (n.length === 6) setTimeout(() => {
      if (n === ownerPin) {
        setLogPinUnlocked(true); setLogPinInput(""); setLogPinError(false);
        if (logAction?.type === "edit") setEditLogData({ staff:logAction.log.staff, date:logAction.log.date });
        if (logAction?.type === "delete") doDeleteLog(logAction.log.id);
      } else {
        setLogPinError(true); setLogPinInput(""); setTimeout(() => setLogPinError(false), 900);
      }
    }, 120);
  };
  const openLogEdit   = log => { setLogPinUnlocked(false); setLogPinInput(""); setLogPinError(false); setLogAction({ type:"edit", log }); setShowModal("logPin"); };
  const openLogDelete = log => { setLogPinUnlocked(false); setLogPinInput(""); setLogPinError(false); setLogAction({ type:"delete", log }); setShowModal("logPin"); };
  const doDeleteLog   = id => sync(async () => { await remove(ref(db, "logs/"+id)); toast$("ลบประวัติสำเร็จ"); setShowModal(null); setLogAction(null); setLogPinUnlocked(false); });
  const saveLogEdit   = () => {
    if (!editLogData?.staff?.trim()) { toast$("กรุณาใส่ชื่อพนักงาน", "error"); return; }
    sync(async () => {
      await update(ref(db, "logs/"+logAction.log.id), { staff:editLogData.staff.trim(), date:editLogData.date });
      toast$("แก้ไขประวัติสำเร็จ");
      setShowModal(null); setLogAction(null); setLogPinUnlocked(false); setEditLogData(null);
    });
  };

  const inputSt = { width:"100%", padding:"11px 14px", borderRadius:10, border:"1.5px solid #e0e0e0", fontFamily:"inherit", fontSize:15, boxSizing:"border-box", background:"#fafafa" };
  const pad = mob ? "14px 16px" : "22px 28px";

  // ── Item Card ──────────────────────────────────────────────────
  const ItemCard = ({ item }) => {
    const delta=pendingChanges[item.id]??0, display=item.qty+delta, changed=delta!==0;
    const st=getSt(item.status), col=getCC(item.category), zc=getZC(item.zone);
    return (
      <div style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:changed?"0 0 0 2px "+zc.accent+",0 4px 16px rgba(0,0,0,.1)":"0 1px 8px rgba(0,0,0,.07)", borderLeft:"4px solid "+st.border }}>
        <div style={{ padding:"12px 13px 9px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8 }}>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:15, marginBottom:4 }}>{item.name}</div>
              <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                <span style={{ background:col.bg, color:col.accent, borderRadius:5, padding:"1px 7px", fontSize:11, fontWeight:600 }}>{item.category}</span>
                <span style={{ background:st.bg, color:st.color, borderRadius:5, padding:"1px 7px", fontSize:11, fontWeight:700 }}>{st.icon} {st.label}</span>
              </div>
            </div>
            <div style={{ display:"flex", gap:5, marginLeft:8, flexShrink:0 }}>
              <button onClick={() => openEdit(item)} style={{ background:"#f5f5f5", border:"none", borderRadius:7, width:34, height:34, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
              <button onClick={() => delItem(item.id)} style={{ background:"#fff0f0", border:"none", borderRadius:7, width:34, height:34, cursor:"pointer", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
            </div>
          </div>
          <div style={{ display:"flex", gap:5 }}>
            {Object.entries(STOCK_STATUS).map(([k, v]) => (
              <button key={k} onClick={() => setItemStatus(item.id, k)}
                style={{ flex:1, padding:"6px 3px", borderRadius:8, border:item.status===k?"2px solid "+v.color:"1.5px solid #e8e8e8", background:item.status===k?v.bg:"#fafafa", cursor:"pointer", fontFamily:"inherit", fontSize:11, fontWeight:item.status===k?800:400, color:item.status===k?v.color:"#bbb" }}>
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ background:zc.bg, padding:"10px 13px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <span style={{ fontSize:28, fontWeight:800, color:zc.accent, lineHeight:1 }}>{display}</span>
            <span style={{ fontSize:13, color:"#777", marginLeft:5 }}>{item.unit}</span>
            {changed && <div style={{ fontSize:11, color:delta>0?"#2e7d32":"#c62828", fontWeight:700, marginTop:1 }}>{delta>0?"+"+delta:delta} จากเดิม</div>}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <button onClick={() => applyDelta(item.id, -1)} style={{ width:mob?42:36, height:mob?42:36, borderRadius:9, background:"#fff", border:"2px solid "+zc.light, cursor:"pointer", fontSize:18, fontWeight:800, color:zc.accent, display:"flex", alignItems:"center", justifyContent:"center" }}>−</button>
            <input type="number" value={delta===0?"":delta} onChange={e => setDeltaDirect(item.id, e.target.value)} placeholder="0"
              style={{ width:54, textAlign:"center", border:"2px solid "+zc.light, borderRadius:8, padding:"6px 4px", fontFamily:"inherit", fontSize:14, fontWeight:800, background:"#fff", color:zc.accent }} />
            <button onClick={() => applyDelta(item.id, 1)} style={{ width:mob?42:36, height:mob?42:36, borderRadius:9, background:zc.accent, border:"none", cursor:"pointer", fontSize:18, fontWeight:800, color:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>+</button>
          </div>
        </div>
      </div>
    );
  };

  // ── Modal Shell ────────────────────────────────────────────────
  const Modal = ({ children, maxW=500 }) => (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:1000, display:"flex", alignItems:mob?"flex-end":"center", justifyContent:"center", padding:mob?0:24 }}
      onClick={e => { if (e.target === e.currentTarget) setShowModal(null); }}>
      <div style={{ background:"#fff", borderRadius:mob?"20px 20px 0 0":16, padding:mob?"18px 18px 40px":"26px", width:"100%", maxWidth:mob?9999:maxW, maxHeight:"92vh", overflowY:"auto" }}>
        {mob && <div style={{ width:36, height:4, background:"#e0e0e0", borderRadius:2, margin:"0 auto 16px" }} />}
        {children}
      </div>
    </div>
  );

  // ── Loading ────────────────────────────────────────────────────
  if (!dbReady) return (
    <div style={{ fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", background:"#f5f0eb", gap:16 }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <div style={{ fontSize:52 }}>🍽️</div>
      <div style={{ fontWeight:800, fontSize:20, color:"#1c1c1c" }}>YuGrill Stock</div>
      <div style={{ display:"flex", gap:6 }}>
        {[0,1,2].map(i => <div key={i} style={{ width:10, height:10, borderRadius:"50%", background:"#e8a020", animation:"bounce 1s "+i*0.2+"s infinite" }} />)}
      </div>
      <div style={{ color:"#aaa", fontSize:13 }}>กำลังเชื่อมต่อ Firebase...</div>
      <style>{"@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}"}</style>
    </div>
  );

  // ── Pages ──────────────────────────────────────────────────────
  const StockPage = () => (
    <div style={{ padding:pad }}>
      <div style={{ display:"flex", gap:10, marginBottom:14, flexWrap:"wrap", alignItems:"center" }}>
        <input placeholder="🔍 ค้นหา..." value={search} onChange={e => setSearch(e.target.value)} style={{ ...inputSt, flex:1, minWidth:120, maxWidth:mob?9999:260 }} />
        {!mob && (
          <>
            <button onClick={openAdd} style={{ background:"#1c1c1c", color:"#fff", border:"none", borderRadius:9, padding:"11px 18px", fontFamily:"inherit", fontWeight:700, fontSize:14, cursor:"pointer" }}>＋ เพิ่มสินค้า</button>
            <button onClick={() => setShowModal("confirm")} style={{ background:pendingCount>0?"#e8a020":"#b0b0b0", color:"#fff", border:"none", borderRadius:9, padding:"11px 18px", fontFamily:"inherit", fontWeight:800, fontSize:14, cursor:"pointer", animation:pendingCount>0?"pulse 1.5s infinite":"none" }}>
              💾 บันทึก{pendingCount>0?" ("+pendingCount+")":""}
            </button>
          </>
        )}
      </div>
      <div style={{ overflowX:"auto", scrollbarWidth:"none", marginBottom:9 }}>
        <div style={{ display:"flex", gap:7, width:"max-content" }}>
          {["ทั้งหมด", ...zones].map(z => {
            const zc = z==="ทั้งหมด" ? { accent:"#333" } : getZC(z), on = filterZone===z;
            return <button key={z} onClick={() => setFilterZone(z)} style={{ padding:"7px 15px", borderRadius:50, border:"none", background:on?zc.accent:"#fff", color:on?"#fff":"#666", fontFamily:"inherit", fontWeight:on?700:500, fontSize:13, cursor:"pointer", whiteSpace:"nowrap", boxShadow:on?"0 2px 10px rgba(0,0,0,.18)":"0 1px 3px rgba(0,0,0,.07)" }}>
              {z==="ทั้งหมด" ? "📍 ทั้งหมด" : getZC(z).icon+" "+z}
            </button>;
          })}
        </div>
      </div>
      <div style={{ overflowX:"auto", scrollbarWidth:"none", marginBottom:18 }}>
        <div style={{ display:"flex", gap:6, width:"max-content" }}>
          {[{ v:"ทั้งหมด", l:"ทั้งหมด", i:"📦" }, ...Object.entries(STOCK_STATUS).map(([k,v]) => ({ v:k, l:v.label, i:v.icon }))].map(s => {
            const on = filterStatus===s.v;
            return <button key={s.v} onClick={() => setFilterStatus(s.v)} style={{ padding:"6px 13px", borderRadius:50, border:"1.5px solid "+(on?"#1c1c1c":"#ddd"), background:on?"#1c1c1c":"#fff", color:on?"#fff":"#666", fontFamily:"inherit", fontWeight:on?700:500, fontSize:12, cursor:"pointer", whiteSpace:"nowrap" }}>
              {s.i} {s.l}
            </button>;
          })}
        </div>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:mob?"repeat(4,1fr)":"repeat(4,auto)", gap:mob?8:12, marginBottom:20, justifyContent:mob?"stretch":"start" }}>
        {[{ l:"ทั้งหมด", v:items.length, c:"#1c1c1c" }, { l:"น้อยมาก", v:lowItems.length, c:"#c62828" }, { l:"ปกติ", v:items.filter(i=>i.status==="normal").length, c:"#e65100" }, { l:"มีมาก", v:items.filter(i=>i.status==="high").length, c:"#2e7d32" }].map(s => (
          <div key={s.l} style={{ background:"#fff", borderRadius:10, padding:mob?"8px 6px":"10px 18px", textAlign:mob?"center":"left", boxShadow:"0 1px 4px rgba(0,0,0,.06)", display:mob?"block":"flex", alignItems:"center", gap:mob?0:10 }}>
            <div style={{ fontSize:mob?18:22, fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:mob?10:13, color:"#888", marginTop:mob?1:0 }}>{s.l}</div>
          </div>
        ))}
      </div>
      {zones.filter(z => filterZone==="ทั้งหมด" || filterZone===z).map(zone => {
        const zoneItems = filteredItems.filter(it => it.zone===zone);
        if (!zoneItems.length) return null;
        const zc = getZC(zone);
        return (
          <div key={zone} style={{ marginBottom:26 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:11 }}>
              <div style={{ background:zc.accent, color:"#fff", borderRadius:8, padding:"4px 14px", fontSize:13, fontWeight:800 }}>{zc.icon} {zone}</div>
              <span style={{ fontSize:12, color:"#aaa" }}>{zoneItems.length} รายการ</span>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(300px,1fr))", gap:11 }}>
              {zoneItems.map(item => <ItemCard key={item.id} item={item} />)}
            </div>
          </div>
        );
      })}
      {!filteredItems.length && <div style={{ textAlign:"center", padding:"60px 0", color:"#ccc" }}><div style={{ fontSize:48 }}>📭</div><div style={{ fontSize:16, marginTop:10 }}>ไม่พบสินค้า</div></div>}
      {mob && <button onClick={openAdd} style={{ position:"fixed", bottom:86, right:18, width:54, height:54, borderRadius:"50%", background:"#1c1c1c", border:"none", cursor:"pointer", fontSize:26, color:"#fff", boxShadow:"0 4px 20px rgba(0,0,0,.3)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:90 }}>＋</button>}
    </div>
  );

  const LogPage = () => (
    <div style={{ padding:pad }}>
      <h2 style={{ fontWeight:800, fontSize:mob?20:22, marginBottom:16 }}>📋 ประวัติการบันทึก</h2>
      {!logs.length
        ? <div style={{ textAlign:"center", padding:"60px 0", color:"#ccc" }}><div style={{ fontSize:48 }}>📭</div><div style={{ fontSize:16, marginTop:10 }}>ยังไม่มีประวัติ</div></div>
        : <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(460px,1fr))", gap:13 }}>
            {logs.map(log => {
              const changed = log.changes.filter(c => c.delta!==0);
              const unchanged = log.changes.filter(c => c.delta===0);
              return (
                <div key={log.id} style={{ background:"#fff", borderRadius:14, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
                  <div style={{ background:"#1c1c1c", padding:"11px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <div style={{ flex:1, minWidth:0 }}>
                      <span style={{ color:"#e8a020", fontWeight:800, fontSize:14 }}>👤 {log.staff}</span>
                      <div style={{ color:"#666", fontSize:11, marginTop:2 }}>📅 {log.date} &nbsp;🕐 {log.timestamp}</div>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:6, flexShrink:0 }}>
                      <span style={{ color:"#888", fontSize:11, background:"#2a2a2a", borderRadius:7, padding:"3px 9px" }}>{changed.length} เปลี่ยน</span>
                      <button onClick={() => openLogEdit(log)} title="แก้ไข" style={{ background:"#2a2a2a", border:"none", borderRadius:7, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>✏️</button>
                      <button onClick={() => openLogDelete(log)} title="ลบ" style={{ background:"#3a1a1a", border:"none", borderRadius:7, width:30, height:30, cursor:"pointer", fontSize:13, display:"flex", alignItems:"center", justifyContent:"center" }}>🗑️</button>
                    </div>
                  </div>
                  <div style={{ padding:"12px 16px" }}>
                    {changed.length > 0 && (
                      <div style={{ marginBottom:10 }}>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
                          <div style={{ width:3, height:12, background:"#2e7d32", borderRadius:2 }} />
                          <span style={{ fontSize:11, fontWeight:800, color:"#2e7d32", textTransform:"uppercase", letterSpacing:.5 }}>เปลี่ยนแปลง</span>
                        </div>
                        {changed.map((c, i) => {
                          const col = getCC(c.category);
                          return (
                            <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 11px", background:col.bg, borderRadius:9, marginBottom:5 }}>
                              <div><div style={{ fontWeight:700, fontSize:13 }}>{c.itemName}</div><div style={{ fontSize:11, color:"#888" }}>{c.before} → {c.after} {c.unit}</div></div>
                              <span style={{ fontWeight:800, fontSize:16, color:c.delta>0?"#2e7d32":"#c62828" }}>{c.delta>0?"+"+c.delta:c.delta}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    {unchanged.length > 0 && (
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:8 }}>
                          <div style={{ width:3, height:12, background:"#bdbdbd", borderRadius:2 }} />
                          <span style={{ fontSize:11, fontWeight:800, color:"#aaa", textTransform:"uppercase", letterSpacing:.5 }}>คงที่</span>
                        </div>
                        <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
                          {unchanged.map((c, i) => (
                            <div key={i} style={{ display:"flex", alignItems:"center", gap:5, background:"#f0f0f0", border:"1px solid #e0e0e0", borderRadius:8, padding:"5px 10px" }}>
                              <span style={{ fontSize:12, color:"#aaa" }}>🔒</span>
                              <span style={{ fontSize:12, color:"#bbb", fontWeight:600 }}>{c.itemName}</span>
                              <span style={{ fontSize:11, color:"#d0d0d0" }}>{c.before} {c.unit}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
      }
    </div>
  );

  const SummaryPage = () => {
    const [sortCol, setSortCol] = useState("status");
    const [sortDir, setSortDir] = useState("asc");

    const handleSort = col => {
      if (sortCol === col) setSortDir(d => d==="asc"?"desc":"asc");
      else { setSortCol(col); setSortDir("asc"); }
    };

    const sortedSummaryItems = useMemo(() => {
      const statusOrder = { low:0, normal:1, high:2 };
      return [...items].sort((a, b) => {
        let va, vb;
        if (sortCol==="name")     { va=a.name; vb=b.name; }
        else if (sortCol==="qty") { va=a.qty;  vb=b.qty; }
        else if (sortCol==="status") { va=statusOrder[a.status]??1; vb=statusOrder[b.status]??1; }
        else if (sortCol==="zone")   { va=a.zone; vb=b.zone; }
        else if (sortCol==="category") { va=a.category; vb=b.category; }
        else { va=a.name; vb=b.name; }
        if (typeof va==="string") return sortDir==="asc" ? va.localeCompare(vb,"th") : vb.localeCompare(va,"th");
        return sortDir==="asc" ? va-vb : vb-va;
      });
    }, [items, sortCol, sortDir]);

    const SortBtn = ({ col, label }) => {
      const active = sortCol===col;
      return (
        <button onClick={() => handleSort(col)} style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:active?800:600, fontSize:12, color:active?"#e8a020":"#aaa", display:"inline-flex", alignItems:"center", gap:3, padding:0, whiteSpace:"nowrap" }}>
          {label}
          <span style={{ fontSize:10, opacity:active?1:0.3 }}>{active?(sortDir==="asc"?"▲":"▼"):"⇅"}</span>
        </button>
      );
    };

    if (!pinUnlocked) return (
      <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"70vh", padding:16 }}>
        <div style={{ background:"#fff", borderRadius:22, padding:"36px 28px", width:"100%", maxWidth:340, textAlign:"center", boxShadow:"0 8px 40px rgba(0,0,0,.12)" }}>
          <div style={{ fontSize:50, marginBottom:10 }}>🔒</div>
          <div style={{ fontWeight:800, fontSize:19, marginBottom:4 }}>หน้าสรุปเจ้าของ</div>
          <div style={{ fontSize:13, color:"#aaa", marginBottom:26 }}>ใส่ PIN 6 หลัก</div>
          <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:26 }}>
            {[0,1,2,3,4,5].map(i => <div key={i} style={{ width:13, height:13, borderRadius:"50%", background:i<pinInput.length?(pinError?"#c62828":"#1c1c1c"):"#e0e0e0", transition:"background .15s", animation:pinError?"shake .3s ease":"none" }} />)}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:9 }}>
            {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={() => pressDigit(String(n))} style={{ padding:"16px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, fontWeight:700, cursor:"pointer", color:"#1c1c1c" }}>{n}</button>)}
            <div /><button onClick={() => pressDigit("0")} style={{ padding:"16px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, fontWeight:700, cursor:"pointer", color:"#1c1c1c" }}>0</button>
            <button onClick={() => setPinInput(p => p.slice(0,-1))} style={{ padding:"16px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, cursor:"pointer", color:"#888" }}>⌫</button>
          </div>
          {pinError && <div style={{ color:"#c62828", fontWeight:700, fontSize:13, animation:"shake .3s ease" }}>PIN ไม่ถูกต้อง</div>}
        </div>
      </div>
    );

    return (
      <div style={{ padding:pad }}>

        {/* ── Header ── */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
          <div>
            <h2 style={{ fontWeight:800, fontSize:mob?20:22, margin:0 }}>📊 สรุปสต๊อค</h2>
            <div style={{ fontSize:12, color:"#aaa", marginTop:3 }}>อัปเดตล่าสุด: {new Date().toLocaleString("th-TH")}</div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
            <div style={{ background:"#fff", borderRadius:9, padding:"7px 13px", display:"flex", gap:7, alignItems:"center", boxShadow:"0 1px 4px rgba(0,0,0,.07)" }}>
              <span style={{ fontSize:13, color:"#666" }}>📅</span>
              <input type="date" value={summaryDate} onChange={e => setSummaryDate(e.target.value)} style={{ border:"none", fontFamily:"inherit", fontSize:14, fontWeight:700, cursor:"pointer", outline:"none" }} />
            </div>
            <button onClick={() => { setPinUnlocked(false); navTo("stock"); }} style={{ background:"#f5f5f5", border:"none", borderRadius:9, padding:"7px 13px", fontFamily:"inherit", fontWeight:600, fontSize:13, cursor:"pointer", color:"#888" }}>🔒 ล็อค</button>
          </div>
        </div>

        {/* ── Section 1: ภาพรวม ── */}
        <div style={{ marginBottom:8 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:4, height:18, background:"#e8a020", borderRadius:2 }} />
            <span style={{ fontWeight:800, fontSize:15, color:"#1c1c1c" }}>ภาพรวมสต๊อค</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:mob?"repeat(2,1fr)":"repeat(4,1fr)", gap:11, marginBottom:24 }}>
            {[{ l:"สินค้าทั้งหมด", v:items.length, i:"📦", c:"#1c1c1c", bg:"#f5f5f5" }, { l:"น้อยมาก 🔴", v:lowItems.length, i:"🔴", c:"#c62828", bg:"#ffebee" }, { l:"ปกติ 🟡", v:items.filter(i=>i.status==="normal").length, i:"🟡", c:"#e65100", bg:"#fff8f0" }, { l:"มีมาก 🟢", v:items.filter(i=>i.status==="high").length, i:"🟢", c:"#2e7d32", bg:"#e8f5e9" }].map(s => (
              <div key={s.l} style={{ background:s.bg, borderRadius:13, padding:"14px 16px", boxShadow:"0 2px 8px rgba(0,0,0,.06)", border:"1.5px solid "+(s.c==="#c62828"?"#ef9a9a":s.c==="#e65100"?"#ffcc80":s.c==="#2e7d32"?"#a5d6a7":"#e0e0e0") }}>
                <div style={{ fontSize:26, fontWeight:800, color:s.c }}>{s.v}</div>
                <div style={{ fontSize:12, color:s.c, opacity:.7, marginTop:2, fontWeight:600 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Section 2: รายการสต๊อค (sortable) ── */}
        <div style={{ marginBottom:24 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:4, height:18, background:"#3949ab", borderRadius:2 }} />
            <span style={{ fontWeight:800, fontSize:15, color:"#1c1c1c" }}>รายการสต๊อคทั้งหมด</span>
            <span style={{ fontSize:12, color:"#aaa", fontWeight:500 }}>({items.length} รายการ)</span>
          </div>
          <div style={{ background:"#fff", borderRadius:13, overflow:"hidden", boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
            {/* Table header */}
            <div style={{ background:"#f7f7f7", borderBottom:"2px solid #ebebeb", padding:"10px 16px", display:"grid", gridTemplateColumns:mob?"2fr 1fr 1fr":"3fr 1fr 1fr 1fr 1fr", gap:8, alignItems:"center" }}>
              <SortBtn col="name"     label="ชื่อสินค้า" />
              {!mob && <SortBtn col="category" label="ประเภท" />}
              {!mob && <SortBtn col="zone"     label="โซน" />}
              <SortBtn col="qty"    label="จำนวน" />
              <SortBtn col="status" label="สถานะ" />
            </div>
            {/* Rows */}
            {sortedSummaryItems.map((item, idx) => {
              const col=getCC(item.category), st=getSt(item.status), zc=getZC(item.zone);
              const isLow = item.status==="low";
              return (
                <div key={item.id} style={{ padding:"11px 16px", borderBottom:"1px solid #f5f5f5", display:"grid", gridTemplateColumns:mob?"2fr 1fr 1fr":"3fr 1fr 1fr 1fr 1fr", gap:8, alignItems:"center", background:isLow?"#fff8f8":idx%2===0?"#fff":"#fafafa", transition:"background .15s" }}>
                  <div style={{ minWidth:0 }}>
                    <div style={{ fontWeight:700, fontSize:14, display:"flex", alignItems:"center", gap:6 }}>
                      {isLow && <span style={{ fontSize:10, background:"#c62828", color:"#fff", borderRadius:4, padding:"1px 5px", fontWeight:700, flexShrink:0 }}>!</span>}
                      {item.name}
                    </div>
                    {mob && (
                      <div style={{ display:"flex", gap:4, marginTop:3, flexWrap:"wrap" }}>
                        <span style={{ background:col.bg, color:col.accent, borderRadius:4, padding:"1px 5px", fontSize:10, fontWeight:600 }}>{item.category}</span>
                        <span style={{ background:zc.bg, color:zc.accent, borderRadius:4, padding:"1px 5px", fontSize:10, fontWeight:600 }}>{zc.icon} {item.zone}</span>
                      </div>
                    )}
                  </div>
                  {!mob && <span style={{ background:col.bg, color:col.accent, borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:600, whiteSpace:"nowrap", textAlign:"center" }}>{item.category}</span>}
                  {!mob && <span style={{ background:zc.bg, color:zc.accent, borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:600, whiteSpace:"nowrap", textAlign:"center" }}>{zc.icon} {item.zone}</span>}
                  <div style={{ fontWeight:800, fontSize:15, color:"#1c1c1c" }}>{item.qty} <span style={{ fontSize:11, color:"#bbb", fontWeight:500 }}>{item.unit}</span></div>
                  <span style={{ background:st.bg, color:st.color, borderRadius:6, padding:"3px 8px", fontSize:11, fontWeight:700, whiteSpace:"nowrap", textAlign:"center" }}>{st.icon} {st.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Section 3: บันทึกวันที่เลือก ── */}
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:4, height:18, background:"#2e7d32", borderRadius:2 }} />
            <span style={{ fontWeight:800, fontSize:15, color:"#1c1c1c" }}>บันทึกวันที่ {summaryDate}</span>
            <span style={{ fontSize:12, color:"#aaa", fontWeight:500 }}>({summaryLogs.length} รายการ)</span>
          </div>
          {summaryLogs.length === 0
            ? <div style={{ background:"#fff", borderRadius:13, padding:"28px 16px", textAlign:"center", color:"#ccc", boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
                <div style={{ fontSize:36, marginBottom:8 }}>📭</div>
                <div style={{ fontSize:14 }}>ไม่มีบันทึกในวันนี้</div>
              </div>
            : summaryLogs.map(log => {
                const logChanged = log.changes.filter(c=>c.delta!==0);
                return (
                  <div key={log.id} style={{ background:"#fff", borderRadius:13, overflow:"hidden", marginBottom:10, boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
                    <div style={{ background:"#1c1c1c", padding:"10px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <div>
                        <span style={{ color:"#e8a020", fontWeight:800, fontSize:14 }}>👤 {log.staff}</span>
                        <span style={{ color:"#666", fontSize:11, marginLeft:10 }}>🕐 {log.timestamp}</span>
                      </div>
                      <span style={{ background:"#2a2a2a", color:"#888", fontSize:11, borderRadius:7, padding:"3px 9px" }}>{logChanged.length} รายการ</span>
                    </div>
                    <div style={{ padding:"12px 16px" }}>
                      {logChanged.length===0
                        ? <div style={{ fontSize:13, color:"#ccc" }}>ไม่มีการเปลี่ยนแปลง</div>
                        : logChanged.map((c, i) => {
                            const cc = getCC(c.category);
                            return (
                              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 11px", background:cc.bg, borderRadius:9, marginBottom:5 }}>
                                <div>
                                  <div style={{ fontWeight:700, fontSize:13 }}>{c.itemName}</div>
                                  <div style={{ fontSize:11, color:"#888" }}>{c.before} → {c.after} {c.unit}</div>
                                </div>
                                <span style={{ fontWeight:800, fontSize:16, color:c.delta>0?"#2e7d32":"#c62828" }}>{c.delta>0?"+"+c.delta:c.delta}</span>
                              </div>
                            );
                          })
                      }
                    </div>
                  </div>
                );
              })
          }
        </div>

      </div>
    );
  };

  const SettingsSection = ({ title, inputVal, setInput, onAdd, placeholder, chips }) => (
    <div style={{ background:"#fff", borderRadius:13, padding:17, boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
      <div style={{ fontWeight:700, fontSize:14, marginBottom:11 }}>{title}</div>
      <div style={{ display:"flex", gap:8, marginBottom:11 }}>
        <input placeholder={placeholder} value={inputVal} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key==="Enter" && onAdd()} style={{ ...inputSt, flex:1, fontSize:14 }} />
        <button onClick={onAdd} style={{ background:"#1c1c1c", color:"#fff", border:"none", borderRadius:9, padding:"0 15px", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:14, flexShrink:0 }}>+ เพิ่ม</button>
      </div>
      <div style={{ display:"flex", flexWrap:"wrap", gap:7 }}>{chips}</div>
    </div>
  );

  const SettingsPage = () => (
    <div style={{ padding:pad }}>
      <h2 style={{ fontWeight:800, fontSize:mob?20:22, marginBottom:18 }}>⚙️ ตั้งค่า</h2>
      <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(2,1fr)", gap:13, alignItems:"start" }}>
        <SettingsSection title="📍 โซนทำงาน" inputVal={newZoneInput} setInput={setNewZoneInput} onAdd={addZone} placeholder="ชื่อโซนใหม่..."
          chips={zones.map(z => { const zc=getZC(z), inUse=items.some(i=>i.zone===z); return <Chip key={z} bg={zc.bg} accent={zc.accent} light={zc.light} onDelete={!inUse?()=>delZone(z):null}>{zc.icon} {z}{inUse&&<span style={{fontSize:9,color:"#bbb",marginLeft:3}}>ใช้งาน</span>}</Chip>; })} />
        <SettingsSection title="🗂️ ประเภทสินค้า" inputVal={newCatInput} setInput={setNewCatInput} onAdd={addCat} placeholder="ชื่อประเภทใหม่..."
          chips={categories.map(c => { const col=getCC(c), inUse=items.some(i=>i.category===c); return <Chip key={c} bg={col.bg} accent={col.accent} light={col.light} onDelete={!inUse?()=>delCat(c):null}>{c}{inUse&&<span style={{fontSize:9,color:"#bbb",marginLeft:3}}>ใช้งาน</span>}</Chip>; })} />
        <SettingsSection title="📐 หน่วยนับ" inputVal={newUnitInput} setInput={setNewUnitInput} onAdd={addUnit} placeholder="หน่วยใหม่..."
          chips={units.map(u => { const inUse=items.some(i=>i.unit===u); return <Chip key={u} bg="#f0f4ff" accent="#3949ab" light="#c5cae9" onDelete={!inUse?()=>delUnit(u):null}>{u}{inUse&&<span style={{fontSize:9,color:"#bbb",marginLeft:3}}>ใช้งาน</span>}</Chip>; })} />
        <div style={{ background:"#fff", borderRadius:13, padding:17, boxShadow:"0 2px 8px rgba(0,0,0,.07)" }}>
          <div style={{ fontWeight:700, fontSize:14, marginBottom:11 }}>🔒 PIN เจ้าของ</div>
          {changePinStep===null && <button onClick={() => { setChangePinStep("verify"); setChangePinVal(""); setChangePinErr(false); }} style={{ background:"#1c1c1c", color:"#fff", border:"none", borderRadius:9, padding:"12px 18px", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:14, width:"100%" }}>🔑 เปลี่ยน PIN</button>}
          {changePinStep==="verify" && (
            <div>
              <div style={{ fontSize:12, color:"#666", marginBottom:7 }}>ใส่ PIN ปัจจุบัน</div>
              <div style={{ display:"flex", gap:7 }}>
                <input type="password" maxLength={6} value={changePinVal} onChange={e => setChangePinVal(e.target.value.replace(/\D/g,""))} placeholder="• • • • • •" style={{ ...inputSt, flex:1, fontSize:18, letterSpacing:8 }} />
                <button onClick={() => { if(changePinVal===ownerPin){setChangePinStep("new");setChangePinVal("");setChangePinErr(false);}else{setChangePinErr(true);setChangePinVal("");} }} style={{ background:"#1c1c1c", color:"#fff", border:"none", borderRadius:9, padding:"0 14px", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:14 }}>ยืนยัน</button>
                <button onClick={() => { setChangePinStep(null); setChangePinVal(""); setChangePinErr(false); }} style={{ background:"#f5f5f5", border:"none", borderRadius:9, padding:"0 11px", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#888" }}>ยกเลิก</button>
              </div>
              {changePinErr && <div style={{ color:"#c62828", fontSize:12, marginTop:5 }}>PIN ไม่ถูกต้อง</div>}
            </div>
          )}
          {changePinStep==="new" && (
            <div>
              <div style={{ fontSize:12, color:"#666", marginBottom:7 }}>ใส่ PIN ใหม่ 6 หลัก</div>
              <div style={{ display:"flex", gap:7 }}>
                <input type="password" maxLength={6} value={changePinVal} onChange={e => setChangePinVal(e.target.value.replace(/\D/g,""))} placeholder="• • • • • •" style={{ ...inputSt, flex:1, fontSize:18, letterSpacing:8 }} />
                <button onClick={() => { if(changePinVal.length===6){saveSettings({ownerPin:changePinVal});setChangePinStep(null);setChangePinVal("");toast$("เปลี่ยน PIN สำเร็จ");} }} style={{ background:"#2e7d32", color:"#fff", border:"none", borderRadius:9, padding:"0 14px", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:14 }}>บันทึก</button>
                <button onClick={() => { setChangePinStep(null); setChangePinVal(""); }} style={{ background:"#f5f5f5", border:"none", borderRadius:9, padding:"0 11px", cursor:"pointer", fontFamily:"inherit", fontSize:13, color:"#888" }}>ยกเลิก</button>
              </div>
              {changePinVal.length>0 && changePinVal.length<6 && <div style={{ color:"#aaa", fontSize:11, marginTop:5 }}>ต้องการ 6 หลัก ({changePinVal.length}/6)</div>}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────
  return (
    <div style={{ fontFamily:"'Sarabun','Noto Sans Thai',sans-serif", background:"#f5f0eb", minHeight:"100vh", color:"#1a1a1a", display:"flex", flexDirection:"column" }}>
      <link href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap" rel="stylesheet" />

      {toast && (
        <div style={{ position:"fixed", top:16, left:"50%", transform:"translateX(-50%)", zIndex:9999, background:toast.type==="error"?"#c62828":"#1c1c1c", color:"#fff", padding:"11px 22px", borderRadius:50, fontWeight:700, fontSize:14, boxShadow:"0 4px 24px rgba(0,0,0,.25)", animation:"slideDown .25s ease", whiteSpace:"nowrap" }}>
          {toast.type==="error" ? "⚠️" : "✅"} {toast.msg}
        </div>
      )}

      {syncing && <div style={{ position:"fixed", top:0, left:0, right:0, height:3, background:"linear-gradient(90deg,#e8a020,#f5c842,#e8a020)", backgroundSize:"200% 100%", animation:"shimmer 1s infinite", zIndex:10000 }} />}

      <header style={{ background:"#1c1c1c", height:mob?52:58, display:"flex", alignItems:"center", justifyContent:"space-between", padding:mob?"0 16px":"0 28px", flexShrink:0, position:"sticky", top:0, zIndex:100, boxShadow:"0 2px 12px rgba(0,0,0,.3)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:mob?20:22 }}>🍽️</span>
          <div>
            <div style={{ color:"#fff", fontWeight:800, fontSize:mob?15:17, lineHeight:1.1 }}>จัดการสต๊อคร้าน YuGrill</div>
            {!mob && <div style={{ color:"#e8a020", fontSize:10, fontWeight:600 }}>🔥 Firebase Realtime Sync</div>}
          </div>
        </div>
        {!mob ? (
          <nav style={{ display:"flex", alignItems:"center", gap:3 }}>
            {NAV.map(n => (
              <button key={n.id} onClick={() => navTo(n.id)} style={{ background:page===n.id?"#e8a020":"transparent", color:page===n.id?"#fff":"#999", border:"none", borderRadius:8, padding:"7px 15px", fontFamily:"inherit", fontWeight:page===n.id?700:500, fontSize:14, cursor:"pointer" }}>
                {n.icon} {n.label}
              </button>
            ))}
            {page==="stock" && (
              <button onClick={() => setShowModal("confirm")} style={{ background:pendingCount>0?"#e8a020":"#b0b0b0", color:"#fff", border:"none", borderRadius:8, padding:"7px 15px", fontFamily:"inherit", fontWeight:800, fontSize:14, cursor:"pointer", marginLeft:6, animation:pendingCount>0?"pulse 1.5s infinite":"none" }}>
                💾 บันทึก{pendingCount>0?" ("+pendingCount+")":""}
              </button>
            )}
          </nav>
        ) : (
          page==="stock" && (
            <button onClick={() => setShowModal("confirm")} style={{ background:pendingCount>0?"#e8a020":"#b0b0b0", border:"none", borderRadius:9, padding:"7px 12px", cursor:"pointer", fontFamily:"inherit", fontWeight:800, fontSize:13, color:"#fff", display:"flex", alignItems:"center", gap:5, animation:pendingCount>0?"pulse 1.5s infinite":"none" }}>
              💾 {pendingCount>0 && <span style={{ background:"rgba(0,0,0,.25)", borderRadius:50, width:18, height:18, display:"inline-flex", alignItems:"center", justifyContent:"center", fontSize:10 }}>{pendingCount}</span>}
            </button>
          )
        )}
      </header>

      {lowItems.length > 0 && page==="stock" && (
        <div style={{ background:"#ffebee", borderBottom:"2px solid #ef9a9a", padding:"8px 16px", display:"flex", alignItems:"center", gap:8 }}>
          <span>🔴</span>
          <span style={{ fontWeight:700, color:"#c62828", fontSize:13 }}>น้อยมาก: </span>
          <span style={{ color:"#b71c1c", fontSize:13, flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{lowItems.map(i=>i.name).join(" • ")}</span>
        </div>
      )}

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {!mob && (
          <aside style={{ width:196, background:"#fff", borderRight:"1px solid #ede8e2", flexShrink:0, display:"flex", flexDirection:"column", overflowY:"auto" }}>
            <div style={{ padding:"16px 14px 5px", fontSize:10, fontWeight:700, color:"#ccc", textTransform:"uppercase", letterSpacing:1 }}>เมนู</div>
            {NAV.map(n => (
              <button key={n.id} onClick={() => navTo(n.id)} style={{ background:page===n.id?"#fff8f0":"transparent", color:page===n.id?"#e8a020":"#666", border:"none", borderLeft:page===n.id?"3px solid #e8a020":"3px solid transparent", padding:"11px 17px", fontFamily:"inherit", fontWeight:page===n.id?700:500, fontSize:14, cursor:"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
                <span style={{ fontSize:16 }}>{n.icon}</span>{n.label}
              </button>
            ))}
            <div style={{ margin:"14px 11px 0", padding:"13px", background:"#f7f3ee", borderRadius:11 }}>
              <div style={{ fontSize:10, fontWeight:700, color:"#ccc", marginBottom:9, textTransform:"uppercase", letterSpacing:1 }}>ภาพรวม</div>
              {[{ l:"ทั้งหมด", v:items.length, c:"#1c1c1c" }, { l:"น้อยมาก", v:lowItems.length, c:"#c62828" }, { l:"ปกติ", v:items.filter(i=>i.status==="normal").length, c:"#e65100" }, { l:"มีมาก", v:items.filter(i=>i.status==="high").length, c:"#2e7d32" }].map(s => (
                <div key={s.l} style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <span style={{ fontSize:12, color:"#888" }}>{s.l}</span>
                  <span style={{ fontSize:14, fontWeight:800, color:s.c }}>{s.v}</span>
                </div>
              ))}
            </div>
            {lowItems.length > 0 && (
              <div style={{ margin:"9px 11px 0", padding:"9px", background:"#ffebee", borderRadius:9, border:"1px solid #ef9a9a" }}>
                <div style={{ fontSize:10, fontWeight:700, color:"#c62828", marginBottom:4 }}>🔴 สต๊อคน้อยมาก</div>
                {lowItems.map(i => <div key={i.id} style={{ fontSize:11, color:"#b71c1c" }}>• {i.name}</div>)}
              </div>
            )}
            <div style={{ margin:"9px 11px 14px", padding:"8px 10px", background:"#e8f5e9", borderRadius:9, border:"1px solid #a5d6a7", display:"flex", alignItems:"center", gap:7 }}>
              <span style={{ fontSize:14 }}>🔥</span>
              <div><div style={{ fontSize:10, fontWeight:700, color:"#2e7d32" }}>Firebase Connected</div><div style={{ fontSize:9, color:"#81c784" }}>Real-time sync</div></div>
            </div>
          </aside>
        )}
        <main style={{ flex:1, overflowY:"auto", paddingBottom:mob?80:0 }}>
          {page==="stock"    && <StockPage />}
          {page==="log"      && <LogPage />}
          {page==="summary"  && <SummaryPage />}
          {page==="settings" && <SettingsPage />}
        </main>
      </div>

      {mob && (
        <nav style={{ position:"fixed", bottom:0, left:0, right:0, background:"#fff", borderTop:"1px solid #ebebeb", display:"grid", gridTemplateColumns:"repeat(4,1fr)", zIndex:200, boxShadow:"0 -2px 14px rgba(0,0,0,.07)" }}>
          {NAV.map(n => (
            <button key={n.id} onClick={() => navTo(n.id)} style={{ background:"none", border:"none", padding:"9px 4px 10px", cursor:"pointer", fontFamily:"inherit", display:"flex", flexDirection:"column", alignItems:"center", gap:2, position:"relative" }}>
              {page===n.id && <div style={{ position:"absolute", top:0, left:"50%", transform:"translateX(-50%)", width:26, height:3, background:"#e8a020", borderRadius:"0 0 3px 3px" }} />}
              <span style={{ fontSize:22 }}>{n.icon}</span>
              <span style={{ fontSize:10, fontWeight:page===n.id?800:500, color:page===n.id?"#e8a020":"#bbb" }}>{n.label}</span>
            </button>
          ))}
        </nav>
      )}

      {/* Add / Edit Item Modal */}
      {(showModal==="add" || showModal==="edit") && (
        <Modal>
          <h3 style={{ fontWeight:800, fontSize:18, marginBottom:16 }}>{showModal==="add" ? "➕ เพิ่มสินค้าใหม่" : "✏️ แก้ไขสินค้า"}</h3>
          <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:12 }}>
            <div><label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:5 }}>ชื่อสินค้า *</label><input value={formData.name} onChange={e => setFormData(p => ({ ...p, name:e.target.value }))} style={inputSt} /></div>
            <div><label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:5 }}>จำนวน *</label><input type="number" value={formData.qty} onChange={e => setFormData(p => ({ ...p, qty:e.target.value }))} style={inputSt} /></div>
            <div><label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:5 }}>โซนทำงาน *</label><select value={formData.zone} onChange={e => setFormData(p => ({ ...p, zone:e.target.value }))} style={inputSt}>{zones.map(z => { const zc=getZC(z); return <option key={z} value={z}>{zc.icon} {z}</option>; })}</select></div>
            <div><label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:5 }}>ประเภท *</label><select value={formData.category} onChange={e => setFormData(p => ({ ...p, category:e.target.value }))} style={inputSt}>{categories.map(c => <option key={c}>{c}</option>)}</select></div>
            <div><label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:5 }}>หน่วย *</label><select value={formData.unit} onChange={e => setFormData(p => ({ ...p, unit:e.target.value }))} style={inputSt}>{units.map(u => <option key={u}>{u}</option>)}</select></div>
            <div>
              <label style={{ fontSize:12, color:"#555", fontWeight:600, display:"block", marginBottom:7 }}>สถานะ *</label>
              <div style={{ display:"flex", gap:6 }}>
                {Object.entries(STOCK_STATUS).map(([k, v]) => (
                  <button key={k} type="button" onClick={() => setFormData(p => ({ ...p, status:k }))}
                    style={{ flex:1, padding:"10px 3px", borderRadius:9, border:formData.status===k?"2px solid "+v.color:"1.5px solid #e8e8e8", background:formData.status===k?v.bg:"#fafafa", cursor:"pointer", fontFamily:"inherit", fontSize:12, fontWeight:formData.status===k?800:400, color:formData.status===k?v.color:"#bbb" }}>
                    {v.icon}<br />{v.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={{ display:"flex", gap:10, marginTop:20 }}>
            <button onClick={() => setShowModal(null)} style={{ flex:1, padding:13, borderRadius:11, border:"1.5px solid #ddd", background:"#fff", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:15 }}>ยกเลิก</button>
            <button onClick={saveItem} style={{ flex:2, padding:13, borderRadius:11, border:"none", background:"#1c1c1c", color:"#fff", fontFamily:"inherit", fontWeight:800, cursor:"pointer", fontSize:15 }}>บันทึก</button>
          </div>
        </Modal>
      )}

      {/* Confirm Log Modal */}
      {showModal==="confirm" && (() => {
        const changedItems   = items.filter(it => (pendingChanges[it.id]??0) !== 0);
        const unchangedItems = items.filter(it => (pendingChanges[it.id]??0) === 0);
        return (
          <Modal maxW={500}>
            <h3 style={{ fontWeight:800, fontSize:18, marginBottom:4 }}>💾 บันทึกรายการ</h3>
            <p style={{ color:"#999", fontSize:13, marginBottom:16 }}>ตรวจสอบและยืนยันการบันทึกสต๊อค</p>
            <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"1fr 1fr", gap:10, marginBottom:16 }}>
              <div><label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:5 }}>ชื่อพนักงาน *</label><input placeholder="กรอกชื่อ..." value={staffName} onChange={e => setStaffName(e.target.value)} style={inputSt} /></div>
              <div><label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:5 }}>วันที่บันทึก</label><input type="date" value={logDate} onChange={e => setLogDate(e.target.value)} style={inputSt} /></div>
            </div>
            <div style={{ display:"flex", gap:8, marginBottom:14 }}>
              <div style={{ background:"#e8f5e9", border:"1.5px solid #a5d6a7", borderRadius:9, padding:"7px 14px", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>✏️</span>
                <div><div style={{ fontSize:18, fontWeight:800, color:"#2e7d32", lineHeight:1 }}>{changedItems.length}</div><div style={{ fontSize:10, color:"#4caf50" }}>เปลี่ยนแปลง</div></div>
              </div>
              <div style={{ background:"#f0f0f0", border:"1.5px solid #d8d8d8", borderRadius:9, padding:"7px 14px", display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:16 }}>🔒</span>
                <div><div style={{ fontSize:18, fontWeight:800, color:"#888", lineHeight:1 }}>{unchangedItems.length}</div><div style={{ fontSize:10, color:"#aaa" }}>คงที่</div></div>
              </div>
            </div>
            {changedItems.length > 0 && (
              <div style={{ marginBottom:12 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
                  <div style={{ width:3, height:14, background:"#2e7d32", borderRadius:2 }} />
                  <span style={{ fontSize:12, fontWeight:800, color:"#2e7d32", textTransform:"uppercase", letterSpacing:.5 }}>รายการที่เปลี่ยนแปลง</span>
                </div>
                <div style={{ background:"#f1faf3", border:"1.5px solid #c8e6c9", borderRadius:11, overflow:"hidden" }}>
                  {changedItems.map((it, i) => {
                    const d=pendingChanges[it.id], isAdd=d>0;
                    return (
                      <div key={it.id} style={{ display:"flex", alignItems:"center", padding:"10px 13px", borderBottom:i<changedItems.length-1?"1px solid #c8e6c9":"none", gap:10 }}>
                        <div style={{ width:28, height:28, borderRadius:8, background:isAdd?"#e8f5e9":"#ffebee", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14, flexShrink:0 }}>{isAdd?"➕":"➖"}</div>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ fontWeight:700, fontSize:14, color:"#1a1a1a" }}>{it.name}</div>
                          <div style={{ fontSize:11, color:"#888" }}>{it.qty} → {it.qty+d} {it.unit}</div>
                        </div>
                        <div style={{ background:isAdd?"#2e7d32":"#c62828", color:"#fff", borderRadius:7, padding:"4px 10px", fontWeight:800, fontSize:14, flexShrink:0 }}>{isAdd?"+"+d:d}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            {unchangedItems.length > 0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:7 }}>
                  <div style={{ width:3, height:14, background:"#9e9e9e", borderRadius:2 }} />
                  <span style={{ fontSize:12, fontWeight:800, color:"#9e9e9e", textTransform:"uppercase", letterSpacing:.5 }}>คงที่ (ไม่เปลี่ยนแปลง)</span>
                </div>
                <div style={{ background:"#f0f0f0", border:"1.5px solid #d8d8d8", borderRadius:11, overflow:"hidden" }}>
                  {unchangedItems.map((it, i) => (
                    <div key={it.id} style={{ display:"flex", alignItems:"center", padding:"9px 13px", borderBottom:i<unchangedItems.length-1?"1px solid #e0e0e0":"none", gap:10, background:i%2===0?"#f0f0f0":"#ebebeb" }}>
                      <div style={{ width:28, height:28, borderRadius:8, background:"#dcdcdc", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, flexShrink:0 }}>🔒</div>
                      <div style={{ flex:1, minWidth:0 }}>
                        <div style={{ fontWeight:600, fontSize:13, color:"#777" }}>{it.name}</div>
                        <div style={{ fontSize:11, color:"#aaa" }}>{it.qty} {it.unit}</div>
                      </div>
                      <div style={{ background:"#d6d6d6", color:"#888", borderRadius:7, padding:"4px 10px", fontWeight:700, fontSize:12, flexShrink:0, border:"1px solid #c8c8c8" }}>คงที่</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowModal(null)} style={{ flex:1, padding:13, borderRadius:11, border:"1.5px solid #ddd", background:"#fff", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:15 }}>ยกเลิก</button>
              <button onClick={confirmLog} style={{ flex:2, padding:13, borderRadius:11, border:"none", background:"#e8a020", color:"#fff", fontFamily:"inherit", fontWeight:800, cursor:"pointer", fontSize:15 }}>✅ ยืนยันบันทึก</button>
            </div>
          </Modal>
        );
      })()}

      {/* Log PIN Modal */}
      {showModal==="logPin" && !logPinUnlocked && (
        <Modal maxW={340}>
          <div style={{ textAlign:"center" }}>
            <div style={{ fontSize:40, marginBottom:8 }}>{logAction?.type==="delete" ? "🗑️" : "✏️"}</div>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>{logAction?.type==="delete" ? "ลบประวัติ" : "แก้ไขประวัติ"}</div>
            <div style={{ fontSize:13, color:"#aaa", marginBottom:22 }}>ใส่ PIN เจ้าของเพื่อดำเนินการ</div>
            <div style={{ display:"flex", justifyContent:"center", gap:10, marginBottom:22 }}>
              {[0,1,2,3,4,5].map(i => <div key={i} style={{ width:13, height:13, borderRadius:"50%", background:i<logPinInput.length?(logPinError?"#c62828":"#1c1c1c"):"#e0e0e0", transition:"background .15s", animation:logPinError?"shake .3s ease":"none" }} />)}
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:9, marginBottom:9 }}>
              {[1,2,3,4,5,6,7,8,9].map(n => <button key={n} onClick={() => pressLogPin(String(n))} style={{ padding:"14px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, fontWeight:700, cursor:"pointer", color:"#1c1c1c" }}>{n}</button>)}
              <div /><button onClick={() => pressLogPin("0")} style={{ padding:"14px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, fontWeight:700, cursor:"pointer", color:"#1c1c1c" }}>0</button>
              <button onClick={() => setLogPinInput(p => p.slice(0,-1))} style={{ padding:"14px 0", borderRadius:12, border:"1.5px solid #ebebeb", background:"#fafafa", fontFamily:"inherit", fontSize:20, cursor:"pointer", color:"#888" }}>⌫</button>
            </div>
            {logPinError && <div style={{ color:"#c62828", fontWeight:700, fontSize:13, marginBottom:8, animation:"shake .3s ease" }}>PIN ไม่ถูกต้อง</div>}
            <button onClick={() => { setShowModal(null); setLogAction(null); setLogPinInput(""); }} style={{ width:"100%", padding:12, borderRadius:11, border:"1.5px solid #ddd", background:"#fff", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:14, marginTop:4 }}>ยกเลิก</button>
          </div>
        </Modal>
      )}

      {/* Log Edit Modal */}
      {showModal==="logPin" && logPinUnlocked && logAction?.type==="edit" && editLogData && (
        <Modal maxW={400}>
          <h3 style={{ fontWeight:800, fontSize:17, marginBottom:4 }}>✏️ แก้ไขประวัติ</h3>
          <p style={{ color:"#aaa", fontSize:12, marginBottom:18 }}>แก้ไขได้เฉพาะชื่อพนักงาน และวันที่บันทึก</p>
          <div style={{ background:"#f7f7f7", borderRadius:10, padding:"10px 13px", marginBottom:16 }}>
            <div style={{ fontSize:11, fontWeight:700, color:"#aaa", marginBottom:8, textTransform:"uppercase", letterSpacing:.5 }}>รายการที่เปลี่ยนแปลง (ดูอย่างเดียว)</div>
            {logAction.log.changes.filter(c=>c.delta!==0).length===0
              ? <div style={{ fontSize:12, color:"#ccc" }}>ไม่มีการเปลี่ยนแปลง</div>
              : logAction.log.changes.filter(c=>c.delta!==0).map((c, i) => (
                <div key={i} style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#666", padding:"4px 0", borderBottom:"1px solid #efefef" }}>
                  <span>{c.itemName}</span>
                  <span style={{ fontWeight:700, color:c.delta>0?"#2e7d32":"#c62828" }}>{c.delta>0?"+"+c.delta:c.delta} {c.unit}</span>
                </div>
              ))
            }
          </div>
          <div style={{ display:"grid", gap:12, marginBottom:20 }}>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:5 }}>ชื่อพนักงาน *</label>
              <input value={editLogData.staff} onChange={e => setEditLogData(p => ({ ...p, staff:e.target.value }))} style={inputSt} placeholder="ชื่อพนักงาน..." />
            </div>
            <div>
              <label style={{ fontSize:12, fontWeight:600, color:"#555", display:"block", marginBottom:5 }}>วันที่บันทึก</label>
              <input type="date" value={editLogData.date} onChange={e => setEditLogData(p => ({ ...p, date:e.target.value }))} style={inputSt} />
            </div>
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button onClick={() => { setShowModal(null); setLogAction(null); setLogPinUnlocked(false); setEditLogData(null); }} style={{ flex:1, padding:13, borderRadius:11, border:"1.5px solid #ddd", background:"#fff", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:15 }}>ยกเลิก</button>
            <button onClick={saveLogEdit} style={{ flex:2, padding:13, borderRadius:11, border:"none", background:"#e8a020", color:"#fff", fontFamily:"inherit", fontWeight:800, cursor:"pointer", fontSize:15 }}>✅ บันทึกการแก้ไข</button>
          </div>
        </Modal>
      )}

      {/* Log Delete Confirm Modal */}
      {showModal==="logPin" && logPinUnlocked && logAction?.type==="delete" && (
        <Modal maxW={360}>
          <div style={{ textAlign:"center", padding:"8px 0" }}>
            <div style={{ fontSize:44, marginBottom:10 }}>🗑️</div>
            <div style={{ fontWeight:800, fontSize:17, marginBottom:8 }}>ยืนยันการลบประวัติ</div>
            <div style={{ background:"#fff3e0", border:"1.5px solid #ffcc80", borderRadius:10, padding:"10px 14px", marginBottom:18, textAlign:"left" }}>
              <div style={{ fontWeight:700, color:"#e65100", fontSize:13 }}>👤 {logAction.log.staff}</div>
              <div style={{ color:"#888", fontSize:12, marginTop:3 }}>📅 {logAction.log.date} &nbsp;🕐 {logAction.log.timestamp}</div>
              <div style={{ color:"#aaa", fontSize:12, marginTop:3 }}>{logAction.log.changes.filter(c=>c.delta!==0).length} รายการเปลี่ยนแปลง</div>
            </div>
            <div style={{ color:"#c62828", fontSize:13, marginBottom:18, fontWeight:600 }}>⚠️ ข้อมูลนี้จะถูกลบถาวร ไม่สามารถกู้คืนได้</div>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => { setShowModal(null); setLogAction(null); setLogPinUnlocked(false); }} style={{ flex:1, padding:13, borderRadius:11, border:"1.5px solid #ddd", background:"#fff", fontFamily:"inherit", fontWeight:700, cursor:"pointer", fontSize:15 }}>ยกเลิก</button>
              <button onClick={() => doDeleteLog(logAction.log.id)} style={{ flex:1, padding:13, borderRadius:11, border:"none", background:"#c62828", color:"#fff", fontFamily:"inherit", fontWeight:800, cursor:"pointer", fontSize:15 }}>🗑️ ลบเลย</button>
            </div>
          </div>
        </Modal>
      )}

      <style>{`
        @keyframes slideDown { from { opacity:0; transform:translate(-50%,-12px) } to { opacity:1; transform:translate(-50%,0) } }
        @keyframes pulse { 0%,100% { box-shadow:0 0 0 0 rgba(232,160,32,.4) } 50% { box-shadow:0 0 0 8px rgba(232,160,32,0) } }
        @keyframes shake { 0%,100% { transform:translateX(0) } 25% { transform:translateX(-6px) } 75% { transform:translateX(6px) } }
        @keyframes shimmer { 0% { background-position:200% 0 } 100% { background-position:-200% 0 } }
        @keyframes bounce { 0%,100% { transform:translateY(0) } 50% { transform:translateY(-8px) } }
        * { box-sizing:border-box; -webkit-tap-highlight-color:transparent; }
        input:focus, select:focus { outline:2px solid #e8a020; background:#fff; }
        button:active { opacity:.75; transform:scale(.97); }
        ::-webkit-scrollbar { display:none; }
      `}</style>
    </div>
  );
}
