import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const MyProfile = () => {
  const { backendUrl, token, navigate, currency } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/user/profile",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setProfile(response.data.user);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderHistory = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/order/userorders",
        {},
        { headers: { token } },
      );
      if (response.data.success) {
        setOrders(response.data.orders.reverse());
      }
    } catch (error) {
      console.log(error);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
    fetchOrderHistory();
  }, [token]);

  if (loading) {
    return (
      <p className="text-center mt-14 text-gray-500">Loading profile...</p>
    );
  }

  return (
    <div className="border-t pt-16">
      <div className="text-2xl">
        <Title text1={"MY"} text2={"PROFILE"} />
      </div>

      {profile && (
        <div className="max-w-md border border-gray-300 p-6 mt-6 flex flex-col gap-4">
          <div>
            <p className="text-xs text-gray-500 uppercase">Name</p>
            <p className="text-base text-gray-800">{profile.name}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 uppercase">Email</p>
            <p className="text-base text-gray-800">{profile.email}</p>
          </div>
        </div>
      )}

      <div className="mt-10">
        <p className="text-xl font-medium mb-4">Order History</p>

        {ordersLoading && (
          <p className="text-gray-500 text-sm">Loading your orders...</p>
        )}

        {!ordersLoading && orders.length === 0 && (
          <p className="text-gray-500 text-sm">
            You haven't placed any orders yet.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {orders.map((order, index) => (
            <div
              key={index}
              className="border border-gray-300 p-4 flex flex-col gap-2"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-gray-600">
                <p>
                  Order placed:{" "}
                  <span className="text-gray-800">
                    {new Date(order.date).toDateString()}
                  </span>
                </p>
                <div className="flex items-center gap-2">
                  <p className="min-w-2 h-2 rounded-full bg-green-500"></p>
                  <p>{order.status}</p>
                </div>
              </div>

              <div className="flex flex-col gap-1 text-sm text-gray-700">
                {order.items.map((item, itemIndex) => (
                  <p key={itemIndex}>
                    {item.name} x {item.quantity}{" "}
                    <span className="text-gray-400">({item.size})</span>
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                <p>Payment: {order.paymentMethod}</p>
                <p className="font-medium text-gray-800">
                  {currency}
                  {order.amount}
                </p>
              </div>
            </div>
          ))}
        </div>

        {!ordersLoading && orders.length > 0 && (
          <button
            onClick={() => navigate("/orders")}
            className="border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition-all duration-500 mt-4"
          >
            View Full Order Tracking
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
