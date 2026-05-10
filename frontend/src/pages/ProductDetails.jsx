import { Link, useParams } from "react-router-dom";
import { PlayCircle, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext.jsx";
import { api } from "../utils/api.js";
import { fallbackProducts } from "../data/fallback.js";

export default function ProductDetails() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [product, setProduct] = useState(() => fallbackProducts.find((item) => item.slug === slug) || fallbackProducts[0]);
  const [active, setActive] = useState(product.images?.[0]?.url || "/assets/cover.jpg");

  useEffect(() => {
    let mounted = true;
    api
      .get(`/products/${slug}`)
      .then(({ data }) => {
        if (mounted) {
          setProduct(data);
          setActive(data.images?.[0]?.url || "/assets/cover.jpg");
        }
      })
      .catch(() => {
        const fallback = fallbackProducts.find((item) => item.slug === slug);
        if (fallback) {
          setProduct(fallback);
          setActive(fallback.images?.[0]?.url || "/assets/cover.jpg");
        } else {
          toast.error("Product unavailable");
        }
      });
    return () => {
      mounted = false;
    };
  }, [slug]);

  const price = product.discountPrice || product.price;

  return (
    <section className="min-h-screen px-5 pb-24 pt-32">
      <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <div className="overflow-hidden rounded-[36px] bg-vellum shadow-soft dark:bg-[#211915]">
            <img src={active} alt={product.name} className="aspect-[4/4.4] w-full object-cover" />
          </div>
          <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
            {(product.images?.length ? product.images : [{ url: "/assets/cover.jpg" }]).map((image) => (
              <button key={image.url} onClick={() => setActive(image.url)} className={`h-20 w-20 shrink-0 overflow-hidden rounded-2xl border-2 ${active === image.url ? "border-clay" : "border-transparent"}`}>
                <img src={image.url} alt={image.alt || product.name} className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:sticky lg:top-28 lg:self-start">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.32em] text-clay">{product.category}</p>
          <h1 className="font-display text-5xl font-bold leading-tight">{product.name}</h1>
          <p className="mt-5 text-lg leading-8 text-ink/68 dark:text-vellum/68">{product.description}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {product.tags?.map((tag) => <span key={tag} className="rounded-full bg-sage/10 px-3 py-1 text-sm font-semibold text-sage">{tag}</span>)}
            <span className="rounded-full bg-gold/15 px-3 py-1 text-sm font-semibold text-gold">{product.stockStatus}</span>
          </div>
          <div className="mt-8 flex items-end gap-3">
            <span className="text-4xl font-bold">৳{price}</span>
            {product.discountPrice && <span className="pb-1 text-lg text-ink/45 line-through dark:text-vellum/45">৳{product.price}</span>}
          </div>
          <button onClick={() => addItem(product)} className="mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full bg-ink px-6 py-4 font-semibold text-vellum shadow-lift transition hover:bg-clay dark:bg-vellum dark:text-ink">
            <ShoppingBag size={19} /> Add to Cart
          </button>
          {product.videoUrl && (
            <a href={product.videoUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-ink/10 px-6 py-4 font-semibold hover:text-clay dark:border-white/10">
              <PlayCircle size={19} /> Watch Product Video
            </a>
          )}
          <Link to="/checkout" className="mt-4 block text-center text-sm font-semibold text-clay">Go to checkout</Link>
        </div>
      </div>
    </section>
  );
}
