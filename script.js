import { EventDataSourceStrategy, HardcodedEventDataSourceStrategy } from './eventDataSourceStrategies.js';

document.addEventListener('DOMContentLoaded', () => {
    const dataSource = new HardcodedEventDataSourceStrategy();

    const calendarConfigurator = new CalendarConfigurator(dataSource);

    calendarConfigurator.initializeCalendar();
});

class CalendarConfigurator {
    constructor(dataSourceStrategy) {
        this.dataSourceStrategy = dataSourceStrategy;
    }

    initializeCalendar() {
        const { Calendar } = window.VanillaCalendarPro;

        const calendar = new Calendar('#calendar', {
            settings: {
                iso8601: false, 
            },
            events: this.dataSourceStrategy.getEvents(), 
        });
        calendar.init();
    }
}