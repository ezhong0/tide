export declare class MockWorkflowService {
    private mockWorkflows;
    detectPattern(actions: any[]): Promise<any>;
    executeWorkflow(workflowId: string): Promise<any>;
    getWorkflowStatus(workflowId: string): Promise<any>;
}
