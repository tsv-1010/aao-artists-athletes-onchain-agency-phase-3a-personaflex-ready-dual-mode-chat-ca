import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface UserRecordView {
    sbt: SoulboundToken;
    createdAt: bigint;
    consents: Array<Consent>;
    profile: Profile;
}
export interface Consent {
    matchingPermission: boolean;
    ownershipHash: string;
    timestamp: bigint;
    dataUsage: boolean;
}
export interface ChatSessionView {
    startTime: bigint;
    status: string;
    userRole: UserRole;
    consentRef: string;
    inferenceStatus: string;
    endTime?: bigint;
    messages: Array<Message>;
    metadata: string;
    user: Principal;
    sessionId: string;
    inferenceResponse?: string;
}
export interface SocialLinks {
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    website?: string;
}
export interface Message {
    content: string;
    role: string;
    timestamp: bigint;
}
export interface SoulboundToken {
    principal: Principal;
    verified: boolean;
    metadata: string;
    role: UserRole;
    timestamp: bigint;
}
export interface Profile {
    bio: string;
    social: SocialLinks;
    name: string;
    role: UserRole;
    profession: string;
}
export interface UserProfile {
    bio: string;
    social: SocialLinks;
    name: string;
    role: UserRole;
    profession: string;
}
export enum UserRole {
    athlete = "athlete",
    brand = "brand",
    artist = "artist"
}
export enum UserRole__1 {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addConsent(dataUsage: boolean, matchingPermission: boolean, ownershipHash: string): Promise<void>;
    addMessageToSession(sessionId: string, role: string, content: string): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole__1): Promise<void>;
    createBrandBrief(): Promise<void>;
    createChatSession(sessionId: string, consentRef: string, metadata: string): Promise<void>;
    createProfile(profile: Profile): Promise<void>;
    endChatSession(sessionId: string): Promise<void>;
    getAllChatSessions(): Promise<Array<ChatSessionView>>;
    getAllUserRecords(): Promise<Array<UserRecordView>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole__1>;
    getChatSession(sessionId: string): Promise<ChatSessionView | null>;
    getConsents(): Promise<Array<Consent>>;
    getProfile(): Promise<Profile | null>;
    getSBT(): Promise<SoulboundToken | null>;
    getUserChatSessions(): Promise<Array<ChatSessionView>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateProfile(profile: Profile): Promise<void>;
    updateSessionInference(sessionId: string, inferenceResponse: string, inferenceStatus: string): Promise<void>;
    verifySBT(user: Principal): Promise<void>;
    verifyUser(user: Principal): Promise<void>;
}
