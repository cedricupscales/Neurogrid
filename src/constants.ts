import { Domain } from "./types";

export const DOMAIN_COLORS: Record<Domain, string> = {
  [Domain.PHYSICAL]: "#059669", // Emerald 600
  [Domain.BUSINESS]: "#84CC16", // Lime 500
  [Domain.ACADEMIC]: "#10B981", // Emerald 500
  [Domain.SOCIAL]: "#65A30D", // Lime 600
  [Domain.PERSONAL]: "#14B8A6", // Teal 500
  [Domain.FINANCIAL]: "#065F46", // Emerald 800
};

export const DOMAIN_GRADIENTS: Record<Domain, string> = {
  [Domain.PHYSICAL]: "from-[#059669] to-[#064E3B]",
  [Domain.BUSINESS]: "from-[#84CC16] to-[#4D7C0F]",
  [Domain.ACADEMIC]: "from-[#10B981] to-[#065F46]",
  [Domain.SOCIAL]: "from-[#65A30D] to-[#365314]",
  [Domain.PERSONAL]: "from-[#14B8A6] to-[#0F766E]",
  [Domain.FINANCIAL]: "from-[#065F46] to-[#022C22]",
};
