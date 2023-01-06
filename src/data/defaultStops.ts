export type stop = {
  label: string;
  id: string[];
  type: string;
  colors?: string[];
};

const defaultStops: stop[] = [
  { label: "Pestszentlőrinc vá. (átjáró)", id: ["BKK_F03845"], type: "BUS" },
  { label: "Pestszentlőrinc", id: ["BKK_005510181_0"], type: "RAIL" },
  { label: "Csörötnek utca", id: ["BKK_F03832"], type: "BUS" },
  { label: "Zugló -> Belváros", id: ["BKK_F02730"], type: "BUS" },
  { label: "Zugló", id: ["BKK_005510090_0"], type: "RAIL" },
  { label: "KöKi (vonat)", id: ["BKK_005510173_0"], type: "RAIL" },
  { label: "Nyugati", id: ["BKK_005510033_0"], type: "RAIL" },
];

export default defaultStops;
