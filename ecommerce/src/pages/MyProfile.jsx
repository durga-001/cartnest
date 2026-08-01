import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext";
import Title from "../components/Title";

const MyProfile = () => {
  const { backendUrl, token, navigate } = useContext(ShopContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }
    fetchProfile();
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

          <button
            onClick={() => navigate("/orders")}
            className="border border-black px-6 py-3 text-sm hover:bg-black hover:text-white transition-all duration-500 mt-2 w-fit"
          >
            View My Orders
          </button>
        </div>
      )}
    </div>
  );
};

export default MyProfile;
