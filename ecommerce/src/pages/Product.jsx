import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext.jsx";
import { assets } from "../assets/assets.js";
import RelatedProducts from "../components/RelatedProducts.jsx";
import { isSizeOutOfStock, isProductOutOfStock } from "../utils/stock.js";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");

  const fetchProductData = async () => {
    const product = products.find((item) => item._id === productId);
    if (product) {
      setProductData(product);
      setImage(product.image[0]);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, products]); // FIX: Added 'products' dependency

  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        {/* product images */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {productData.image?.map((item, index) => (
              <img
                onClick={() => setImage(item)}
                src={item}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>

          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          {productData.storeName && (
            <p className="text-sm text-gray-400 mt-1">
              Sold by {productData.storeName}
            </p>
          )}
          <div className="flex items-center gap-1 mt-2">
            {/* FIX: Changed 'w-3 5' to 'w-3.5' */}
            <img src={assets.star_icon} className="w-3.5" alt="" />
            <img src={assets.star_icon} className="w-3.5" alt="" />
            <img src={assets.star_icon} className="w-3.5" alt="" />
            <img src={assets.star_icon} className="w-3.5" alt="" />
            <img src={assets.star_dull_icon} className="w-3.5" alt="" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}
            {productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          <div className="flex flex-col gap-4 my-8">
            <div className="flex flex-col gap-2">
              <p>Select Size</p>
              <div className="flex gap-2">
                {productData.sizes.map((item, index) => {
                  const disabled = isSizeOutOfStock(productData.stock, item);
                  return (
                    <button
                      key={index}
                      disabled={disabled}
                      onClick={() => !disabled && setSize(item)}
                      className={`border py-2 px-4 ${
                        disabled
                          ? "bg-gray-50 text-gray-300 line-through cursor-not-allowed"
                          : "bg-gray-100"
                      } ${item === size ? "border-orange-500" : ""}`}
                    >
                      {item}
                    </button>
                  );
                })}
              </div>
            </div>
            {isProductOutOfStock(productData.sizes, productData.stock) ? (
              <p className="text-red-500 font-medium">
                This product is currently out of stock.
              </p>
            ) : (
              <button
                onClick={() => addToCart(productData._id, size)}
                disabled={!size || isSizeOutOfStock(productData.stock, size)}
                className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                ADD TO CART
              </button>
            )}
            <hr className="mt-8 sm:w-4/5" />
            <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
              <p>100% Original product</p>
              <p>Cash on delivery is available on this product</p>
              <p>Easy return and exchange policy within 7 days</p>
            </div>
          </div>
        </div>
      </div>

      {/* Description and Reviews */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <b className="border px-5 py-3 text-sm">Reviews (122)</b>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
          <p>
            An e-commerce website is a digital storefront for buying and selling
            products or services online, featuring elements like product
            galleries, shopping carts, and secure payment processing. It allows
            businesses to operate beyond a physical location by providing
            customers with an online shopping experience that includes product
            search, detailed descriptions, and a secure checkout.{" "}
          </p>
          <p>
            It allows businesses to operate beyond a physical location by
            providing customers with an online shopping experience that includes
            product search, detailed descriptions, and a secure checkout.{" "}
          </p>
        </div>
      </div>
      <RelatedProducts
        productId={productData._id}
        category={productData.category}
        subCategory={productData.subCategory}
      />
    </div>
  ) : (
    <div className="opacity-0"></div>
  );
};

export default Product;
