import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { UserProfile, Profile, SoulboundToken, Consent } from '../backend';
import { toast } from 'sonner';

// Local type definitions for chat sessions (until backend implements these)
interface ChatMessage {
  role: string;
  content: string;
  timestamp: number;
}

interface ChatSessionData {
  sessionId: string;
  messages: string[];
  timestamp: number;
  userRole?: string;
  consentRef?: string;
  inferenceResponse?: string;
  inferenceStatus?: string;
  inferenceMetadata?: {
    response: string;
    tokenUsage?: {
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    };
    timestamp: number;
  };
}

// User Profile Queries
export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['sbt'] });
      toast.success('Profile saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });
}

export function useGetProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Profile | null>({
    queryKey: ['profile'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getProfile();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useUpdateProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: Profile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
      toast.success('Profile updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update profile: ${error.message}`);
    },
  });
}

// SBT Queries
export function useGetSBT() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<SoulboundToken | null>({
    queryKey: ['sbt'],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getSBT();
    },
    enabled: !!actor && !actorFetching,
  });
}

// Consent Queries
export function useGetConsents() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Consent[]>({
    queryKey: ['consents'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getConsents();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddConsent() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      dataUsage: boolean; 
      matchingPermission: boolean; 
      ownershipHash: string;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addConsent(
        params.dataUsage,
        params.matchingPermission,
        params.ownershipHash
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consents'] });
      toast.success('Consent preferences updated');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update consent: ${error.message}`);
    },
  });
}

// Chat Session Queries - Placeholder implementations until backend is ready
export function useAddChatSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { sessionId: string; messages: string[] }) => {
      // Store in localStorage as fallback until backend implements this
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
      sessions[params.sessionId] = {
        sessionId: params.sessionId,
        messages: params.messages,
        timestamp: Date.now(),
      };
      localStorage.setItem('chatSessions', JSON.stringify(sessions));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chatSession'] });
      toast.success('Chat session saved successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save chat session: ${error.message}`);
    },
  });
}

export function useGetChatSession(sessionId: string | null) {
  return useQuery<ChatSessionData | null>({
    queryKey: ['chatSession', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      // Retrieve from localStorage as fallback until backend implements this
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
      return sessions[sessionId] || null;
    },
    enabled: !!sessionId,
  });
}

// Mistral API Integration
export interface MistralConfig {
  baseUrl: string;
  apiKey: string;
}

export interface MistralResponse {
  response: string;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  timestamp: number;
}

export function useMistralAPI() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { 
      sessionId: string; 
      prompt: string; 
      config: MistralConfig;
    }) => {
      const { sessionId, prompt, config } = params;

      // Simulate API call for now - in production this would call the backend
      // which would then make HTTP outcalls to Mistral API
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock response
      const mockResponse: MistralResponse = {
        response: `Thank you for sharing that information. Based on your response about "${prompt.slice(0, 50)}...", I can see you have clear goals and vision. This will help us match you with the right opportunities.`,
        tokenUsage: {
          promptTokens: Math.floor(prompt.length / 4),
          completionTokens: 45,
          totalTokens: Math.floor(prompt.length / 4) + 45,
        },
        timestamp: Date.now(),
      };

      // Store inference result with session
      const sessions = JSON.parse(localStorage.getItem('chatSessions') || '{}');
      if (sessions[sessionId]) {
        sessions[sessionId].inferenceResponse = mockResponse.response;
        sessions[sessionId].inferenceStatus = 'success';
        sessions[sessionId].inferenceMetadata = mockResponse;
        localStorage.setItem('chatSessions', JSON.stringify(sessions));
      }

      return mockResponse;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['chatSession', variables.sessionId] });
      toast.success('Mistral AI response received');
    },
    onError: (error: Error) => {
      toast.error(`Mistral API error: ${error.message}`);
    },
  });
}

// Mistral Configuration Management
export function useMistralConfig() {
  const getConfig = (): MistralConfig => {
    const stored = localStorage.getItem('mistralConfig');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      baseUrl: 'https://api.mistral.ai/v1',
      apiKey: '',
    };
  };

  const saveConfig = (config: MistralConfig) => {
    localStorage.setItem('mistralConfig', JSON.stringify(config));
    toast.success('Mistral API configuration saved');
  };

  return { getConfig, saveConfig };
}
