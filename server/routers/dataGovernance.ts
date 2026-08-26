import { z } from "zod";
import { dataRetentionDomains } from "../../shared/dataGovernance";
import { getCompanyDataRetentionPolicies, upsertCompanyDataRetentionPolicy } from "../db";
import { adminProcedure, router } from "../_core/trpc";

const retentionPolicyInput = z.object({
  dataDomain: z.enum(dataRetentionDomains),
  ownerLabel: z.string().trim().min(2).max(120),
  retentionDays: z.number().int().min(1).max(36500).optional(),
  reviewState: z.enum(["draft", "reviewed"]),
  policyNote: z.string().trim().min(4).max(720),
}).refine(input => input.reviewState !== "reviewed" || input.retentionDays !== undefined, {
  message: "لا يمكن وضع السجل كمراجع داخلياً قبل إدخال مدة احتفاظ مقترحة",
  path: ["retentionDays"],
});

export const dataGovernanceRouter = router({
  listRetentionPolicies: adminProcedure.query(({ ctx }) => getCompanyDataRetentionPolicies(ctx.user.companyId)),
  saveRetentionPolicy: adminProcedure.input(retentionPolicyInput).mutation(({ ctx, input }) =>
    upsertCompanyDataRetentionPolicy({ companyId: ctx.user.companyId, createdByUserId: ctx.user.id, ...input })
  ),
});
