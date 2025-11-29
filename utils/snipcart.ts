import axios from "axios";
import config from "../config/config.json";

type DiscountCreateProps = {
  name: string
  trigger: string
  code: string
  type: string
  amount?: number | null
  rate?: number | null
  combinable?: boolean
  maxNumberOfUsages?: number
}

type DiscountProps = {
  archived: boolean;
  id: string;
}

type Discount = DiscountCreateProps & DiscountProps


// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function call<T>(endpoint: string, data: Record<any, any> | any[] = {}, method: string = "get"): Promise<T> {
  return axios({
    url: `https://app.snipcart.com/api/${endpoint}`,
    method,
    data,
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "Authorization": `Basic ${config.api.snipcart}`
    },
  })
  .then(/** @param {{ data: T }} res */ (res: { data: T; }) => res.data);
}

function getAllDiscounts(): Promise<Discount[]> {
  return call("/discounts");
}

function getDiscountByCode(code: string): Promise<Discount | undefined> {
  return getAllDiscounts().then(discounts => discounts.find(d => d.code === code));
}

function newDiscount(discount: DiscountCreateProps): Promise<Discount> {
  return call("/discounts", discount, "POST");
}

function editDiscount(discountId: string, discount: DiscountCreateProps & Partial<DiscountProps>): Promise<Discount | undefined> {
  return call(`/discounts/${discountId}`, discount, "PUT");
}

function deleteDiscount(discountId: string): Promise<void> {
  return call(`/discounts/${discountId}`, undefined, "DELETE");
}

export default {
  getDiscountByCode,
  getAllDiscounts,
  newDiscount,
  editDiscount,
  deleteDiscount
};
