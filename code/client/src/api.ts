import axios from "axios";
import {
    Lead,
    Opportunity,
    CustomField,
    Stage,
    AppSetting,
    PipelineReport,
} from "./types";

export const queryKeys = {
    leads: ["leads"] as const,
    opportunities: ["opportunities"] as const,
    customFields: ["customFields"] as const,
    stages: ["stages"] as const,
    settings: ["settings"] as const,
    pipeline: ["pipeline"] as const,
};

// Leads
export const fetchLeads = async (): Promise<Lead[]> =>
    (await axios.get("/api/leads")).data;

export type LeadInput = {
    firstName: string;
    lastName: string;
    age: string | number;
    phoneNumber: string;
    customFields: Record<string, string>;
};

export const createLead = async (input: LeadInput): Promise<Lead> =>
    (await axios.post("/api/leads", input)).data;

export const updateLead = async (
    id: number,
    input: LeadInput,
): Promise<Lead> => (await axios.put(`/api/leads/${id}`, input)).data;

export const deleteLead = async (id: number): Promise<void> => {
    await axios.delete(`/api/leads/${id}`);
};

// Opportunities
export const fetchOpportunities = async (): Promise<Opportunity[]> =>
    (await axios.get("/api/opportunities")).data;

export type OpportunityInput = {
    leadId: number;
    stageId: number;
    value: number;
    name?: string;
    closeDate?: string | null;
    customFields: Record<string, string>;
};

export const createOpportunity = async (
    input: OpportunityInput,
): Promise<Opportunity> =>
    (await axios.post("/api/opportunities", input)).data;

export const updateOpportunity = async (
    id: number,
    input: Partial<OpportunityInput>,
): Promise<Opportunity> =>
    (await axios.put(`/api/opportunities/${id}`, input)).data;

export const deleteOpportunity = async (id: number): Promise<void> => {
    await axios.delete(`/api/opportunities/${id}`);
};

// Custom fields
export const fetchCustomFields = async (): Promise<CustomField[]> =>
    (await axios.get("/api/custom-fields")).data;

export type CustomFieldInput = {
    name: string;
    label: string;
    entity: string;
    type: string;
};

export const createCustomField = async (
    input: CustomFieldInput,
): Promise<CustomField> => (await axios.post("/api/custom-fields", input)).data;

export const deleteCustomField = async (id: number): Promise<void> => {
    await axios.delete(`/api/custom-fields/${id}`);
};

// Stages
export const fetchStages = async (): Promise<Stage[]> =>
    (await axios.get("/api/stages")).data;

export type StageInput = {
    name: string;
    status: "pending" | "won" | "lost";
    conversionLikelihood: number;
};

export const createStage = async (input: StageInput): Promise<Stage> =>
    (await axios.post("/api/stages", input)).data;

export const updateStage = async (
    id: number,
    input: StageInput,
): Promise<Stage> => (await axios.put(`/api/stages/${id}`, input)).data;

export const deleteStage = async (id: number): Promise<void> => {
    await axios.delete(`/api/stages/${id}`);
};

// Settings
export const fetchSettings = async (): Promise<AppSetting[]> =>
    (await axios.get("/api/settings")).data;

export const updateSetting = async (
    key: string,
    value: string,
): Promise<AppSetting> =>
    (await axios.put(`/api/settings/${key}`, { value })).data;

// Pipeline
export const fetchPipeline = async (): Promise<PipelineReport> =>
    (await axios.get("/api/pipeline")).data;
