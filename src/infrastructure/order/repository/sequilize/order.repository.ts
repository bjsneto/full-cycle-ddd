import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async update(entity: Order): Promise<void> {
    try {
      await OrderModel.update({
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total()
      }, {
        where: {
          id: entity.id
        }
      });

      for (const item of entity.items) {
        await OrderItemModel.update(
          {
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          },
          {
            where: {
              id: item.id,
            },
          }
        );
      }
    } catch (error) {
      console.error("Error during order update: ", error);
      throw error;
    }
  }

  async find(id: string): Promise<Order> {
    try {
      const orderModel = await OrderModel.findOne({ where: { id }, include: ["items"] });
      const orderItem = orderModel.items.map((orderItemModel) => {
        return new OrderItem(
          orderItemModel.id,
          orderItemModel.name,
          orderItemModel.price,
          orderItemModel.product_id,
          orderItemModel.quantity
        );
      }
      );
      return new Order(orderModel.id, orderModel.customer_id, orderItem);
    } catch (error) {
      console.error("Error during order find: ", error);
      throw error;
    }
  }

  async findAll(): Promise<Order[]> {
    try {
      const orderModels = await OrderModel.findAll({ include: ["items"] });
      return orderModels.map((orderModel) => {
        const orderItems = orderModel.items.map((orderItemModel) => {
          return new OrderItem(
            orderItemModel.id,
            orderItemModel.name,
            orderItemModel.price,
            orderItemModel.product_id,
            orderItemModel.quantity
          );
        });
        return new Order(orderModel.id, orderModel.customer_id, orderItems);
      });
    } catch (error) {
      console.error("Error fetching all orders: ", error);
      throw error;
    }
  }

  async create(entity: Order): Promise<void> {
    try {
      await OrderModel.create(
        {
          id: entity.id,
          customer_id: entity.customerId,
          total: entity.total(),
          items: entity.items.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            product_id: item.productId,
            quantity: item.quantity,
          })),
        },
        {
          include: [{ model: OrderItemModel }],
        }
      );
    } catch (error) {
      console.error("Error during order create: ", error);
      throw error;
    }
  }
}