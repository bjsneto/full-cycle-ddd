import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/custumer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customerRepository = new CustomerRepository();
    const customer = new Customer("123", "Customer 1");
    const address = new Address("Street 1", 1, "Zipcode 1", "City 1");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    const productRepository = new ProductRepository();
    const product = new Product("123", "Product 1", 10);
    await productRepository.create(product);

    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      2
    );

    const order = new Order("123", "123", [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: "123",
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "123",
        },
      ],
    });
  });

  it("should find all order", async () => {

    //Cliente
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Belarmino");
    const address = new Address("Bela Vista", 1, "Zipcode 2024", "São Paulo");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    //Produto
    const productRepository = new ProductRepository();
    const product = new Product("1", "Curso Full Cycle", 4000);
    await productRepository.create(product);

    //Item do pedido
    const orderItem = new OrderItem(
      "1",
      product.name,
      product.price,
      product.id,
      1
    );

    //Pedido
    const order = new Order("1", customer.id, [orderItem]);

    //Criar Pedido
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    //Listar todos pedidos
    const foundOrders = await orderRepository.findAll();

    const orders = [order];

    expect(orders).toEqual(foundOrders);

  });

  it("should find a order by id", async () => {

    //Cliente
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Belarmino");
    const address = new Address("Bela Vista", 1, "Zipcode 2024", "São Paulo");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    //Produto
    const productRepository = new ProductRepository();
    const product = new Product("1", "MBA Full Cycle", 10000);
    await productRepository.create(product);

    //Item do pedido
    const orderItem = new OrderItem(
      "2",
      product.name,
      product.price,
      product.id,
      2
    );

    //Pedido
    const order = new Order("1", customer.id, [orderItem]);

    //Criar Pedido
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    //Lista pedido por ID
    const foundOrder = await orderRepository.find("1");

    const orderModel = await OrderModel.findOne({ where: { id: "1" }, include: ["items"] });

    const expectedOrder = {
      id: foundOrder.id,
      customer_id: foundOrder.customerId,
      items: foundOrder.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: foundOrder.id
      })),
      total: foundOrder.total(),
    };
    expect(orderModel.toJSON()).toStrictEqual(expectedOrder);
  });

  it("should update an existing order", async () => {

    // Cliente
    const customerRepository = new CustomerRepository();
    const customer = new Customer("1", "Belarmino");
    const address = new Address("Bela Vista", 1, "Zipcode 2024", "São Paulo");
    customer.changeAddress(address);
    await customerRepository.create(customer);

    //Produto
    const productRepository = new ProductRepository();
    const product = new Product("1", "Curso Full Cycle", 4000);
    await productRepository.create(product);

    //Item do pedido
    const orderItem = new OrderItem("1", product.name, product.price, product.id, 1);
    const order = new Order("1", customer.id, [orderItem]);

    //Criar Pedido
    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    // Modificar o Pedido
    const modifiedOrder = new Order("1", customer.id, [
      new OrderItem("1", "MBA Full Cycle", 20000, product.id, 2),
    ]);
    await orderRepository.update(modifiedOrder);

    // Verificar se o Pedido foi atualizada corretamente
    const updatedOrder = await OrderModel.findOne({ where: { id: modifiedOrder.id }, include: ["items"] });

    expect(updatedOrder.toJSON()).toStrictEqual({
      id: modifiedOrder.id,
      customer_id: modifiedOrder.customerId,
      total: modifiedOrder.total(),
      items: modifiedOrder.items.map((item) => ({
        id: item.id,
        name: item.name,
        price: item.price,
        product_id: item.productId,
        quantity: item.quantity,
        order_id: modifiedOrder.id,
      })),
    });
  });

});