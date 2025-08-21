import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useApp, useCurrentUser } from "../redux/hooks";
import Card from "../components/Card";
import Button from "../components/Button";
import Sidebar from "../components/Sidebar";
import SidebarButton from "../components/SidebarButton";
import Badge from "../components/Badge";
import { actions } from "../redux/appSlice";
import AppShell from "./appShell";
import { ChevronDown, ChevronRight } from "lucide-react";

/* ------------------
   Admin View (with expandable lists & right panel details)
   ------------------ */
function AdminView() {
  const dispatch = useDispatch();
  const { users, jobs, candidates, ui } = useApp();
  const [tab, setTab] = useState('overview');
  const [form, setForm] = useState({ name:'', email:'', role:'manager' });

  const managers = users.filter(u=>u.role==='manager');
  const recruiters = users.filter(u=>u.role==='recruiter');

  const addUser = (e)=>{
    e.preventDefault();
    if(!form.name||!form.email) return;
    dispatch(actions.addUser(form));
    setForm({name:'',email:'',role:'manager'});
  };

  const selectedUser = users.find(u => u.id === ui.adminSidebar.selectedUserId) || null;

  const ManagerDetail = ({manager})=>{
    const mJobs = jobs.filter(j=>j.createdBy===manager.id);
    return (
      <div>
        <h4 className="text-sm font-semibold">Jobs by {manager.name}</h4>
        <div className="mt-3 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 space-y-3">
          {mJobs.length===0 && <p className="text-sm text-blue-500">No jobs posted.</p>}
          {mJobs.map(j=>{
            const cands = candidates.filter(c=>c.appliedForJob===j.id);
            return (
              <div className=" ">
              <div key={j.id} className="  rounded-lg border p-3 bg-yellow-50">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-blue-700">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                  </div>
                  <div className="text-xs text-blue-600">{cands.length} applicants</div>
                </div>
                <div className="mt-2">
                  {cands.map(c=> (
                    <div key={c.id} className="flex items-center justify-between mt-2">
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-xs text-blue-500">Referred by: {users.find(u=>u.id===c.referredBy)?.name || '—'}</p>
                      </div>
                      <Badge className="bg-slate-100 text-blue-700">{c.status}</Badge>
                    </div>
                  ))}
                </div>
              </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const RecruiterDetail = ({recruiter})=>{
    const referred = candidates.filter(c=>c.referredBy===recruiter.id);
    return (
      <div>
        <h4 className="text-sm font-semibold text-blue-700">Referrals by {recruiter.name}</h4>
        <div className="mt-2 space-y-2 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {referred.length===0 && <p className="text-sm text-blue-500">No referrals yet.</p>}
          {referred.map(c=> (
            <div key={c.id} className="rounded-lg border p-3 bg-yellow-50 flex items-start justify-between">
              <div>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-blue-500">Applied: {jobs.find(j=>j.id===c.appliedForJob)?.title || '—'}</p>
              </div>
              <div className="text-xs text-blue-600">{c.status}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <AppShell>
      {/* Left Sidebar */}
      <Sidebar>
        <SidebarButton active={tab==='overview'} onClick={()=>setTab('overview')} left={<span>📊</span>}>Overview</SidebarButton>
        <SidebarButton active={tab==='add'} onClick={()=>setTab('add')} left={<span>➕</span>}>Add Manager / Recruiter</SidebarButton>

        {/* Totals */}
        <div className="rounded-xl border p-3 bg-yellow-50 mt-2">
          <p className="text-xs text-blue-500">Totals</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border p-2 text-center">
              <p className="text-[11px] text-blue-500">Managers</p>
              <p className="text-sm font-semibold text-blue-600">{managers.length}</p>
            </div>
            <div className="rounded-lg border p-2 text-center">
              <p className="text-[11px] text-blue-500">Recruiters</p>
              <p className="text-sm font-semibold text-blue-600">{recruiters.length}</p>
            </div>
          </div>
        </div>

        {/* Expandable Managers */}
        <div className="mt-2">
          <SidebarButton
            active={tab==='managers'}
            onClick={()=>{ setTab('managers'); dispatch(actions.toggleManagers()); }}
            left={<span>👥</span>}
            right={ui.adminSidebar.managersOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          >
            Managers ({managers.length})
          </SidebarButton>
          {ui.adminSidebar.managersOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {managers.map(m => (
                <button key={m.id} onClick={()=>dispatch(actions.selectAdminUser(m.id))} className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${ui.adminSidebar.selectedUserId===m.id ? 'bg-blue-100' : ''}`}>
                  {m.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Expandable Recruiters */}
        <div className="mt-1">
          <SidebarButton
            active={tab==='recruiters'}
            onClick={()=>{ setTab('recruiters'); dispatch(actions.toggleRecruiters()); }}
            left={<span>🧑‍💼</span>}
            right={ui.adminSidebar.recruitersOpen ? <ChevronDown size={16}/> : <ChevronRight size={16}/>}
          >
            Recruiters ({recruiters.length})
          </SidebarButton>
          {ui.adminSidebar.recruitersOpen && (
            <div className="mt-1 ml-2 space-y-1">
              {recruiters.map(r => (
                <button key={r.id} onClick={()=>dispatch(actions.selectAdminUser(r.id))} className={`w-full text-left rounded-lg px-3 py-1.5 text-sm hover:bg-yellow-50 ${ui.adminSidebar.selectedUserId===r.id ? 'bg-blue-100' : ''}`}>
                  {r.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </Sidebar>

      {/* Right content */}
      <main className="flex-1 min-w-0 space-y-6">
        {tab==='overview' && (
          <div className="space-y-6">
            <Card title="Platform Summary">
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Managers</p>
                  <p className="text-xl font-semibold text-blue-500">{managers.length}</p>
                </div>
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Recruiters</p>
                  <p className="text-xl font-semibold text-blue-500">{recruiters.length}</p>
                </div>
                <div className="rounded-lg border p-4 bg-yellow-50 text-center">
                  <p className="text-xs text-blue-500">Open Jobs</p>
                  <p className="text-xl font-semibold text-blue-500">{jobs.length}</p>
                </div>
              </div>
            </Card>

            <Card title="Recent Jobs" subtitle="Latest posts">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {jobs.map(j => (
                  <div key={j.id} className="rounded-lg border p-3">
                    <p className="font-semibold">{j.title}</p>
                    <p className="text-xs text-blue-500">{j.location} • {j.salary}</p>
                    <p className="text-xs mt-2 text-blue-600">Posted by: {users.find(u=>u.id===j.createdBy)?.name}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab==='add' && (
          <Card title="Add User">
            <form onSubmit={addUser} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm"><div className="font-medium">Full name</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e)=>setForm({...form,name:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Email</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e)=>setForm({...form,email:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Role</div><select className="mt-1 w-full rounded-lg border px-3 py-2" value={form.role} onChange={(e)=>setForm({...form,role:e.target.value})}><option value="manager">Manager</option><option value="recruiter">Recruiter</option></select></label>
              <div className="sm:col-span-2 flex gap-3 items-center"><Button type="submit" className="bg-blue-600 text-white">Create</Button><Button type="button" className="border" onClick={()=>setForm({name:'',email:'',role:'manager'})}>Clear</Button></div>
            </form>
          </Card>
        )}

        {/* Right-side detail when a user is selected from sidebar */}
        {selectedUser && (
          <Card
            title={`${selectedUser.role === 'manager' ? 'Manager' : 'Recruiter'} — ${selectedUser.name}`}
            subtitle={selectedUser.email}
            right={<Button className="border" onClick={()=>dispatch(actions.selectAdminUser(null))}>Clear</Button>}
          >
            {selectedUser.role === 'manager' ? (
              <ManagerDetail manager={selectedUser} />
            ) : (
              <RecruiterDetail recruiter={selectedUser} />
            )}
          </Card>
        )}
      </main>
    </AppShell>
  );
}
export default AdminView;