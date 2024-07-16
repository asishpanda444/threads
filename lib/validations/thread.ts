import * as z from "zod";

export const ThreadValidation = z.object({
    thread: z.string().min(3, "Min 3 character is required"),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    thread: z.string().min(3, "Min 3 character is required")
})