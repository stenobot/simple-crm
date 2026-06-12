import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    closestCorners,
    DndContext,
    DragOverlay,
    PointerSensor,
    useDroppable,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type UniqueIdentifier,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState, type CSSProperties } from "react";
import {
    queryKeys,
    fetchPipeline,
    reorderOpportunities,
    updateOpportunity,
} from "./api";
import { formatCurrency, formatPercent } from "./format";
import type { Opportunity, PipelineReport } from "./types";

type PipelineColumn = PipelineReport["byStage"][number];

type ReorderVariables = {
    oppId: number;
    sourceStageId: number;
    targetStageId: number;
    targetIndex: number;
    orderedIds: number[];
};

const leadName = (opp: Opportunity): string =>
    `${opp.lead.firstName} ${opp.lead.lastName}`.trim();

const opportunityId = (oppId: number): string => `opp-${oppId}`;

const stageDropId = (stageId: number): string => `stage-${stageId}`;

const parseOpportunityId = (id: UniqueIdentifier): number | null => {
    const value = String(id);
    if (!value.startsWith("opp-")) return null;

    const oppId = Number(value.slice("opp-".length));
    return Number.isNaN(oppId) ? null : oppId;
};

const parseStageId = (id: UniqueIdentifier): number | null => {
    const value = String(id);
    if (!value.startsWith("stage-")) return null;

    const stageId = Number(value.slice("stage-".length));
    return Number.isNaN(stageId) ? null : stageId;
};

const recalculateColumn = (
    column: PipelineColumn,
    opportunities: Opportunity[],
): PipelineColumn => ({
    ...column,
    opportunities,
    count: opportunities.length,
    totalValue: opportunities.reduce((sum, opp) => sum + opp.value, 0),
    expectedValue: opportunities.reduce(
        (sum, opp) => sum + (opp.expectedValue ?? 0),
        0,
    ),
});

const recalculateReport = (byStage: PipelineColumn[]): PipelineReport => ({
    totalValue: byStage.reduce((sum, column) => sum + column.totalValue, 0),
    expectedValue: byStage.reduce((sum, column) => sum + column.expectedValue, 0),
    byStage,
});

const findOpportunityColumn = (
    report: PipelineReport,
    oppId: number,
): { column: PipelineColumn; index: number } | null => {
    for (const column of report.byStage) {
        const index = column.opportunities.findIndex(opp => opp.id === oppId);
        if (index !== -1) return { column, index };
    }

    return null;
};

const moveOpportunity = (
    report: PipelineReport,
    oppId: number,
    targetStageId: number,
    targetIndex: number,
): PipelineReport => {
    const source = findOpportunityColumn(report, oppId);
    const target = report.byStage.find(column => column.stage.id === targetStageId);
    if (!source || !target) return report;

    if (source.column.stage.id === targetStageId) {
        const reordered = arrayMove(
            source.column.opportunities,
            source.index,
            targetIndex,
        );
        const byStage = report.byStage.map(column =>
            column.stage.id === targetStageId
                ? recalculateColumn(column, reordered)
                : column,
        );

        return recalculateReport(byStage);
    }

    const moved = source.column.opportunities[source.index];
    const movedOpp: Opportunity = { ...moved, stage: target.stage };

    const byStage = report.byStage.map(column => {
        if (column.stage.id === source.column.stage.id) {
            return recalculateColumn(
                column,
                column.opportunities.filter(opp => opp.id !== oppId),
            );
        }

        if (column.stage.id === targetStageId) {
            const insertAt = Math.max(
                0,
                Math.min(targetIndex, column.opportunities.length),
            );
            const opportunities = [...column.opportunities];
            opportunities.splice(insertAt, 0, movedOpp);
            return recalculateColumn(column, opportunities);
        }

        return column;
    });

    return recalculateReport(byStage);
};

const orderedIdsForStage = (
    report: PipelineReport,
    stageId: number,
): number[] | null =>
    report.byStage
        .find(column => column.stage.id === stageId)
        ?.opportunities.map(opp => opp.id) ?? null;

const OpportunityCardBody: React.FC<{ opp: Opportunity }> = ({ opp }) => (
    <>
        <p className="font-medium truncate">{opp.name || leadName(opp)}</p>
        <p className="text-xs text-gray-500 truncate">{leadName(opp)}</p>
        <div className="mt-1 flex justify-between text-xs font-mono">
            <span>{formatCurrency(opp.value)}</span>
            <span className="font-bold">{formatCurrency(opp.expectedValue ?? 0)}</span>
        </div>
    </>
);

const OpportunityCard: React.FC<{ opp: Opportunity }> = ({ opp }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: opportunityId(opp.id),
        data: { oppId: opp.id, stageId: opp.stage.id },
    });
    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...listeners}
            {...attributes}
            className={`rounded border border-gray-200 bg-white p-2 shadow-sm cursor-grab active:cursor-grabbing ${
                isDragging ? "opacity-40" : ""
            }`}>
            <OpportunityCardBody opp={opp} />
        </div>
    );
};

const OpportunityCardOverlay: React.FC<{ opp: Opportunity }> = ({ opp }) => (
    <div className="rounded border border-gray-200 bg-white p-2 shadow-lg cursor-grab active:cursor-grabbing">
        <OpportunityCardBody opp={opp} />
    </div>
);

