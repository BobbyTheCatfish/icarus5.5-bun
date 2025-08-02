import axios from "axios"

class SnipCart {
  key: any;
  constructor(auth: any) {
    this.key = auth;
  }

  async callApi (call: string, data: Record<any, any> = {}, method: string = "get"): Promise<any> {
    method = method.toUpperCase();
  
    call = encodeURI(call);
  
    if (method === "GET") {
      const urlParams = Object.keys(data).map((key) =>
        encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
      ).join("&");
      call += (urlParams ? "?" + urlParams : "");
    }
  
    // @ts-ignore
    const response = await axios({
      baseURL: "https://app.snipcart.com/api",
      url: call,
      data,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      auth: {
        username: this.key, password: ""
      },
      method
    });
  
    return response.data;
  };
  
  // DISCOUNTS
  
  deleteDiscount(discount: string | { id: string; }) {
    const id = ((typeof discount === "string") ? discount : discount.id);
    return this.callApi(`/discounts/${id}`, undefined, "DELETE");
  };
  
  editDiscount(discount: { id: string; }) {
    return this.callApi(`/discounts/${discount.id}`, discount, "PUT");
  };
  
  getDiscountCode(code: string | { id: string; }) {
    return new Promise((fulfill, reject) => {
      this.callApi("/discounts").then(discounts =>
        fulfill(discounts.find((d: any) => d.code === code))
      ).catch(reject);
    });
  };
  
  getDiscounts() {
    return this.callApi("/discounts");
  };

  newDiscount(discount: { name: string; combinable: boolean; maxNumberOfUsages: number; trigger: string; code: string; type: string; amount: number; }) {
    return this.callApi("/discounts", discount, "POST");
  };

}

export default SnipCart
