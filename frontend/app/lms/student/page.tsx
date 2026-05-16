"use client";

import React, { useState } from "react";
import { useGetUser } from "@akxr/api";
import { useRouter } from "next/navigation";

// Mock data
const courses = [
  { id: "c1", code: "AXR-201", title: "Data Structures & Algorithms", state: "in_progress", progress: 0.64 },
  { id: "c2", code: "AXR-202", title: "Advanced Backend Engineering", state: "locked", progress: 0 },
];

const mockCourse = {
  id: "course-1",
  code: "AXR-201",
  title: "Data Structures & Algorithms",
  mentor: "Priya S.",
  modules: [
    {
      id: "m1",
      title: "Introduction",
      lectures: [
        { id: "l1", title: "Complexity", dur: "10:00", state: "done" },
      ]
    },
    {
      id: "m3",
      title: "Trees",
      lectures: [
        { id: "l-3.1", title: "Binary Trees", dur: "20:00", state: "done" },
        { id: "l-3.2", title: "Binary Search Trees", dur: "15:00", state: "done" },
        { id: "l-3.3", title: "Trees: traversals & DFS", dur: "49:08", state: "active" },
      ]
    }
  ]
};

export default function LMSStudent() {
  const router = useRouter();
  const { data, isLoading } = useGetUser();
  const [view, setView] = useState("home");
  const [activeLec, setActiveLec] = useState("l-3.3");
  
  if (isLoading) return null;
  // useGetUser returns success/error union; UI guard handles non-success cases.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = (data as any)?.data?.data;
  if (!user || user.role !== "STUDENT") {
    router.push("/");
    return null;
  }

  const allLectures = mockCourse.modules.flatMap(m => m.lectures.map(l => ({ ...l, mod: m.title })));
  const lec = allLectures.find(l => l.id === activeLec) || allLectures[0];

  return (
    <div className="cp" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-name" style={{ fontSize: '14px', fontWeight: 600 }}>Axar <em style={{ fontStyle: 'normal', color: 'var(--ink-3)' }}>LMS</em></div>
        </div>
        <div style={{ flex: 1 }}/>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setView('home')} style={{ padding: '6px 12px', background: view === 'home' ? 'var(--paper-2)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: 'var(--ink)' }}>My batch</button>
          <button onClick={() => setView('course')} style={{ padding: '6px 12px', background: view === 'course' ? 'var(--paper-2)' : 'transparent', border: 'none', borderRadius: 4, cursor: 'pointer', color: 'var(--ink)' }}>Course</button>
        </div>
      </div>

      {view === 'home' ? (
        <div style={{ overflow: 'auto', flex: 1, padding: '32px' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)' }}>Cohort 2026 · Backend Track</div>
            <h2 style={{ fontSize: 32, fontWeight: 600, margin: '8px 0' }}>Welcome back, {user.full_name.split(' ')[0]}.</h2>
            <p style={{ color: 'var(--ink-3)' }}>Pick up where you left off, or browse your batch.</p>
          </div>

          <div style={{ background: 'var(--ink)', color: 'var(--paper)', borderRadius: 12, padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
            <div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Continue learning</div>
              <div style={{ fontSize: 24, fontWeight: 600, marginTop: 8 }}>Trees: traversals & DFS</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 4 }}>Module 3 · Lecture 3 · AXR-201</div>
            </div>
            <button onClick={() => setView('course')} style={{ background: 'var(--paper)', color: 'var(--ink)', padding: '10px 20px', borderRadius: 6, border: 'none', fontWeight: 600, cursor: 'pointer' }}>
              Resume lecture →
            </button>
          </div>

          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Courses in this batch</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {courses.map(c => (
              <div key={c.id} style={{ border: '1px solid var(--line)', borderRadius: 8, padding: 16, opacity: c.state === 'locked' ? 0.6 : 1, background: 'var(--card)' }} onClick={() => c.state !== 'locked' && setView('course')}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em' }}>{c.code}</div>
                <div style={{ fontSize: 18, fontWeight: 600, marginTop: 4 }}>{c.title}</div>
                <div style={{ marginTop: 16, background: 'var(--paper-2)', height: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <div style={{ width: `${c.progress * 100}%`, background: 'var(--ink)', height: '100%' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', flex: 1, minHeight: 0 }}>
          <div style={{ borderRight: '1px solid var(--line)', background: 'var(--paper)', overflow: 'auto', padding: 16 }}>
             <div style={{ marginBottom: 16 }}>
               <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em' }}>{mockCourse.code}</div>
               <div style={{ fontSize: 18, fontWeight: 600 }}>{mockCourse.title}</div>
             </div>
             {mockCourse.modules.map((mod, mi) => (
               <div key={mod.id} style={{ marginBottom: 16 }}>
                 <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em', marginBottom: 8, textTransform: 'uppercase' }}>{String(mi+1).padStart(2,'0')} · {mod.title}</div>
                 {mod.lectures.map(l => (
                   <div key={l.id} onClick={() => setActiveLec(l.id)} style={{ padding: '8px 10px', background: l.id === activeLec ? 'var(--ink)' : 'transparent', color: l.id === activeLec ? 'var(--paper)' : 'var(--ink-2)', borderRadius: 6, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                     <span>{l.title}</span>
                     <span style={{ opacity: 0.5 }}>{l.dur}</span>
                   </div>
                 ))}
               </div>
             ))}
          </div>
          <div style={{ padding: '32px', overflow: 'auto' }}>
             <div style={{ fontSize: 11, color: 'var(--ink-3)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>Module 3 · Lecture 3</div>
             <h2 style={{ fontSize: 28, fontWeight: 600, margin: '8px 0 24px' }}>{lec.title}</h2>
             <div style={{ background: 'var(--paper-2)', aspectRatio: '16/9', borderRadius: 12, border: '1px solid var(--line)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
                Video Player Placeholder
             </div>
             <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Notes</h3>
                  <p style={{ color: 'var(--ink-2)', lineHeight: 1.6, fontSize: 14 }}>A binary tree is recursive by nature: each node has a left subtree and a right subtree. The three classical traversals — preorder, inorder, postorder — differ only in when you visit the node relative to its children.</p>
                </div>
                <div style={{ background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8, padding: 20 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12 }}>Assignment</h3>
                  <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>axr-201/m3-trees-traversals</div>
                  <p style={{ color: 'var(--ink-2)', fontSize: 13, marginTop: 8 }}>Implement iterative inorder + a BST validator. CI runs your tests + ours.</p>
                  <button style={{ marginTop: 16, width: '100%', padding: '10px', background: 'var(--ink)', color: 'var(--paper)', border: 'none', borderRadius: 6, fontWeight: 600, cursor: 'pointer' }}>Open in GitHub</button>
                </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
}
