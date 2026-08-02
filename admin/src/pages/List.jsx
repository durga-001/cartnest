import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { backendUrl, currency } from "../App";
import { toast } from "react-toastify";

const List = ({ token }) => {
  const [list, setList] = useState([]);
  const fetchList = async () => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/mylist",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        setList(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  const removeProduct = async (id) => {
    try {
      const response = await axios.post(
        backendUrl + "/api/product/remove",
        { id },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (response.data.success) {
        toast.success(response.data.message);
        await fetchList();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };
  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className="mb-2">My Products</p>
      <div className="flex flex-col gap-2 ">
        <div className="hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>

        {list.map((item, index) => (
          <div
            className="grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm"
            key={index}
          >
            <img className="w-12" src={item.image[0]} alt="" />
            <p>{item.name}</p>
            <p>{item.category}</p>
            <p>
              {currency}
              {item.price}
            </p>
            <div className="flex items-center gap-3 md:justify-center">
              <Link
                to={`/edit/${item._id}`}
                className="text-xs underline cursor-pointer"
              >
                Edit
              </Link>
              <p
                onClick={() => removeProduct(item._id)}
                className="cursor-pointer text-lg"
              >
                X
              </p>
            </div>
          </div>
        ))}

        {list.length === 0 && (
          <p className="text-gray-500 text-sm mt-2">
            You haven't added any products yet.
          </p>
        )}
      </div>
    </>
  );
};

export default List;
