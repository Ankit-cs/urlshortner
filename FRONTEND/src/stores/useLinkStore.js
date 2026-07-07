import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useLinkStore = create(
  persist(
    (set) => ({
      links: [],
      addLink: (link) => set((state) => ({ links: [link, ...state.links] })),
      removeLink: (id) => set((state) => ({ links: state.links.filter((l) => l.id !== id) })),
      clearLinks: () => set({ links: [] }),
    }),
    {
      name: 'shortly-link-storage',
    }
  )
);
