import { GitCommitHorizontal } from "lucide-react";

import { releaseEnvironmentLabel, releaseInfo, releaseLabel } from "@/lib/releaseInfo";

export function BuildInfoStamp({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? "flex items-center gap-1.5 text-[10px] text-ds-neutral-400" : "flex items-center gap-2 text-[11px] text-ds-neutral-300"} title={`بُني في ${new Date(releaseInfo.builtAt).toLocaleString("ar-SA")}`}>
      <GitCommitHorizontal className={compact ? "size-3" : "size-3.5"} />
      <span className="font-medium" dir="ltr">{releaseLabel(releaseInfo)}</span>
      {!compact && <><span className="text-white/25">|</span><span>{releaseEnvironmentLabel(releaseInfo.environment)}</span></>}
    </div>
  );
}
