import api from '../api/axios';

/**
 * Service for tracking page views using Graphite metrics
 */
export class GraphiteService {
    private static instance: GraphiteService;

    private constructor() {}

    /**
     * Get the singleton instance of GraphiteService
     */
    public static getInstance(): GraphiteService {
        if (!GraphiteService.instance) {
            GraphiteService.instance = new GraphiteService();
        }
        return GraphiteService.instance;
    }

    /**
     * Increment the page view counter by sending a metric to the server
     */
    public incrementPageView(): void {
        this.sendMetricToServer();
    }

    /**
     * Send metrics to the backend API (which forwards to Graphite/StatsD)
     */
    private sendMetricToServer(): void {
        api.post('/api/metrics/count/visit')
            .catch(() => {
                // Silently fail — metrics are non-critical
            });
    }
}

// Export a default instance for easy import
const graphiteService = GraphiteService.getInstance();
export default graphiteService;