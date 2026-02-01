"use client";

import { useState, useEffect } from "react";
import { DEMO_USERS } from "@/constants/samples";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export function ImpersonateToolbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [current, setCurrent] = useState<string | null>(null);

  // Read cookie on mount
  useEffect(() => {
    setCurrent(getCookie("dev_impersonate"));
  }, []);

  async function impersonate(userId: string) {
    await fetch("/api/dev/impersonate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
    setCurrent(userId);
    window.location.reload();
  }

  async function stopImpersonating() {
    await fetch("/api/dev/impersonate", { method: "DELETE" });
    setCurrent(null);
    window.location.reload();
  }

  const currentUser = DEMO_USERS.find((u) => u.user_id === current);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <div className="bg-yellow-100 border-2 border-yellow-400 rounded-lg p-3 shadow-lg text-sm min-w-48">
          <div className="font-bold text-yellow-800 mb-2">Dev Impersonate</div>
          {current && (
            <div className="mb-2 p-2 bg-yellow-200 rounded text-xs">
              Currently: <strong>{currentUser?.username ?? current}</strong>
            </div>
          )}
          <div className="space-y-1">
            {DEMO_USERS.map((user) => (
              <button
                key={user.user_id}
                onClick={() => impersonate(user.user_id)}
                className={`block w-full text-left px-2 py-1 rounded hover:bg-yellow-200 ${
                  current === user.user_id ? "bg-yellow-300 font-medium" : ""
                }`}
              >
                {user.username}
              </button>
            ))}
          </div>
          {current && (
            <button
              onClick={stopImpersonating}
              className="mt-2 w-full px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Stop Impersonating
            </button>
          )}
          <button
            onClick={() => setIsOpen(false)}
            className="mt-2 w-full px-2 py-1 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className={`${
            current ? "bg-red-400 hover:bg-red-500" : "bg-yellow-400 hover:bg-yellow-500"
          } text-yellow-900 font-bold px-3 py-2 rounded-full shadow-lg`}
          title={current ? `Impersonating: ${currentUser?.username}` : "Dev Tools"}
        >
          {current ? "👤" : "🔧"}
        </button>
      )}
    </div>
  );
}
