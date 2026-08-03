import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";
import { useState } from "react";
import axios from "axios";
import { useEffect } from "react";
const Orders = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);

  const [orderData, setorderData] = useState([]);
  const [trackingIndex, setTrackingIndex] = useState(null);

  const stages = [
    "Order Placed",
    "Packing",
    "Shipped",
    "Out for delivery",
    "Delivered",
  ];

  const loadOrderData = async () => {
    try {
      if (!token) {
        return null;
      }
      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        let allOrdersItem = [];
        response.data.orders.map((order) => {
          order.items.map((item) => {
            item["status"] = order.status;
            item["payment"] = order.payment;
            item["paymentMethod"] = order.paymentMethod;
            item["date"] = order.date;
            allOrdersItem.push(item);
          });
        });
        setorderData(allOrdersItem.reverse());
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadOrderData();
  }, [token]);

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"ORDERS"} />
      </div>

      <div>
        {orderData.length === 0 && (
          <div className="py-16 text-center text-gray-500 text-base">
            You have no orders yet.
          </div>
        )}
        {orderData.map((item, index) => {
          const currentStage = stages.indexOf(item.status);
          const isTracking = trackingIndex === index;
          return (
            <div
              key={index}
              className="py-4 border-t border-gray-300 text-gray-700"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-start gap-6 text-sm">
                  <img className="w-16 sm:w-20" src={item.image[0]} alt="" />
                  <div>
                    <p className="sm:text-base font-medium">{item.name}</p>
                    <div className="flex items-center gap-3 mt-1 text-base text-gray-700">
                      <p>
                        {currency}
                        {item.price}
                      </p>
                      <p>{item.quantity}</p>
                      <p>Size:{item.size}</p>
                    </div>
                    <p className="mt-1">
                      Date:{" "}
                      <span className="text-gray-400">
                        {new Date(item.date).toDateString()}
                      </span>
                    </p>
                    <p className="mt-1">
                      Payment:{" "}
                      <span className="text-gray-400">
                        {item.paymentMethod}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="md:w-1/2 flex justify-between">
                  <div className="flex items-center gap-2">
                    <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                    <p className="text-sm md:text-base">{item.status}</p>
                  </div>

                  <button
                    onClick={() => setTrackingIndex(isTracking ? null : index)}
                    className="border px-4 py-2 text-sm font-medium rounded-sm"
                  >
                    {isTracking ? "Hide Tracking" : "Track Order"}
                  </button>
                </div>
              </div>

              {isTracking && (
                <div className="mt-6 mb-2 px-2">
                  <div className="flex items-center justify-between relative">
                    <div className="absolute top-[6px] left-0 right-0 h-[2px] bg-gray-200 z-0"></div>
                    <div
                      className="absolute top-[6px] left-0 h-[2px] bg-green-500 z-0 transition-all"
                      style={{
                        width:
                          currentStage <= 0
                            ? "0%"
                            : `${(currentStage / (stages.length - 1)) * 100}%`,
                      }}
                    ></div>
                    {stages.map((stage, i) => (
                      <div
                        key={i}
                        className="flex flex-col items-center z-10 flex-1"
                      >
                        <div
                          className={`w-3.5 h-3.5 rounded-full border-2 ${i <= currentStage ? "bg-green-500 border-green-500" : "bg-white border-gray-300"}`}
                        ></div>
                        <p
                          className={`mt-2 text-[10px] sm:text-xs text-center ${i <= currentStage ? "text-gray-700 font-medium" : "text-gray-400"}`}
                        >
                          {stage}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Orders;
