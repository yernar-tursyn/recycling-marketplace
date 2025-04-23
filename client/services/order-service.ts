export interface OrderData {
  buyer_id: number;
  material_id: number;
  quantity: number;
  price: number;
  bin_id: number;
  delivery_address: string;
  contact_phone: string;
  notes: string;
}

export interface Order {
  id: number;
  buyer_id: number;
  material_id: number;
  quantity: string;
  price: string;
  total_amount: string;
  status: string;
  bin_id: number;
  delivery_address: string;
  contact_phone: string;
  notes: string;
  created_at: string;
  updated_at: string;
  material_name: string;
  material_image: string;
  category_name: string;
  buyer_name: string;
  buyer_email: string;
  seller_id?: number;
}

export async function createOrder(orderData: OrderData): Promise<Order> {
  try {
    console.log(
      "[Order Service] createOrder called with data:",
      JSON.stringify(orderData, null, 2)
    );

    const token = localStorage.getItem("token");
    console.log("[Order Service] Token exists:", !!token);

    if (!token) {
      throw new Error(
        "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
      );
    }

    if (!orderData.buyer_id || isNaN(Number(orderData.buyer_id))) {
      console.error("[Order Service] Invalid buyer_id:", orderData.buyer_id);
      throw new Error("ID покупателя отсутствует или некорректен");
    }

    const formattedOrderData = {
      buyer_id: Number(orderData.buyer_id),
      material_id: Number(orderData.material_id),
      quantity: Number(orderData.quantity),
      price: Number(orderData.price),
      bin_id: Number(orderData.bin_id),
      delivery_address: orderData.delivery_address || "string",
      contact_phone: orderData.contact_phone || "string",
      notes: orderData.notes || "string",
    };

    console.log(
      "[Order Service] Formatted order data:",
      JSON.stringify(formattedOrderData, null, 2)
    );

    const requiredFields = [
      { name: "buyer_id", value: formattedOrderData.buyer_id },
      { name: "material_id", value: formattedOrderData.material_id },
      { name: "quantity", value: formattedOrderData.quantity },
      { name: "price", value: formattedOrderData.price },
      { name: "bin_id", value: formattedOrderData.bin_id },
    ];

    const invalidFields = requiredFields.filter(
      (field) =>
        field.value === undefined ||
        field.value === null ||
        isNaN(field.value) ||
        field.value <= 0
    );

    if (invalidFields.length > 0) {
      console.error("[Order Service] Invalid fields:", invalidFields);
      throw new Error(
        `Некорректные значения полей: ${invalidFields
          .map((f) => f.name)
          .join(", ")}`
      );
    }

    console.log("[Order Service] Sending fetch request to /api/orders/create");

    const response = await fetch(
      "https://recycling-marketplace-backend.onrender.com/api/orders/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formattedOrderData),
      }
    );

    console.log("[Order Service] Response status:", response.status);

    const responseText = await response.text();
    console.log("[Order Service] Response text:", responseText);

    let responseData;
    try {
      responseData = JSON.parse(responseText);
      console.log("[Order Service] Parsed response data:", responseData);
    } catch (e) {
      console.error("[Order Service] Error parsing response JSON:", e);
      if (!response.ok) {
        throw new Error(
          `Ошибка при создании заявки: ${response.status} - ${responseText}`
        );
      }
      return {} as Order;
    }

    if (!response.ok) {
      const errorMessage =
        responseData.message ||
        responseData.error ||
        `Ошибка при создании заявки: ${response.status}`;
      console.error("[Order Service] Error response data:", responseData);
      throw new Error(errorMessage);
    }

    console.log("[Order Service] Order created successfully:", responseData);
    return responseData;
  } catch (error) {
    console.error("[Order Service] Error creating order:", error);
    throw error;
  }
}

export async function getBuyerOrders(buyerId: number): Promise<Order[]> {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
      );
    }

    const response = await fetch(
      "https://recycling-marketplace-backend.onrender.com/api/orders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Ошибка при получении заявок: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `Ошибка при получении заявок: ${response.status}`
      );
    }

    const allOrders = await response.json();

    const buyerOrders = allOrders.filter(
      (order: Order) => Number(order.buyer_id) === Number(buyerId)
    );

    console.log(
      `[Order Service] Filtered ${buyerOrders.length} orders for buyer ${buyerId}`
    );
    return buyerOrders;
  } catch (error) {
    console.error("[Order Service] Error fetching buyer orders:", error);
    throw error;
  }
}

export async function getSellerOrders(sellerId: number): Promise<Order[]> {
  try {
    console.log(
      "[Order Service] Getting seller orders for seller ID:",
      sellerId
    );

    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
      );
    }

    const response = await fetch(
      "https://recycling-marketplace-backend.onrender.com/api/orders",
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Ошибка при получении заявок: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `Ошибка при получении заявок: ${response.status}`
      );
    }

    const allOrders = await response.json();
    console.log("[Order Service] All orders:", allOrders);

    const sellerOrders = allOrders.filter((order: any) => {
      const orderSellerId = order.seller_id || order.sellerId || null;

      if (
        orderSellerId !== null &&
        Number(orderSellerId) === Number(sellerId)
      ) {
        console.log(
          `[Order Service] Found order ${order.id} with direct seller_id match:`,
          orderSellerId
        );
        return true;
      }

      const binId = order.bin_id || order.binId;
      if (binId) {
        console.log(
          `[Order Service] Checking bin_id ${binId} for seller ${sellerId}`
        );
        return true;
      }

      const materialId = order.material_id || order.materialId;
      if (materialId) {
        console.log(
          `[Order Service] Checking material_id ${materialId} for seller ${sellerId}`
        );
        return true;
      }

      return false;
    });

    console.log(
      `[Order Service] Filtered ${sellerOrders.length} orders for seller ${sellerId}:`,
      sellerOrders
    );
    return sellerOrders;
  } catch (error) {
    console.error("[Order Service] Error fetching seller orders:", error);
    throw error;
  }
}

export async function updateOrderStatus(
  orderId: number,
  status: string
): Promise<Order> {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
      );
    }

    const response = await fetch(
      `https://recycling-marketplace-backend.onrender.com/api/orders/${orderId}/status`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Ошибка при обновлении статуса: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `Ошибка при обновлении статуса: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[Order Service] Error updating order status:", error);
    throw error;
  }
}

export async function getOrderById(orderId: number): Promise<Order> {
  try {
    const token = localStorage.getItem("token");

    if (!token) {
      throw new Error(
        "Токен авторизации отсутствует. Пожалуйста, войдите в систему."
      );
    }

    const response = await fetch(
      `https://recycling-marketplace-backend.onrender.com/api/orders/${orderId}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `Ошибка при получении заявки: ${response.status}`,
      }));
      throw new Error(
        errorData.message || `Ошибка при получении заявки: ${response.status}`
      );
    }

    return await response.json();
  } catch (error) {
    console.error("[Order Service] Error fetching order:", error);
    throw error;
  }
}
