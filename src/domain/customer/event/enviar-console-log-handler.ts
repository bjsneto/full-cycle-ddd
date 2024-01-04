import EventHandlerInterface from "../../@shared/event/event-handler.interface";
import CustomerEditAddress from "./customer-edit-address.event";

export default class EnviaConsoleLogHandler implements EventHandlerInterface<CustomerEditAddress>{
    handle(event: CustomerEditAddress): void {
        console.log(`Endereço do cliente: ${event.eventData.id}, ${event.eventData.name} alterado para: ${event.eventData.Address}`)
    }

}