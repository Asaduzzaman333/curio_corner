import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "../context/CartContext.jsx";

const MediaRenderer = ({ src, alt, className }) => {
  const safeSrc = typeof src === 'string' ? src : '';

  const isVideoUrl = Boolean(safeSrc.includes('/video/upload/') || safeSrc.match(/\.(mp4|webm|ogg|mov)$/i));
  const [type, setType] = useState(isVideoUrl ? "video" : "image");
  const [errorCount, setErrorCount] = useState(0);

  useEffect(() => {
    setType(isVideoUrl ? "video" : "image");
    setErrorCount(0);
  }, [safeSrc, isVideoUrl]);

  if (!safeSrc) return null;

  if (type === "video") {
    return (
      <video
        src={safeSrc}
        autoPlay
        loop
        muted
        playsInline
        className={className}
        onError={() => {
          if (errorCount === 0 && !isVideoUrl) {
            setType("image");
            setErrorCount(1);
          }
        }}
      />
    );
  }

  return (
    <img
      src={safeSrc}
      alt={alt}
      className={className}
      loading="lazy"
      onError={() => {
        if (errorCount === 0 && !isVideoUrl) {
          setType("video");
          setErrorCount(1);
        }
      }}
    />
  );
};

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const image = product.images?.[0]?.url || "/assets/cover.jpg";
  const price = product.discountPrice || product.price;

  return (
    <motion.article whileHover={{ y: -8 }} className="group flex h-full flex-col overflow-hidden rounded-[28px] bg-vellum shadow-soft ring-1 ring-ink/5 dark:bg-[#211915] dark:ring-white/10">
      <Link to={`/products/${product.slug}`} className="block overflow-hidden">
        <div className="aspect-[4/5] overflow-hidden bg-paper">
          <MediaRenderer src={image} alt={product.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex flex-wrap gap-2">
          <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-semibold text-clay">{product.category}</span>
          {product.tags?.slice(0, 1).map((tag) => (
            <span key={tag} className="rounded-full bg-sage/10 px-3 py-1 text-xs font-semibold text-sage">{tag}</span>
          ))}
        </div>
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-display text-xl font-bold leading-tight">{product.name}</h3>
        </Link>
        <p className="mt-2 min-h-[3rem] line-clamp-2 text-sm leading-6 text-ink/65 dark:text-vellum/65">{product.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 pt-5">
          <div>
            <span className="text-lg font-bold">৳{price}</span>
            {product.discountPrice && <span className="ml-2 text-sm text-ink/45 line-through dark:text-vellum/45">৳{product.price}</span>}
          </div>
          <button onClick={() => addItem(product)} className="focus-ring rounded-full bg-ink p-3 text-vellum transition hover:bg-clay dark:bg-vellum dark:text-ink">
            <ShoppingBag size={18} />
          </button>
        </div>
      </div>
    </motion.article>
  );
}
