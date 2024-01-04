import EventInterface from "../../@shared/event/event.interface";

export default class CustomerEditAddressEvent implements EventInterface {
    dataTimeOccurred: Date;
    eventData: any;
    constructor(eventData: any) {
        this.dataTimeOccurred = new Date();
        this.eventData = eventData;
      }
}