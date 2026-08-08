import React, { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import { Link } from "react-router-dom";
import { isProductOutOfStock } from "../utils/stock";

const ProductItem = ({ id, image, name, price, storeName, sizes, stock }) => {
  const { currency } = useContext(ShopContext);
  const outOfStock = isProductOutOfStock(sizes, stock);

  return (
    <Link className="text-gray-700 cursor-pointer" to={`/product/${id}`}>
      <div className="overflow-hidden relative">
        <img
          className={`hover:scale-110 transition ease-in-out ${outOfStock ? "opacity-50" : ""}`}
          src={Array.isArray(image) ? image[0] : image}
          alt={name}
        />
        {outOfStock && (
          <span className="absolute top-2 left-2 bg-black text-white text-[10px] px-2 py-1 rounded">
            Out of Stock
          </span>
        )}
      </div>
      {storeName && <p className="pt-2 text-xs text-gray-400">{storeName}</p>}
      <p className="pt-1 pb-1 text-sm">{name}</p>
      <p className="text-sm font-medium">
        {currency}
        {price}
      </p>
    </Link>
  );
};

export default ProductItem;
