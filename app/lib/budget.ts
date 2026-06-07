// Budget tiers (per night, in paisa). Isomorphic — safe for client + server.
export const BUDGET_TIERS = [
  { key: "any", label: "Any budget", maxPrice: null as number | null },
  { key: "budget", label: "Budget · under ৳1,500", maxPrice: 150000 },
  { key: "mid", label: "Mid · under ৳3,500", maxPrice: 350000 },
  { key: "premium", label: "Premium · under ৳8,000", maxPrice: 800000 },
];
