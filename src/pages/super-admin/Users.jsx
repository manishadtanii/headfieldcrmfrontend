import { useState, useEffect } from 'react';
import {
  Plus, Search, X, Loader2, ToggleLeft, ToggleRight, LogOut,
  KeyRound, Copy, Eye, EyeOff, Check, Users, Shield, Wifi,
  Globe, Mail, Building2, Clock, ChevronDown,
} from 'lucide-react';
import { adminUserAPI, adminBusinessAPI } from '../../api';
import toast from 'react-hot-toast';

// ── Helpers ───────────────────────────────────────────────────────
function timeAgo(date) {
  if (!date) return 'Never';
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

const ROLE_CONFIG = {
  businessAdmin: { label: 'Biz Admin', color: '#818cf8', bg: '#818cf818', grad: 'linear-gradient(135deg,#818cf8,#a78bfa)' },
  employee:      { label: 'Employee',  color: '#34d399', bg: '#34d39918', grad: 'linear-gradient(135deg,#34d399,#6ee7b7)' },
};

// ── Confirm Modal ─────────────────────────────────────────────────
const ConfirmModal = ({ config, loading, onConfirm, onCancel }) => (
  <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onCancel}>
    <div style={{ background:'var(--bg-card)',border:`1px solid var(--border)`,borderRadius:20,width:'100%',maxWidth:420,overflow:'hidden',boxShadow:`0 24px 60px rgba(0,0,0,0.4)` }} onClick={e=>e.stopPropagation()}>
      <div style={{ height:4,background:config.accentColor }} />
      <div style={{ padding:'28px 28px 24px' }}>
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:20 }}>
          <div style={{ width:56,height:56,borderRadius:14,background:config.iconBg,border:`1px solid ${config.iconBorder}`,display:'flex',alignItems:'center',justifyContent:'center' }}>{config.icon}</div>
          <span style={{ fontSize:11,fontWeight:700,padding:'4px 12px',borderRadius:20,background:config.badgeBg,color:config.badgeColor,border:`1px solid ${config.badgeColor}30` }}>{config.badge}</span>
        </div>
        <div style={{ fontSize:19,fontWeight:800,marginBottom:12 }}>{config.title}</div>
        <div style={{ background:'var(--bg-elevated)',borderRadius:10,padding:'14px 16px',border:'1px solid var(--border)',marginBottom:20 }}>
          {config.lines.map((line,i)=>(
            <p key={i} style={{ fontSize:13,color:i===0?'var(--text)':'var(--text-muted)',lineHeight:1.6,marginBottom:i<config.lines.length-1?8:0 }} dangerouslySetInnerHTML={{__html:line}} />
          ))}
        </div>
        <div style={{ display:'flex',gap:10 }}>
          <button onClick={onCancel} style={{ flex:1,padding:'11px 0',borderRadius:10,fontSize:13,fontWeight:600,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text)',cursor:'pointer' }}>Cancel</button>
          <button onClick={onConfirm} disabled={loading} style={{ flex:1,padding:'11px 0',borderRadius:10,fontSize:13,fontWeight:700,cursor:loading?'not-allowed':'pointer',opacity:loading?0.7:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,...config.confirmStyle }}>
            {loading?<><Loader2 size={14} style={{animation:'spin 1s linear infinite'}}/>Processing…</>:config.confirmText}
          </button>
        </div>
      </div>
    </div>
  </div>
);

// ── Credentials Box ───────────────────────────────────────────────
const CredRow = ({ label, icon, value, mono, sensitive, divider }) => {
  const [show, setShow] = useState(!sensitive);
  return (
    <div style={{ padding:'11px 14px',borderBottom:divider?'1px solid var(--border)':'none',display:'flex',alignItems:'center',gap:10 }}>
      <span style={{ color:'var(--text-muted)',flexShrink:0 }}>{icon}</span>
      <span style={{ fontSize:12,color:'var(--text-muted)',width:72,flexShrink:0 }}>{label}</span>
      <span style={{ flex:1,fontSize:13,fontWeight:600,fontFamily:mono?'monospace':'inherit',letterSpacing:mono?0.3:0,wordBreak:'break-all' }}>
        {sensitive&&!show?'••••••••••':value}
      </span>
      <div style={{ display:'flex',gap:4,flexShrink:0 }}>
        {sensitive&&<button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:3 }} onClick={()=>setShow(s=>!s)}>{show?<EyeOff size={12}/>:<Eye size={12}/>}</button>}
        <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:3 }} onClick={()=>{navigator.clipboard.writeText(value);toast.success(`${label} copied!`);}}><Copy size={12}/></button>
      </div>
    </div>
  );
};

