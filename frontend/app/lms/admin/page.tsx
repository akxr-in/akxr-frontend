"use client";

import React, { useState, useEffect } from "react";
import { useGetUser } from "@akxr/api";
import { useRouter } from "next/navigation";

// Mock data based on the design
const mockCourse = {
  id: "course-1",
  code: "AXR-201",
  title: "Data Structures & Algorithms",
  mentor: "Priya S.",
  status: "Draft",
  modules: [
    {
      id: "m1",
      title: "Introduction to Complexity",
      lectures: [
        { id: "l1", title: "Time and Space Complexity", kind: "video" },
        { id: "l2", title: "Asymptotic Notation", kind: "text" },
      ]
    },
    {
      id: "m3",
      title: "Trees",
      lectures: [
        { id: "l-3.1", title: "Binary Trees", kind: "video" },
        { id: "l-3.2", title: "Binary Search Trees", kind: "video" },
        { id: "l-3.3", title: "Trees: traversals & DFS", kind: "video", dur: "49:08" },
      ]
    }
  ]
};

export default function LMSAdmin() {
  const router = useRouter();
  const { data, isLoading } = useGetUser();
  
  if (isLoading) return null;
  const user = data?.data?.data;
  
  if (!user || user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  return (
    <div className="cp" style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--paper)', color: 'var(--ink)' }}>
      <div className="topbar" style={{ display: 'flex', alignItems: 'center', padding: '12px 20px', borderBottom: '1px solid var(--line)', background: 'var(--paper)' }}>
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div className="brand-name" style={{ fontSize: '14px', fontWeight: 600 }}>Axar <em style={{ fontStyle: 'normal', color: 'var(--ink-3)' }}>LMS Admin</em></div>
        </div>
        <div style={{ flex: 1 }}/>
        <button className="btn sm" style={{ marginRight: 8 }}>Import JSON</button>
        <button className="btn primary sm" style={{ marginRight: 16 }}>New course</button>
        <span className="pill role-admin dot">Admin</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr 360px', flex: 1, minHeight: 0 }}>
        {/* Tree */}
        <div style={{ borderRight: '1px solid var(--line)', background: 'var(--paper)', overflow: 'auto' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Editing</div>
                <div style={{ fontSize: 17, marginTop: 4, fontWeight: 600 }}>{mockCourse.code} · {mockCourse.title}</div>
              </div>
              <span style={{ fontSize: 10, padding: '4px 8px', borderRadius: 4, color: 'var(--warn)', background: 'var(--warn-soft)', border: '1px solid var(--warn)' }}>{mockCourse.status}</span>
            </div>
          </div>
          <div style={{ padding: 8 }}>
            {mockCourse.modules.map((mod, mi) => (
              <div key={mod.id} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px' }}>
                  <div style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>{String(mi+1).padStart(2,'0')} · {mod.title}</div>
                  <button style={{ padding: 4, background: 'transparent', border: 'none', color: 'var(--ink-3)', cursor: 'pointer' }}>+</button>
                </div>
                {mod.lectures.map((l, li) => {
                  const active = mi === 1 && li === 2;
                  return (
                    <div key={l.id} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 10px', borderRadius: 6,
                      background: active ? 'var(--ink)' : 'transparent',
                      color: active ? 'var(--paper)' : 'var(--ink-2)',
                      fontSize: 12.5, cursor: 'pointer',
                    }}>
                      <span style={{ fontSize: 10, opacity: 0.5, width: 24 }}>{mi+1}.{li+1}</span>
                      <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{l.title}</span>
                      <span style={{ fontSize: 10, opacity: 0.6 }}>{l.kind === 'video' ? '▶' : '¶'}</span>
                    </div>
                  );
                })}
              </div>
            ))}
            <button style={{ width: '100%', padding: '8px', background: 'transparent', border: '1px dashed var(--line-2)', borderRadius: 6, color: 'var(--ink-3)', cursor: 'pointer', marginTop: 6 }}>+ Add module</button>
          </div>
        </div>

        {/* Editor */}
        <div style={{ overflow: 'auto', background: 'var(--paper)' }}>
          <div style={{ padding: '24px 28px' }}>
            <div style={{ fontSize: 10.5, color: 'var(--ink-3)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>Module 3 · Lecture 3 · editing</div>
            <input defaultValue="Trees: traversals & DFS" style={{
              display: 'block', width: '100%', marginTop: 8,
              fontSize: 30, fontWeight: 600, letterSpacing: '-0.012em',
              border: 0, background: 'transparent', outline: 'none', color: 'var(--ink)',
              padding: '4px 0',
            }}/>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 18 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Video URL</label>
                <input defaultValue="https://cdn.axar.in/videos/axr-201/m3-l3-trees.mp4" style={{ padding: '8px 12px', border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink)', borderRadius: 4 }}/>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Duration</label>
                <input defaultValue="49:08" style={{ padding: '8px 12px', border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink)', borderRadius: 4 }}/>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              <label style={{ fontSize: 11.5, color: 'var(--ink-3)' }}>Lecture notes (markdown)</label>
              <textarea rows={8} defaultValue={`A binary tree is recursive by nature: each node has a left subtree and a right subtree.

The three classical traversals — preorder, inorder, postorder — differ only in **when** you visit the node relative to its children.

> In a BST, inorder traversal yields keys in ascending order.`}
                style={{ padding: '8px 12px', border: '1px solid var(--line)', background: 'var(--paper-2)', color: 'var(--ink)', borderRadius: 4, fontSize: 12, lineHeight: 1.6, resize: 'vertical' }}/>
            </div>

            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Assignment binding</div>
              <div style={{ padding: 14, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: 12 }}>axr-201/m3-trees-traversals</div>
                    <div style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 4 }}>Template repo · auto-forked per student</div>
                  </div>
                  <button style={{ padding: '6px 12px', background: 'var(--card)', border: '1px solid var(--line)', color: 'var(--ink)', borderRadius: 4, cursor: 'pointer' }}>Change repo</button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 22 }}>
              <button style={{ padding: '8px 16px', background: 'var(--ink)', color: 'var(--paper)', border: '1px solid var(--ink)', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}>Save changes</button>
              <button style={{ padding: '8px 16px', background: 'var(--card)', color: 'var(--ink)', border: '1px solid var(--line)', borderRadius: 4, fontWeight: 500, cursor: 'pointer' }}>Publish lecture</button>
            </div>
          </div>
        </div>

        {/* Right rail: activity + JSON import card */}
        <div style={{ borderLeft: '1px solid var(--line)', background: 'var(--paper-2)', overflow: 'auto' }}>
          <div style={{ padding: 16 }}>
            <div style={{ fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--ink-4)', marginBottom: 8 }}>Import a course</div>
            <div style={{ padding: 14, background: 'var(--card)', border: '1px solid var(--line)', borderRadius: 8 }}>
              <div style={{ fontSize: 12, marginBottom: 6 }}>course-creator-helper-cli</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-3)', marginBottom: 12, lineHeight: 1.5 }}>
                Generate a course JSON locally, then drop it here. We'll validate and create a draft.
              </div>
              <div style={{
                border: '1.5px dashed var(--line-2)', borderRadius: 8,
                padding: 18, textAlign: 'center', background: 'var(--card)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--ink-3)', marginBottom: 6 }}>course.v1.json</div>
                <div style={{ fontSize: 12 }}>Drop JSON here, or <span style={{ color: 'var(--accent)', textDecoration: 'underline' }}>browse</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
