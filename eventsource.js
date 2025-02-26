// eventDataSourceStrategies.js

/**
 * @interface EventDataSourceStrategy
 */
class EventDataSourceStrategy {
    /**
     * @returns {object}
     * @abstract
     */
    getEvents() {
        throw new Error("Method 'getEvents()' must be implemented by concrete strategy.");
    }
}

class HardcodedEventDataSourceStrategy extends EventDataSourceStrategy {
    getEvents() {
        return {
            "2024-03-05": [{
                title: 'Team Meeting',
                description: 'Project discussion',
            }],
            "2024-03-12": [{
                title: 'Project Review',
                startTime: '14:00',
                endTime: '16:00',
            }],
            "2024-03-20": [{
                title: 'Workshop Day',
            }],
            "2024-04-02": [{
                title: 'Client Call',
                description: 'Discuss event planning',
            }],
        };
    }
}