const CredentialsBox = ({ creds, onClose }) => {
  const copyAll = () => {
    const text = `Name: ${creds.name}\nEmail: ${creds.email}\nPassword: ${creds.tempPassword}${creds.loginUrl?`\nLogin URL: ${creds.loginUrl}`:''}`;
    navigator.clipboard.writeText(text);
    toast.success('All credentials copied!');
  };
  return (
    <div style={{ position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20 }} onClick={onClose}>
      <div style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:20,width:'100%',maxWidth:460,overflow:'hidden',boxShadow:'0 24px 60px rgba(0,0,0,0.4)' }} onClick={e=>e.stopPropagation()}>
        <div style={{ height:4,background:'linear-gradient(90deg,#34d399,#6ee7b7)' }}/>
        <div style={{ padding:'24px 26px 20px' }}>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:16 }}>
            <div style={{ display:'flex',alignItems:'center',gap:10 }}>
              <div style={{ width:40,height:40,borderRadius:10,background:'#34d39918',border:'1px solid #34d39930',display:'flex',alignItems:'center',justifyContent:'center' }}><Check size={18} color="#34d399"/></div>
              <div>
                <div style={{ fontWeight:800,fontSize:16 }}>Credentials Ready</div>
                <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2 }}>Save — password won't show again</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:'var(--bg-elevated)',border:'1px solid var(--border)',borderRadius:8,padding:6,cursor:'pointer',display:'flex' }}><X size={15}/></button>
          </div>
          <div style={{ background:'var(--bg-elevated)',borderRadius:12,border:'1px solid var(--border)',overflow:'hidden',marginBottom:16 }}>
            {[
              { key:'Name',     icon:<Users size={13}/>,    val:creds.name,         mono:false        },
              { key:'Email',    icon:<Mail size={13}/>,     val:creds.email,        mono:true         },
              { key:'Password', icon:<KeyRound size={13}/>, val:creds.tempPassword, mono:true, sens:true },
              ...(creds.loginUrl?[{ key:'Login URL',icon:<Globe size={13}/>,val:creds.loginUrl,mono:true }]:[]),
            ].map(({ key, icon, val, mono, sens }, i, arr) => (
              <CredRow key={key} label={key} icon={icon} value={val} mono={mono} sensitive={sens} divider={i<arr.length-1} />
            ))}
          </div>
          <div style={{ display:'flex',gap:10 }}>
            <button onClick={copyAll} style={{ flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:7,padding:'10px 0',borderRadius:10,fontSize:13,fontWeight:600,background:'var(--bg-elevated)',border:'1px solid var(--border)',color:'var(--text)',cursor:'pointer' }}><Copy size={13}/>Copy All</button>
            <button onClick={onClose} style={{ flex:1,padding:'10px 0',borderRadius:10,fontSize:13,fontWeight:700,background:'linear-gradient(135deg,#34d399,#6ee7b7)',border:'none',color:'white',cursor:'pointer' }}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Password mini (inline) ────────────────────────────────────────
const PasswordCell = ({ password }) => {
  const [show, setShow] = useState(false);
  if (!password) return <span style={{ color:'var(--text-muted)',fontSize:12 }}>—</span>;
  return (
    <div style={{ display:'flex',alignItems:'center',gap:4 }}>
      <span style={{ fontFamily:'monospace',fontSize:12 }}>{show?password:'••••••••'}</span>
      <button className="btn btn-ghost btn-icon" style={{ padding:3 }} onClick={()=>setShow(s=>!s)}>{show?<EyeOff size={11}/>:<Eye size={11}/>}</button>
      <button className="btn btn-ghost btn-icon" style={{ padding:3 }} onClick={()=>{navigator.clipboard.writeText(password);toast.success('Password copied!');}}><Copy size={11}/></button>
    </div>
  );
};

