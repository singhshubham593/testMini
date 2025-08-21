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


/* ------------------
   Recruiter View
   ------------------ */
function RecruiterView(){
  const dispatch = useDispatch();
  const { jobs, candidates, users } = useApp();
  const user = useCurrentUser();
  const myReferrals = candidates.filter(c=>c.referredBy===user.id);
  const [selectedJob, setSelectedJob] = useState(jobs[0]?.id || "");
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [form, setForm] = useState({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob });

  useEffect(()=>{ setForm(f=>({...f, appliedForJob: selectedJob})); },[selectedJob]);

  const refer = (e)=>{
    e.preventDefault();
    if(!form.name || !form.email || !form.appliedForJob) return;
    dispatch(actions.addCandidate({ ...form, referredBy: user.id, status: 'referred' }));
    setForm({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob });
  };

  const openCandidate = (c)=>{ setSelectedCandidate(c); };
  const updateStatus = (id, status, note='')=>{
    const candidate = candidates.find(x=>x.id===id);
    const ch = (candidate?.contactHistory||[]).concat([{date: nowISO(), note}]);
    dispatch(actions.updateCandidate({ id, updates:{ status, contactHistory: ch }}));
    if(selectedCandidate?.id===id) setSelectedCandidate({...selectedCandidate, status, contactHistory: ch});
  };

  return (
    <AppShell>
      <Sidebar>
        <SidebarButton active left={<span>➕</span>}>Refer Candidate</SidebarButton>
      </Sidebar>

      <main className="flex-1 min-w-0">
        <div className="space-y-6">
          <Card title="Refer Candidate" subtitle="Select job and provide candidate details">
            <form onSubmit={refer} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block text-sm"><div className="font-medium">Select Job</div><select className="mt-1 w-full rounded-lg border px-3 py-2" value={selectedJob} onChange={(e)=>setSelectedJob(Number(e.target.value))}>{jobs.map(j=> <option key={j.id} value={j.id}>#{j.id} — {j.title}</option>)}</select></label>
              <label className="block text-sm"><div className="font-medium">Full name</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.name} onChange={(e)=>setForm({...form, name:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Email</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.email} onChange={(e)=>setForm({...form, email:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Phone</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.phone} onChange={(e)=>setForm({...form, phone:e.target.value})} /></label>
              <label className="block text-sm"><div className="font-medium">Resume URL</div><input className="mt-1 w-full rounded-lg border px-3 py-2" value={form.resume} onChange={(e)=>setForm({...form, resume:e.target.value})} /></label>
              <label className="block text-sm sm:col-span-2"><div className="font-medium">Notes</div><textarea className="mt-1 w-full rounded-lg border px-3 py-2" value={form.notes} onChange={(e)=>setForm({...form, notes:e.target.value})} /></label>
              <div className="sm:col-span-2 flex gap-3"><Button type="submit" className="bg-blue-600 text-white">Refer</Button><Button type="button" className="border" onClick={()=>setForm({ name:'', email:'', phone:'', resume:'', notes:'', appliedForJob: selectedJob })}>Clear</Button></div>
            </form>
          </Card>

          <div className="grid lg:grid-cols-2 gap-6">
            <Card title="My Referrals" subtitle="Click a candidate to view details">
              <div className="space-y-2">
                {myReferrals.length===0 && <p className="text-sm text-blue-500">No referrals yet.</p>}
                {myReferrals.map(c=> (
                  <button key={c.id} onClick={()=>openCandidate(c)} className="w-full text-left rounded-lg p-3 border hover:bg-yellow-50 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-blue-500">{jobs.find(j=>j.id===c.appliedForJob)?.title}</p>
                    </div>
                    <div className="text-xs text-blue-700">{c.status}</div>
                  </button>
                ))}
              </div>
            </Card>

            <Card title="Candidate Details" subtitle="Update status & add contact notes">
              {selectedCandidate ? (
                <div className="space-y-3">
                  <div>
                    <p className="font-semibold">{selectedCandidate.name}</p>
                    <p className="text-xs text-blue-500">{selectedCandidate.email} • {selectedCandidate.phone}</p>
                    <p className="text-xs text-blue-500">Applied for: {jobs.find(j=>j.id===selectedCandidate.appliedForJob)?.title}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Status</p>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      {['referred','contacted','shortlisted','rejected','hired'].map(s=> (
                        <button key={s} onClick={()=>updateStatus(selectedCandidate.id, s, `Marked ${s}`)} className={`rounded-md px-3 py-1 text-sm ${selectedCandidate.status===s ? 'bg-blue-600 text-white' : 'border'}`}>{s}</button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Notes</p>
                    <p className="text-sm text-blue-700 mt-1">{selectedCandidate.notes || '—'}</p>
                  </div>

                  <div>
                    <p className="text-xs font-medium">Contact History</p>
                    <ul className="mt-2 space-y-1 text-xs text-blue-700">
                      {(selectedCandidate.contactHistory||[]).map((h,i)=> (
                        <li key={i}>• {new Date(h.date).toLocaleString()}: {h.note}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-blue-500">Select a candidate from the list to view details.</p>
              )}
            </Card>
          </div>
        </div>
      </main>
    </AppShell>
  );
}

export default RecruiterView;