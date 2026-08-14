import React, { useContext, useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { ShopContext } from "../context/ShopContext.jsx";
import { assets } from "../assets/assets.js";
import RelatedProducts from "../components/RelatedProducts.jsx";
import { isSizeOutOfStock, isProductOutOfStock } from "../utils/stock.js";

const Product = () => {
  const { productId } = useParams();
  const { products, currency, addToCart, token, navigate, backendUrl } =
    useContext(ShopContext);
  const [productData, setProductData] = useState(false);
  const [image, setImage] = useState("");
  const [size, setSize] = useState("");
  const [activeTab, setActiveTab] = useState("description");

  const [reviews, setReviews] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [myReview, setMyReview] = useState(null);
  const [formRating, setFormRating] = useState(0);
  const [formComment, setFormComment] = useState("");
  const [reviewImages, setReviewImages] = useState([]);
  const [submittingReview, setSubmittingReview] = useState(false);

  const handleReviewImageChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setReviewImages(files);
  };

  const fetchReviews = async () => {
    try {
      const { data } = await axios.get(backendUrl + "/api/review/" + productId);
      if (data.success) {
        setReviews(data.reviews);
        setAvgRating(data.average);
        setReviewCount(data.count);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const fetchMyReview = async () => {
    if (!token) {
      setMyReview(null);
      setFormRating(0);
      setFormComment("");
      return;
    }
    try {
      const { data } = await axios.post(
        backendUrl + "/api/review/mine",
        { productId },
        { headers: { token } },
      );
      if (data.success && data.review) {
        setMyReview(data.review);
        setFormRating(data.review.rating);
        setFormComment(data.review.comment);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const submitReview = async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    if (formRating === 0) {
      toast.error("Please select a rating");
      return;
    }
    setSubmittingReview(true);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", formRating);
      formData.append("comment", formComment);
      reviewImages.forEach((file) => formData.append("images", file));

      const { data } = await axios.post(
        backendUrl + "/api/review/add",
        formData,
        { headers: { token } },
      );
      if (data.success) {
        toast.success(myReview ? "Review updated" : "Review submitted");
        setMyReview(data.review);
        setReviewImages([]);
        fetchReviews();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setSubmittingReview(false);
    }
  };

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

  useEffect(() => {
    if (productId) {
      fetchReviews();
      fetchMyReview();
    }
  }, [productId, token]);

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
            {[1, 2, 3, 4, 5].map((star) => (
              <img
                key={star}
                src={
                  star <= Math.round(avgRating)
                    ? assets.star_icon
                    : assets.star_dull_icon
                }
                className="w-3.5"
                alt=""
              />
            ))}
            <p className="pl-2">
              {reviewCount > 0
                ? `${avgRating} (${reviewCount})`
                : "No reviews yet"}
            </p>
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
          <b
            onClick={() => setActiveTab("description")}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === "description" ? "bg-gray-50" : ""}`}
          >
            Description
          </b>
          <b
            onClick={() => setActiveTab("reviews")}
            className={`border px-5 py-3 text-sm cursor-pointer ${activeTab === "reviews" ? "bg-gray-50" : ""}`}
          >
            Reviews ({reviewCount})
          </b>
        </div>

        {activeTab === "description" ? (
          <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            <p>
              An e-commerce website is a digital storefront for buying and
              selling products or services online, featuring elements like
              product galleries, shopping carts, and secure payment processing.
              It allows businesses to operate beyond a physical location by
              providing customers with an online shopping experience that
              includes product search, detailed descriptions, and a secure
              checkout.{" "}
            </p>
            <p>
              It allows businesses to operate beyond a physical location by
              providing customers with an online shopping experience that
              includes product search, detailed descriptions, and a secure
              checkout.{" "}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6 border px-6 py-6 text-sm text-gray-500">
            {/* Submit / update review form */}
            <div className="flex flex-col gap-2 pb-6 border-b">
              <p className="text-gray-700 font-medium">
                {myReview ? "Update your review" : "Write a review"}
              </p>
              {!token ? (
                <p>
                  <span
                    onClick={() => navigate("/login")}
                    className="text-black underline cursor-pointer"
                  >
                    Login
                  </span>{" "}
                  to write a review.
                </p>
              ) : (
                <>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <img
                        key={star}
                        onClick={() => setFormRating(star)}
                        src={
                          star <= formRating
                            ? assets.star_icon
                            : assets.star_dull_icon
                        }
                        className="w-5 cursor-pointer"
                        alt=""
                      />
                    ))}
                  </div>
                  <textarea
                    value={formComment}
                    onChange={(e) => setFormComment(e.target.value)}
                    placeholder="Share your thoughts about this product (optional)"
                    className="border px-3 py-2 w-full sm:w-3/4 mt-1"
                    rows={3}
                  />

                  <div className="mt-2">
                    <label className="text-sm text-gray-700 block mb-1">
                      Add photos (up to 4)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleReviewImageChange}
                      className="text-sm"
                    />
                    {reviewImages.length > 0 ? (
                      <div className="flex gap-2 mt-2">
                        {reviewImages.map((file, i) => (
                          <img
                            key={i}
                            src={URL.createObjectURL(file)}
                            className="w-16 h-16 object-cover border rounded"
                            alt=""
                          />
                        ))}
                      </div>
                    ) : myReview?.images?.length > 0 ? (
                      <div className="flex gap-2 mt-2">
                        {myReview.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            className="w-16 h-16 object-cover border rounded"
                            alt=""
                          />
                        ))}
                        <p className="text-xs text-gray-400 self-center">
                          Choosing new photos will replace these.
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <button
                    onClick={submitReview}
                    disabled={submittingReview}
                    className="mt-2 bg-black text-white px-6 py-2 text-sm w-fit disabled:opacity-50"
                  >
                    {submittingReview
                      ? "Saving..."
                      : myReview
                        ? "Update Review"
                        : "Submit Review"}
                  </button>
                </>
              )}
            </div>

            {/* Review list */}
            {reviews.length === 0 ? (
              <p>No reviews yet — be the first to review this product.</p>
            ) : (
              <div className="flex flex-col gap-4">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b pb-4">
                    <div className="flex items-center gap-2">
                      <p className="text-gray-700 font-medium">{r.userName}</p>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <img
                            key={star}
                            src={
                              star <= r.rating
                                ? assets.star_icon
                                : assets.star_dull_icon
                            }
                            className="w-3"
                            alt=""
                          />
                        ))}
                      </div>
                    </div>
                    {r.comment && <p className="mt-1">{r.comment}</p>}
                    {r.images && r.images.length > 0 && (
                      <div className="flex gap-2 mt-2">
                        {r.images.map((img, i) => (
                          <img
                            key={i}
                            src={img}
                            className="w-16 h-16 object-cover border rounded cursor-pointer"
                            onClick={() => window.open(img, "_blank")}
                            alt=""
                          />
                        ))}
                      </div>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(r.date).toDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
