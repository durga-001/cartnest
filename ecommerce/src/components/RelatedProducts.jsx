import React, { useContext, useState, useEffect } from "react";
import axios from "axios";
import { ShopContext } from "../context/ShopContext";
import Title from "./Title";
import ProductItem from "./ProductItem";

const RelatedProducts = ({ productId, category, subCategory }) => {
  const { products, backendUrl } = useContext(ShopContext);
  const [related, setRelated] = useState([]);

  useEffect(() => {
    if (products.length === 0) return;

    const categoryFallback = () => {
      const productsCopy = products
        .slice()
        .filter(
          (item) =>
            item.category === category &&
            item.subCategory === subCategory &&
            item._id !== productId,
        );
      setRelated(productsCopy.slice(0, 5));
    };

    if (!productId) {
      categoryFallback();
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const response = await axios.post(
          backendUrl + "/api/product/recommendations",
          { productId },
        );
        if (response.data.success && response.data.products.length > 0) {
          setRelated(response.data.products);
        } else {
          categoryFallback();
        }
      } catch (error) {
        console.log(error);
        categoryFallback();
      }
    };

    fetchRecommendations();
  }, [products, productId, category, subCategory]);

  return (
    <div className="my-24">
      <div className="text-center text-3xl py-2">
        <Title text1={"RELATED"} text2={"PRODUCTS"} />
      </div>

      <div className="grid grid-cols sm:grid-cols-4 lg:grid-cols-5 gap-4 gap-y-6">
        {related.map((item, index) => (
          <ProductItem
            key={index}
            id={item._id}
            name={item.name}
            price={item.price}
            image={item.image}
          />
        ))}
      </div>
    </div>
  );
};

export default RelatedProducts;
