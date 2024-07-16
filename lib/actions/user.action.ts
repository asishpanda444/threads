"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import { FilterQuery, SortOrder } from "mongoose";
import { auth } from "@clerk/nextjs/server";
import Thread from "../models/thread.model";

interface Params {
    userId: string;
    username: string;
    name: string;
    bio: string;
    image: string;
    path: string;
}

export async function updateUser(
    {userId,  username, name, bio, image, path}: Params): Promise<void> {
    try {
        connectToDB();
        await User.findOneAndUpdate({id:userId},
            {username: username.toLowerCase(),
            name,
            bio,
            image,
            onboarded: true,
        },{upsert: true});
    
        if(path === "/profile/edit") {
            revalidatePath(path);
        }
    } catch (error: any) {
        throw new Error(`Failed to create/update user due to: ${error.message}`);
    }
}

export async function fetchUser(userId:string) {
    try {
        connectToDB();
        return await User.findOne({id: userId});
    } catch (error: any) {
        throw new Error(`Failed to fetch user due to: ${error.message}`);
    }
}

export async function fetchUsers({
    userId,
    pageNumber = 1,
    pageSize = 10,
    searchString = "",
    sortBy = "desc"
}: {userId: string,
    pageNumber?: number,
    pageSize?: number,
    searchString?: string,
    sortBy?: SortOrder,
}){
    try {
        connectToDB();
        const skips = (pageNumber - 1) * pageSize;
        const regex = new RegExp(searchString, "i");
        const query: FilterQuery<typeof User> = {
            id: {$ne: userId},
            $or: [
                {name: {$regex: regex}},
                {username: {$regex: regex}}
            ]
        }
        const sortOptions = { createdAt: sortBy };
        const users = await User
        .find(query)
        .sort(sortOptions)
        .skip(skips)
        .limit(pageSize);
        const totalUserCount = await User.countDocuments(query);
        const hasNext = totalUserCount > (skips + users.length);
        return {users, hasNext};
    } catch (error: any) {
        throw new Error(`Failed to fetch users due to: ${error.message}`);
    }
}

export async function fetchActivity(userId: string) {
    try {
        connectToDB();
        // Fetch all threads of the created by user.
        const userThreads = await Thread.find({author: userId});

        // fetch all child threads/ 'comments'
        const childThreadIds = userThreads.reduce((acc, thread) => {
            return acc.concat(thread.children);
        }, []);
        const replies = await Thread
        .find({_id: {$in: childThreadIds}, author: {$ne: userId}})
        .populate({
            path: "author",
            model: "User",
            select: "name image _id"
        });
        return replies;
    } catch (error: any) {
        console.error(`Error during fetching Activity: ${error.message}`);
        throw new Error(`Failed to fetch Activity due to: ${error.message}`);
    }
}