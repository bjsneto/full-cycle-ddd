import RepositoryInterface from "../../@shared/repository/repository-interface";
import Customer from "../entity/custumer";

export default interface CustomerRepositoryInterface
  extends RepositoryInterface<Customer> {}