// ── Create User Modal ─────────────────────────────────────────────
const CreateUserModal = ({ onClose, onCreated }) => {
  const [form, setForm] = useState({ name:'',email:'',businessId:'' });
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  useEffect(()=>{
    adminBusinessAPI.getAll({ limit:100,isActive:'true' }).then(res=>{
      setBusinesses(res.data.data);
      if (res.data.data.length>0) setForm(f=>({...f,businessId:res.data.data[0].id}));
    });
  },[]);
  const handleSubmit = async (e)=>{
    e.preventDefault();
    if (!form.name||!form.email||!form.businessId) return toast.error('All fields required.');
    setLoading(true);
    try {
      const res = await adminUserAPI.create({...form,role:'businessAdmin'});
      onCreated(res.data.credentials);
      onClose();
    } catch(err){ toast.error(err?.response?.data?.message||'Failed.'); }
    finally { setLoading(false); }
  };
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e=>e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">Create New User</div>
          <button className="btn btn-ghost btn-icon" onClick={onClose}><X size={18}/></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label className="form-label">Full Name *</label><input className="form-input" placeholder="John Doe" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))}/></div>
          <div className="form-group"><label className="form-label">Email *</label><input className="form-input" type="email" placeholder="john@company.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))}/></div>
          <div className="form-group">
            <label className="form-label">Business *</label>
            <select className="form-select" value={form.businessId} onChange={e=>setForm(f=>({...f,businessId:e.target.value}))}>
              <option value="">Select business</option>
              {businesses.map(b=><option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div style={{ display:'flex',gap:10,justifyContent:'flex-end',marginTop:8 }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading?<Loader2 size={16} style={{animation:'spin 1s linear infinite'}}/>:'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ── User Card ─────────────────────────────────────────────────────
const UserCard = ({ user, onToggle, onLogout, onResetPW }) => {
  const rc = ROLE_CONFIG[user.role] || { label: user.role, color:'#6b7280', bg:'#6b728018', grad:'linear-gradient(135deg,#6b7280,#9ca3af)' };
  const loginUrl = user.business?.slug ? `${window.location.origin}/${user.business.slug}/login` : null;

  return (
    <div style={{
      background:'var(--bg-card)', border:'1px solid var(--border)',
      borderRadius:16, overflow:'hidden',
      transition:'transform 0.18s, box-shadow 0.18s',
      display:'flex', flexDirection:'column',
    }}
      onMouseEnter={e=>{ e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow=`0 12px 32px rgba(0,0,0,0.2)`; }}
      onMouseLeave={e=>{ e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}
    >
      {/* Top accent */}
      <div style={{ height:3, background:rc.grad }} />

      <div style={{ padding:'16px 18px', flex:1 }}>
        {/* Header row */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:10, marginBottom:14 }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            {/* Avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <div style={{ width:44, height:44, borderRadius:'50%', background:rc.grad, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:18, color:'white' }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              {/* Online dot */}
              {user.isOnline && (
                <div style={{ position:'absolute', bottom:1, right:1, width:11, height:11, borderRadius:'50%', background:'#34d399', border:'2px solid var(--bg-card)' }} />
              )}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontWeight:800, fontSize:14, lineHeight:1.2 }}>{user.name}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:3 }}>
                <span style={{ fontSize:11, color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:140 }}>{user.email}</span>
                <button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex',padding:2,flexShrink:0 }}
                  onClick={()=>{navigator.clipboard.writeText(user.email);toast.success('Email copied!');}}><Copy size={10}/></button>
              </div>
            </div>
          </div>
          {/* Role badge */}
          <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:rc.bg,color:rc.color,border:`1px solid ${rc.color}30`,whiteSpace:'nowrap',flexShrink:0 }}>
            {rc.label}
          </span>
        </div>

        {/* Business + URL */}
        {user.business && (
          <div style={{ background:'var(--bg-elevated)', borderRadius:10, padding:'10px 12px', marginBottom:12, border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:loginUrl?6:0 }}>
              <Building2 size={12} color="var(--text-muted)" style={{ flexShrink:0 }}/>
              <span style={{ fontSize:12, fontWeight:600 }}>{user.business.name}</span>
            </div>
            {loginUrl && (
              <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                <Globe size={11} color="#818cf8" style={{ flexShrink:0 }}/>
                <span style={{ fontSize:11, color:'#818cf8', fontFamily:'monospace', flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  /{user.business.slug}/login
                </span>
                <button
                  style={{ background:'#818cf815',border:'1px solid #818cf830',borderRadius:6,padding:'2px 8px',cursor:'pointer',color:'#818cf8',fontSize:10,fontWeight:700,display:'flex',alignItems:'center',gap:4,flexShrink:0,whiteSpace:'nowrap' }}
                  onClick={()=>{navigator.clipboard.writeText(loginUrl);toast.success('Login URL copied!');}}
                >
                  <Copy size={9}/> Copy URL
                </button>
              </div>
            )}
          </div>
        )}

        {/* Password row */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
          <span style={{ fontSize:11, color:'var(--text-muted)', fontWeight:600 }}>Password</span>
          <PasswordCell password={user.tempPassword}/>
        </div>

        {/* Status + Online + Last Login */}
        <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
          <span style={{ fontSize:11,fontWeight:700,padding:'3px 10px',borderRadius:20,background:user.isActive?'#34d39918':'#ef444418',color:user.isActive?'#34d399':'#ef4444',border:`1px solid ${user.isActive?'#34d39930':'#ef444430'}` }}>
            {user.isActive?'● Active':'○ Inactive'}
          </span>
          {user.isOnline
            ? <span style={{ fontSize:11,fontWeight:700,color:'#34d399',background:'#34d39914',padding:'3px 10px',borderRadius:20 }}>● Live</span>
            : null}
          <span style={{ fontSize:11,color:'var(--text-muted)',display:'flex',alignItems:'center',gap:4,marginLeft:'auto' }}>
            <Clock size={11}/>{timeAgo(user.lastLogin)}
          </span>
        </div>
      </div>

      {/* Footer actions */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'10px 16px', borderTop:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
        <span style={{ fontSize:11, color:'var(--text-muted)' }}>
          Joined {new Date(user.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
        </span>
        <div style={{ display:'flex', gap:4 }}>
          {/* Toggle */}
          <button className="btn btn-ghost btn-icon btn-sm" title={user.isActive?'Deactivate':'Activate'} onClick={()=>onToggle(user)}>
            {user.isActive?<ToggleRight size={16} color="#34d399"/>:<ToggleLeft size={16}/>}
          </button>
          {/* Force Logout — visibility:hidden to preserve layout */}
          <button className="btn btn-ghost btn-icon btn-sm" title="Force Logout"
            onClick={()=>user.isOnline&&onLogout(user)}
            style={{ color:'#fbbf24', visibility:user.isOnline?'visible':'hidden' }}>
            <LogOut size={14}/>
          </button>
          {/* Reset PW */}
          <button className="btn btn-ghost btn-icon btn-sm" title="Reset Password" onClick={()=>onResetPW(user)} style={{ color:'#818cf8' }}>
            <KeyRound size={14}/>
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────
export default function SAUsers() {
  const [users, setUsers]     = useState([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [page, setPage]       = useState(1);
  const [showCreate, setShowCreate] = useState(false);
  const [credentials, setCredentials] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const LIMIT = 12;

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit:LIMIT };
      if (search)     params.search = search;
      if (filterRole) params.role   = filterRole;
      const res = await adminUserAPI.getAll(params);
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch { toast.error('Failed to load users.'); }
    finally { setLoading(false); }
  };

  useEffect(()=>{ fetchUsers(); },[page, search, filterRole]);

  const handleConfirm = async () => {
    if (!confirm) return;
    setConfirmLoading(true);
    try {
      if (confirm.type==='toggle') {
        const res = await adminUserAPI.toggle(confirm.user._id);
        toast.success(res.data.message);
      } else if (confirm.type==='logout') {
        const res = await adminUserAPI.forceLogout(confirm.user._id);
        toast.success(res.data.message);
      } else if (confirm.type==='reset') {
        const res = await adminUserAPI.resetPassword(confirm.user._id);
        toast.success('Password reset!');
        setCredentials(res.data.credentials);
      }
      fetchUsers();
      setConfirm(null);
    } catch(err){ toast.error(err?.response?.data?.message||'Failed.'); }
    finally { setConfirmLoading(false); }
  };

  const buildConfig = (type, user) => {
    if (type==='toggle') {
      const isDeac = user.isActive;
      return {
        accentColor: isDeac?'#f59e0b':'#34d399',
        icon: isDeac?<ToggleLeft size={26} color="#f59e0b"/>:<ToggleRight size={26} color="#34d399"/>,
        iconBg: isDeac?'#f59e0b18':'#34d39918', iconBorder: isDeac?'#f59e0b30':'#34d39930',
        badge: isDeac?'Reversible Action':'Restoring Access',
        badgeBg: isDeac?'#f59e0b15':'#34d39915', badgeColor: isDeac?'#f59e0b':'#34d399',
        title: isDeac?'Deactivate User':'Activate User',
        lines: isDeac
          ? [`Deactivating <strong>${user.name}</strong>.`,'Login access removed immediately. All data stays safe.']
          : [`Reactivating <strong>${user.name}</strong>.`,'They will regain login access immediately.'],
        confirmText: isDeac?'Yes, Deactivate':'Yes, Activate',
        confirmStyle: isDeac?{ background:'#f59e0b',color:'white',border:'none' }:{ background:'#34d399',color:'white',border:'none' },
      };
    }
    if (type==='logout') return {
      accentColor:'#f59e0b',
      icon:<LogOut size={26} color="#f59e0b"/>,
      iconBg:'#f59e0b18', iconBorder:'#f59e0b30',
      badge:'Immediate Action', badgeBg:'#f59e0b15', badgeColor:'#f59e0b',
      title:'Force Logout',
      lines:[`Force logging out <strong>${user.name}</strong>.`,'Session will be terminated immediately. They can log back in if still active.'],
      confirmText:'Yes, Force Logout',
      confirmStyle:{ background:'#f59e0b',color:'white',border:'none' },
    };
    return {
      accentColor:'#818cf8',
      icon:<KeyRound size={26} color="#818cf8"/>,
      iconBg:'#818cf818', iconBorder:'#818cf830',
      badge:'New Credentials Generated', badgeBg:'#818cf815', badgeColor:'#818cf8',
      title:'Reset Password',
      lines:[`Reset password for <strong>${user.name}</strong>?`,'A new temp password will be generated. Share credentials securely.'],
      confirmText:'Yes, Reset Password',
      confirmStyle:{ background:'linear-gradient(135deg,#818cf8,#a78bfa)',color:'white',border:'none' },
    };
  };

  const admins  = users.filter(u=>u.role==='businessAdmin').length;
  const emps    = users.filter(u=>u.role==='employee').length;
  const online  = users.filter(u=>u.isOnline).length;

  return (
    <div className="page-content">

      {/* Header */}
      <div style={{ display:'flex',alignItems:'flex-start',justifyContent:'space-between',marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24,fontWeight:800,letterSpacing:'-0.5px' }}>Users</h1>
          <p style={{ color:'var(--text-muted)',marginTop:4,fontSize:14 }}>{total} total users on platform</p>
        </div>
        <button className="btn btn-primary" onClick={()=>setShowCreate(true)} style={{ display:'flex',alignItems:'center',gap:6 }}>
          <Plus size={16}/> New User
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:24 }}>
        {[
          { icon:Shield, label:'Biz Admins',     value:admins, color:'#818cf8', grad:'linear-gradient(90deg,#818cf8,#a78bfa)' },
          { icon:Users,  label:'Employees',       value:emps,   color:'#34d399', grad:'linear-gradient(90deg,#34d399,#6ee7b7)' },
          { icon:Wifi,   label:'Online Right Now', value:online, color:'#fbbf24', grad:'linear-gradient(90deg,#fbbf24,#f59e0b)' },
        ].map(({ icon:Icon, label, value, color, grad })=>(
          <div key={label} style={{ background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'14px 18px',display:'flex',alignItems:'center',gap:14,position:'relative',overflow:'hidden' }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,height:2,background:grad }}/>
            <div style={{ width:38,height:38,borderRadius:10,background:`${color}18`,display:'flex',alignItems:'center',justifyContent:'center' }}><Icon size={16} color={color}/></div>
            <div>
              <div style={{ fontSize:22,fontWeight:800,lineHeight:1 }}>{value}</div>
              <div style={{ fontSize:12,color:'var(--text-muted)',marginTop:2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter */}
      <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:20,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:12,padding:'12px 16px' }}>
        <Search size={14} color="var(--text-muted)"/>
        <input
          style={{ background:'none',border:'none',outline:'none',fontSize:14,color:'var(--text)',flex:1 }}
          placeholder="Search by name or email…"
          value={search}
          onChange={e=>{ setSearch(e.target.value); setPage(1); }}
        />
        {search&&<button style={{ background:'none',border:'none',cursor:'pointer',color:'var(--text-muted)',display:'flex' }} onClick={()=>{ setSearch(''); setPage(1); }}><X size={14}/></button>}
        <div style={{ width:1,height:20,background:'var(--border)' }}/>
        <select style={{ background:'none',border:'none',outline:'none',fontSize:13,color:'var(--text)',cursor:'pointer' }} value={filterRole} onChange={e=>{ setFilterRole(e.target.value); setPage(1); }}>
          <option value="">All Roles</option>
          <option value="businessAdmin">Biz Admin</option>
          <option value="employee">Employee</option>
        </select>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
          {[...Array(6)].map((_,i)=>(
            <div key={i} style={{ height:260,background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)',animation:'pulse 1.5s ease-in-out infinite' }}/>
          ))}
        </div>
      ) : users.length===0 ? (
        <div style={{ textAlign:'center',padding:'80px 0',background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)' }}>
          <Users size={48} color="var(--text-muted)" style={{ opacity:0.3,marginBottom:16 }}/>
          <h3 style={{ fontWeight:700,marginBottom:8 }}>No users found</h3>
          <p style={{ color:'var(--text-muted)',fontSize:14,marginBottom:20 }}>{search?`No results for "${search}"`:'Create your first user to get started.'}</p>
          {!search&&<button className="btn btn-primary" onClick={()=>setShowCreate(true)}><Plus size={14}/> Create User</button>}
        </div>
      ) : (
        <div style={{ display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20 }}>
          {users.map(user=>(
            <UserCard
              key={user._id}
              user={user}
              onToggle={u=>setConfirm({type:'toggle',user:u})}
              onLogout={u=>setConfirm({type:'logout',user:u})}
              onResetPW={u=>setConfirm({type:'reset', user:u})}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {total>LIMIT&&(
        <div style={{ display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:24,padding:'14px 18px',background:'var(--bg-card)',borderRadius:12,border:'1px solid var(--border)' }}>
          <span style={{ fontSize:13,color:'var(--text-muted)' }}>
            Showing {(page-1)*LIMIT+1}–{Math.min(page*LIMIT,total)} of {total}
          </span>
          <div style={{ display:'flex',gap:8 }}>
            <button className="btn btn-secondary btn-sm" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Previous</button>
            <button className="btn btn-secondary btn-sm" disabled={page*LIMIT>=total} onClick={()=>setPage(p=>p+1)}>Next</button>
          </div>
        </div>
      )}

      {showCreate&&<CreateUserModal onClose={()=>setShowCreate(false)} onCreated={creds=>{ setCredentials(creds); fetchUsers(); }}/>}
      {credentials&&<CredentialsBox creds={credentials} onClose={()=>setCredentials(null)}/>}
      {confirm&&<ConfirmModal config={buildConfig(confirm.type,confirm.user)} loading={confirmLoading} onConfirm={handleConfirm} onCancel={()=>setConfirm(null)}/>}

      <style>{`
        @keyframes spin  { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.15} }
      `}</style>
    </div>
  );
}