const StageColumn: React.FC<{
    column: PipelineReport["byStage"][number];
}> = ({ column }) => {
    const { stage, count, totalValue, expectedValue, opportunities } = column;
    const { setNodeRef, isOver } = useDroppable({ id: stageDropId(stage.id) });

    const headerBg =
        stage.status === "won"
            ? "bg-green-50"
            : stage.status === "lost"
              ? "bg-red-50"
              : "bg-gray-100";

    return (
        <div className="flex w-72 shrink-0 flex-col rounded border border-gray-300">
            <div className={`rounded-t border-b border-gray-300 p-3 ${headerBg}`}>
                <div className="flex items-baseline justify-between">
                    <span className="font-medium">{stage.name}</span>
                    <span className="text-xs text-gray-500">({stage.status})</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                    <span className="text-gray-600">Count</span>
                    <span className="text-right font-mono">{count}</span>
                    <span className="text-gray-600">Pipeline $</span>
                    <span className="text-right font-mono">
                        {formatCurrency(totalValue)}
                    </span>
                    <span className="text-gray-600">Likelihood</span>
                    <span className="text-right font-mono">
                        {formatPercent(stage.conversionLikelihood)}
                    </span>
                    <span className="text-gray-600">Expected $</span>
                    <span className="text-right font-mono font-bold">
                        {formatCurrency(expectedValue)}
                    </span>
                </div>
            </div>
            <div
                ref={setNodeRef}
                className={`flex-1 space-y-2 p-2 min-h-24 ${
                    isOver ? "bg-blue-50" : ""
                }`}>
                <SortableContext
                    items={opportunities.map(opp => opportunityId(opp.id))}
                    strategy={verticalListSortingStrategy}>
                    {opportunities.map(opp => (
                        <OpportunityCard key={opp.id} opp={opp} />
                    ))}
                </SortableContext>
            </div>
        </div>
    );
};

export const Pipeline: React.FC = () => {
    const queryClient = useQueryClient();
    const [activeOpp, setActiveOpp] = useState<Opportunity | null>(null);

    const { data: report, isLoading } = useQuery({
        queryKey: queryKeys.pipeline,
        queryFn: fetchPipeline,
    });

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    );

    const reorderMutation = useMutation({
        mutationFn: async ({
            oppId,
            sourceStageId,
            targetStageId,
            orderedIds,
        }: ReorderVariables) => {
            if (sourceStageId !== targetStageId) {
                await updateOpportunity(oppId, { stageId: targetStageId });
            }

            await reorderOpportunities(orderedIds);
        },
        onMutate: async ({ oppId, targetStageId, targetIndex }) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.pipeline });
            const previous = queryClient.getQueryData<PipelineReport>(
                queryKeys.pipeline,
            );
            if (previous) {
                queryClient.setQueryData<PipelineReport>(
                    queryKeys.pipeline,
                    moveOpportunity(previous, oppId, targetStageId, targetIndex),
                );
            }
            return { previous };
        },
        onError: (_err, _vars, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.pipeline, context.previous);
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.pipeline });
            queryClient.invalidateQueries({ queryKey: queryKeys.opportunities });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const oppId = parseOpportunityId(event.active.id);
        if (oppId === null) {
            setActiveOpp(null);
            return;
        }

        const found = report?.byStage
            .flatMap(column => column.opportunities)
            .find(opp => opp.id === oppId);
        setActiveOpp(found ?? null);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveOpp(null);
        const { active, over } = event;
        if (!over || !report) return;

        const oppId = parseOpportunityId(active.id);
        if (oppId === null) return;

        const source = findOpportunityColumn(report, oppId);
        if (!source) return;

        const overOppId = parseOpportunityId(over.id);
        const overStageId = parseStageId(over.id);
        let targetStageId: number | null = null;
        let targetIndex = 0;

        if (overOppId !== null) {
            const target = findOpportunityColumn(report, overOppId);
            if (!target) return;

            targetStageId = target.column.stage.id;
            targetIndex = target.index;
        } else if (overStageId !== null) {
            const target = report.byStage.find(
                column => column.stage.id === overStageId,
            );
            if (!target) return;

            targetStageId = target.stage.id;
            targetIndex = target.opportunities.length;
        }

        if (targetStageId === null) return;

        const sameStage = source.column.stage.id === targetStageId;
        const finalTargetIndex = sameStage
            ? Math.min(targetIndex, source.column.opportunities.length - 1)
            : targetIndex;
        if (sameStage && source.index === finalTargetIndex) return;

        const nextReport = moveOpportunity(report, oppId, targetStageId, targetIndex);
        const orderedIds = orderedIdsForStage(nextReport, targetStageId);
        if (!orderedIds) return;

        reorderMutation.mutate({
            oppId,
            sourceStageId: source.column.stage.id,
            targetStageId,
            targetIndex,
            orderedIds,
        });
    };

    if (isLoading) return <p>Loading pipeline...</p>;
    if (!report) return <p>No pipeline data</p>;

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Pipeline Report</h2>

            <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded border border-blue-200">
                    <p className="text-sm text-gray-600">Total Pipeline Value</p>
                    <p className="text-2xl font-bold">
                        {formatCurrency(report.totalValue)}
                    </p>
                </div>
                <div className="p-4 bg-green-50 rounded border border-green-200">
                    <p className="text-sm text-gray-600">Expected Close Value</p>
                    <p className="text-2xl font-bold">
                        {formatCurrency(report.expectedValue)}
                    </p>
                </div>
            </div>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragCancel={() => setActiveOpp(null)}>
                <div className="flex gap-4 overflow-x-auto pb-2">
                    {report.byStage.map(column => (
                        <StageColumn key={column.stage.id} column={column} />
                    ))}
                </div>
                <DragOverlay>
                    {activeOpp ? <OpportunityCardOverlay opp={activeOpp} /> : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};
