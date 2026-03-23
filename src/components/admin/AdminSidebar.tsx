'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import React from 'react';
import {
  HomeIcon, LinkIcon, ClipboardIcon, TagIcon, StarIcon, QuestionIcon,
  ClockIcon, BellIcon, GearIcon, ExternalLinkIcon, LogoutIcon,
  SidebarCollapseIcon, SidebarExpandIcon,
} from '@/components/ui/icons';

const NAV_GROUPS = [
  {
    label: 'CONTENU',
    items: [
      { href: '/admin', label: 'Tableau de bord', icon: <HomeIcon />, exact: true },
      { href: '/admin/linktree', label: 'Linktree', icon: <LinkIcon /> },
      { href: '/admin/menu', label: 'Menu & Carte', icon: <ClipboardIcon /> },
      { href: '/admin/promotions', label: 'Promotions', icon: <TagIcon /> },
      { href: '/admin/reviews', label: 'Avis clients', icon: <StarIcon /> },
      { href: '/admin/faqs', label: 'FAQs', icon: <QuestionIcon /> },
    ],
  },
  {
    label: 'CONFIGURATION',
    items: [
      { href: '/admin/hours', label: 'Horaires', icon: <ClockIcon /> },
      { href: '/admin/notification', label: 'Notification', icon: <BellIcon /> },
      { href: '/admin/settings', label: 'Paramètres', icon: <GearIcon /> },
    ],
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    await fetch('/api/admin/logout', { method: 'POST' });
    window.location.href = '/admin/login'; // hard reload to clear layout cache
  }

  function isActive(href: string, exact?: boolean) {
    if (exact) return pathname === href;
    return pathname.startsWith(href);
  }

  return (
    <aside
      className="flex flex-col flex-shrink-0 transition-all duration-200 relative"
      style={{
        width: collapsed ? '60px' : '220px',
        minHeight: '100vh',
        background: 'var(--admin-bg)',
        borderRight: '1px solid var(--admin-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5" style={{ borderBottom: '1px solid var(--admin-border)' }}>
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-black text-sm text-gray-950"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #F97316)' }}
        >
          W
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm" style={{ color: 'var(--admin-text)' }}>Woodiz</p>
            <p className="text-xs" style={{ color: 'var(--admin-text-muted)' }}>Admin Panel</p>
          </div>
        )}
        <button
          onClick={() => setCollapsed(c => !c)}
          className="ml-auto flex-shrink-0 rounded-lg p-1.5 transition-colors"
          style={{ color: 'var(--admin-text-muted)' }}
          onMouseEnter={e => (e.currentTarget.style.color = 'var(--admin-text)')}
          onMouseLeave={e => (e.currentTarget.style.color = 'var(--admin-text-muted)')}
        >
          {collapsed ? <SidebarExpandIcon /> : <SidebarCollapseIcon />}
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
        {NAV_GROUPS.map(group => (
          <div key={group.label} className="mb-6">
            {!collapsed && (
              <p className="px-4 mb-2 text-[10px] font-bold tracking-widest" style={{ color: 'var(--admin-text-muted)' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5 px-2">
              {group.items.map(item => {
                const active = isActive(item.href, item.exact);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative"
                    style={{
                      background: active ? 'rgba(245,158,11,0.10)' : 'transparent',
                      color: active ? '#F59E0B' : 'var(--admin-text-muted)',
                      borderLeft: active ? '2px solid #F59E0B' : '2px solid transparent',
                    }}
                    onMouseEnter={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                        e.currentTarget.style.color = 'var(--admin-text)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!active) {
                        e.currentTarget.style.background = 'transparent';
                        e.currentTarget.style.color = 'var(--admin-text-muted)';
                      }
                    }}
                  >
                    <span className="flex-shrink-0">
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-2 py-3 space-y-1" style={{ borderTop: '1px solid var(--admin-border)' }}>
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          title={collapsed ? 'Voir le site' : undefined}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150"
          style={{ color: 'var(--admin-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = 'var(--admin-text)'; e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--admin-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <ExternalLinkIcon />
          {!collapsed && <span>Voir le site</span>}
        </a>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title={collapsed ? 'Déconnexion' : undefined}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 disabled:opacity-50"
          style={{ color: 'var(--admin-text-muted)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#EF4444'; e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = 'var(--admin-text-muted)'; e.currentTarget.style.background = 'transparent'; }}
        >
          <LogoutIcon />
          {!collapsed && <span>{loggingOut ? 'Déconnexion...' : 'Déconnexion'}</span>}
        </button>
      </div>
    </aside>
  );
}
