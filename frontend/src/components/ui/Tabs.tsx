"use client";

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  readonly id: string;
  readonly label: string;
  readonly content: ReactNode;
  readonly disabled?: boolean;
}

export interface TabsProps {
  readonly defaultTabId?: string;
  readonly label: string;
  readonly onChange?: (tabId: string) => void;
  readonly tabs: readonly TabItem[];
}

export function nextEnabledTabIndex(tabs: readonly Pick<TabItem, "disabled">[], currentIndex: number, key: string): number {
  const enabled = tabs.map((tab, index) => ({ tab, index })).filter(({ tab }) => !tab.disabled);
  if (enabled.length === 0) return currentIndex;
  if (key === "Home") return enabled[0].index;
  if (key === "End") return enabled[enabled.length - 1].index;
  const position = Math.max(0, enabled.findIndex(({ index }) => index === currentIndex));
  if (key === "ArrowRight") return enabled[(position + 1) % enabled.length].index;
  if (key === "ArrowLeft") return enabled[(position - 1 + enabled.length) % enabled.length].index;
  return currentIndex;
}

export function Tabs({ defaultTabId, label, onChange, tabs }: TabsProps) {
  const baseId = useId();
  const firstEnabled = tabs.find((tab) => !tab.disabled);
  const initial = tabs.find((tab) => tab.id === defaultTabId && !tab.disabled) ?? firstEnabled;
  const [selectedId, setSelectedId] = useState(initial?.id ?? "");
  const selected = tabs.find((tab) => tab.id === selectedId && !tab.disabled) ?? firstEnabled;

  if (!selected) return null;

  const select = (tabId: string) => {
    setSelectedId(tabId);
    onChange?.(tabId);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const nextIndex = nextEnabledTabIndex(tabs, index, event.key);
    if (nextIndex === index || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const target = tabs[nextIndex];
    select(target.id);
    document.getElementById(`${baseId}-tab-${target.id}`)?.focus();
  };

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist" aria-label={label}>
        {tabs.map((tab, index) => {
          const isSelected = tab.id === selected.id;
          return (
            <button
              aria-controls={`${baseId}-panel-${tab.id}`}
              aria-selected={isSelected}
              className="tabs__tab"
              disabled={tab.disabled}
              id={`${baseId}-tab-${tab.id}`}
              key={tab.id}
              onClick={() => select(tab.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              role="tab"
              tabIndex={isSelected ? 0 : -1}
              type="button"
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        aria-labelledby={`${baseId}-tab-${selected.id}`}
        className="tabs__panel"
        id={`${baseId}-panel-${selected.id}`}
        role="tabpanel"
        tabIndex={0}
      >
        {selected.content}
      </div>
    </div>
  );
}
