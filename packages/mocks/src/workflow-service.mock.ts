export class MockWorkflowService {
  private mockWorkflows: any[] = [];

  async detectPattern(actions: any[]): Promise<any> {
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

  async executeWorkflow(workflowId: string): Promise<any> {
    return {
      workflowId,
      status: 'running',
      currentStep: 1,
      totalSteps: 5,
      completedSteps: 0,
      progress: 0.0
    };
  }

  async getWorkflowStatus(workflowId: string): Promise<any> {
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
