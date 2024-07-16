"use server";

import Thread from "@/lib/models/thread.model";
import { connectToDB } from "../mongoose";
import User from "../models/user.model";
import { revalidatePath } from "next/cache";

interface Params {
    text: string;
    author: string;
    communityId: string | null;
    path: string;
}

export async function createThread({text, author,communityId, path}: Params) {
    connectToDB();
    try {
        // Create Thread
        const thread = await Thread.create({
            text,
            author,
            community: null
        });
        // Update User
        await User.findByIdAndUpdate(author, {
            $push: { threads: thread._id }
        })
        // Clear Cache
        revalidatePath(path);
    } catch (error:any) {
        console.log(`Error during Thread Creation ${error.message}`);
    }
}

export async function fetchPosts(pageNumber: 1, pageSize: 20) {
    connectToDB();
    let parentThreads;
    let isNext;
    try {
        const skips = (pageNumber - 1) * pageSize;
        // Fetching all the Threads which are Super Parents(Top Level Threads)
        parentThreads = await Thread
                                        .find({parentId: {$in: [null, undefined]}})
                                        .sort({createdAt: 'desc'})
                                        .skip(skips)
                                        .limit(pageSize)
                                        .populate({path:"author", model: User})
                                        .populate({path: "children", populate:{path:"author", model: User, select: "_id name parentId image"}});
        const totalThreads = await Thread.countDocuments({ parentId: {$in: [null, undefined]}});
        isNext = totalThreads > skips + parentThreads.length;
    } catch (error:any) {
        console.log(`Error during Thread Deletion ${error.message}`);
    }
    return {parentThreads, isNext};
}

export async function fetchThreadById(id: string){
    connectToDB();
    let thread;
    try {
        thread = await Thread.findById(id)
        .populate({
            path: "author",
            model: User,
            select: "_id name parentId image"
        })
        .populate({
            path: "children",
            model: Thread,
            populate: {
                path: "author",
                model: User,
                select: "_id id name parentId image"
            }
        });
    } catch (error: any) {
        console.error(`Error fetching thread: ${error.message}`);
    }
    return thread;
}

export async function addCommentToThread(
    threadId: string,
    commmentText: string,
    userId: string,
    path: string
) {
    connectToDB();
    try {
        // Fetch Parent Thread
        const originalThread = await Thread.findById(threadId);
        if(!originalThread) throw new Error("Thread not found");
        // Create a new Thread of Type Comment
        const commentThread = new Thread({
            text: commmentText,
            author: userId,
            parentId: threadId,
        });
        // Save the Comment Thread
        const savedThread = await commentThread.save();
        // Update the Parent Thread with the comment thread id.
        originalThread.children.push(savedThread._id);
        // Save the updated Parent Thread
        await originalThread.save();
        // Clear Cache
        revalidatePath(path);
    } catch (error: any) {
        console.error(`Error adding comment to thread: ${error.message}`);
    }
}

export async function fetchUserPosts(userId: string) {
    connectToDB();
    try {
        const threads = await User.findOne({id:userId})
        .populate({
            path: "threads",
            model: Thread,
            populate:{
                path: "children",
                model: Thread,
                populate:{
                    path: "author",
                    model: User,
                    select: "name image id"
                }
            }
        });
        return threads;
    } catch (error: any) {
        console.error(`Error fetching user posts: ${error.message}`);
    }
}