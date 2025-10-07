"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockWorkflowService = void 0;
class MockWorkflowService {
    constructor() {
        this.mockWorkflows = [];
    }
    async detectPattern(actions) {
        if (actions.length < 3) {
            return { patternDetected: false };
        }
        return {
            patternDetected: true,
            pattern: {
                name: 'Weekly Status Report',
                frequency: 'weekly',
                steps: [
                    'Gather metrics from dashboard',
                    'Draft update email',
                    'Review with team',
                    'Send to stakeholders'
                ],
                confidence: 0.85
            },
            suggestAutomation: true
        };
    }
    async executeWorkflow(workflowId) {
        return {
            workflowId,
            status: 'running',
            currentStep: 1,
            totalSteps: 5,
            completedSteps: 0,
            progress: 0.0
        };
    }
    async getWorkflowStatus(workflowId) {
        return {
            workflowId,
            status: 'completed',
            currentStep: 5,
            totalSteps: 5,
            completedSteps: 5,
            progress: 1.0,
            results: {
                success: true,
                output: 'Workflow completed successfully'
            }
        };
    }
}
exports.MockWorkflowService = MockWorkflowService;
