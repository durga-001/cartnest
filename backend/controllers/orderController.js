import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from "stripe";
import razorpay from "razorpay";
import crypto from "crypto";

//global variables
const currency = "inr";
const deliveryCharge = 10;

//gateway initializee
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const razorpayInstance = new razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Atomically decrements stock for each ordered item. The filter's $gte check and the
// $inc happen as a single atomic operation on one document, so if two requests race to
// buy the last unit, MongoDB guarantees only one of them succeeds — the other gets
// "Insufficient stock" instead of both orders going through and overselling.
// Products that don't have a tracked stock number for a given size (legacy/untracked
// items) are treated as unlimited stock and skipped.
const applyStockDecrement = async (items) => {
  for (const item of items) {
    const product = await productModel.findById(item._id);
    if (!product) {
      throw new Error(`Product no longer available: ${item.name}`);
    }

    const trackedQty = product.stock ? product.stock.get(item.size) : undefined;
    if (trackedQty === undefined || trackedQty === null) continue;

    const updated = await productModel.findOneAndUpdate(
      { _id: item._id, [`stock.${item.size}`]: { $gte: item.quantity } },
      { $inc: { [`stock.${item.size}`]: -item.quantity } },
    );

    if (!updated) {
      throw new Error(
        `Insufficient stock for "${item.name}" (size ${item.size})`,
      );
    }
  }
};
//placing order using COD method
const placeOrder = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;

    await applyStockDecrement(items);

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//placing order using COD method
const placeOrderStripe = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "Stripe",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: item.price * 100,
      },
      quantity: item.quantity,
    }));

    line_items.push({
      price_data: {
        currency: currency,
        product_data: {
          name: "Delivery Charges",
        },
        unit_amount: deliveryCharge * 100,
      },
      quantity: 1,
    });

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
      cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
      line_items,
      mode: "payment",
    });
    res.json({ success: true, session_url: session.url });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//verify stripe
const verifyStripe = async (req, res) => {
  const { orderId, success, userId } = req.body;

  try {
    if (success === "true") {
      const order = await orderModel.findById(orderId);
      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }
      if (!order.payment) {
        // decrement stock only once, the first time this order is confirmed paid
        await applyStockDecrement(order.items);
      }
      await orderModel.findByIdAndUpdate(orderId, { payment: true });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      res.json({ success: true });
    } else {
      await orderModel.findByIdAndDelete(orderId);
      res.json({ success: false });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//placing order using COD method
const placeOrderRazorpay = async (req, res) => {
  try {
    const { userId, items, amount, address } = req.body;
    const { origin } = req.headers;

    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "Razorpay",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    const options = {
      amount: amount * 100,
      currency: currency.toUpperCase(),
      receipt: newOrder._id.toString(),
    };

    await razorpayInstance.orders.create(options, (error, order) => {
      if (error) {
        console.log(error);
        return res.json({ success: false, message: error });
      }
      res.json({ success: true, order });
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

const verifyRazorpay = async (req, res) => {
  try {
    const {
      userId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.json({
        success: false,
        message: "Missing payment verification details",
      });
    }

    // Recompute the signature server-side from order_id + payment_id using our secret key,
    // and compare it to what the client sent. This is what actually proves the payment
    // response came from Razorpay and wasn't forged/replayed by the client.
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.log("Razorpay signature mismatch for order:", razorpay_order_id);
      return res.json({
        success: false,
        message: "Payment verification failed: invalid signature",
      });
    }

    const orderInfo = await razorpayInstance.orders.fetch(razorpay_order_id);
    if (orderInfo.status === "paid") {
      const order = await orderModel.findById(orderInfo.receipt);
      if (!order) {
        return res.json({ success: false, message: "Order not found" });
      }
      if (!order.payment) {
        // decrement stock only once, the first time this order is confirmed paid
        await applyStockDecrement(order.items);
      }
      await orderModel.findByIdAndUpdate(orderInfo.receipt, {
        payment: true,
        transactionId: razorpay_payment_id,
      });
      await userModel.findByIdAndUpdate(userId, { cartData: {} });
      console.log(
        `[Razorpay] verified payment ${razorpay_payment_id} for order ${orderInfo.receipt}`,
      );
      res.json({ success: true, message: "Payment Successfully" });
    } else {
      res.json({ success: false, message: "Payment not completed" });
    }
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//all order data for admin panel
const allOrders = async (req, res) => {
  try {
    const orders = await orderModel.find({});
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//user order data for frontend
const userOrders = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await orderModel.find({ userId });
    res.json({ success: true, orders });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//update order status from admin panel
const updateStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    await orderModel.findByIdAndUpdate(orderId, { status });
    res.json({ success: true, messsage: "Status updated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {
  verifyRazorpay,
  placeOrder,
  verifyStripe,
  placeOrderStripe,
  placeOrderRazorpay,
  allOrders,
  userOrders,
  updateStatus,
};
