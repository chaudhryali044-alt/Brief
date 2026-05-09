"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TopNav({ showSearch = false }: { showSearch?: boolean }) {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = query.trim().toUpperCase();
    if (trimmed) router.push(`/brief/${trimmed}`);
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-outline-variant">
      <div className="flex justify-between items-center w-full px-margin-desktop h-16 max-w-container-max mx-auto">
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="font-headline-lg text-headline-lg text-primary tracking-tight"
          >
            Brief
          </Link>
          <div className="hidden md:flex gap-6">
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Market</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Insights</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Portfolio</a>
            <a className="text-on-surface-variant font-medium hover:text-primary transition-colors duration-200" href="#">Advisory</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {showSearch && (
            <form onSubmit={handleSearch} className="relative hidden md:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
                search
              </span>
              <input
                className="bg-surface-container-low border border-outline-variant text-on-surface py-1.5 pl-10 pr-4 text-sm w-64 focus:outline-none focus:border-primary"
                placeholder="Search Markets"
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </form>
          )}
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200">
            notifications
          </button>
          <button className="material-symbols-outlined text-on-surface-variant hover:text-primary transition-colors duration-200">
            settings
          </button>
          <div className="w-8 h-8 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant">
            <img
              alt="User profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQBr1t9bIuQEWlJ_ND9KEPU4KhIT43QQwWguxskhwyrfVDC1P459couIPBmIVSZkRua0Vk7OCyo5mmRZaNN_uu9CtoMKCw6p5LVHmmnvKlDcJfKx_LRcp_ojmWrUecE3Y1xPmNXJ1P2W95Z-dwxjupXbN6vOtVOZiayDk0dDDlDz7I2UKwaxJxTp6QGwYLHuHZt8ltc3QGvbJ-EdDwMpHf-lMD7e4QxWSNA4cUGAOM4dp_dS_4AfY0H-AY67A7meP38QoHFHdqCd0"
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
